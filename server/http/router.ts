import { Router, type Request } from 'express';
import { HttpError, forbidden, notFound, parseId, requireString, unprocessable } from './errors';
import { countComments, createComment, listComments } from '../repositories/comments';
import { countJobs, createJob, getJob, listJobs } from '../repositories/jobs';
import { countRecipes, getRecipe, listRecipes } from '../repositories/recipes';
import { countUsers, findByHandle } from '../repositories/users';
import { findViolation } from '../domain/moderation';
import type { EmploymentType } from '../domain/types';

const MAX_PAGE_SIZE = 100;

function paging(req: Request): { limit: number; offset: number } {
  const rawLimit = Number(req.query.limit ?? MAX_PAGE_SIZE);
  const rawOffset = Number(req.query.offset ?? 0);

  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_PAGE_SIZE)
    : MAX_PAGE_SIZE;
  const offset = Number.isFinite(rawOffset) ? Math.max(Math.trunc(rawOffset), 0) : 0;

  return { limit, offset };
}

/** Resolves the caller from the x-user-handle header. Absent header = anonymous. */
function currentUser(req: Request) {
  const handle = req.header('x-user-handle');
  return handle ? findByHandle(handle) : null;
}

function accountErrorFor(user: { verificationStatus: string; hasBan: boolean }): string | null {
  if (user.verificationStatus === 'Unverified' && user.hasBan) {
    return 'Account must be verified and penalty-free!';
  }
  if (user.verificationStatus === 'Unverified') return 'Account verification required to post jobs!';
  if (user.verificationStatus === 'Pending') return 'Your verification is currently under review!';
  if (user.hasBan) return 'Access denied: Your account has an active ban!';
  return null;
}

export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: 'connected',
      counts: {
        recipes: countRecipes(),
        comments: countComments(),
        jobs: countJobs(),
        users: countUsers(),
      },
    });
  });

  // ── Recipes ────────────────────────────────────────────────────────────────

  router.get('/recipes', (req, res) => {
    const { limit, offset } = paging(req);
    res.json(listRecipes(limit, offset));
  });

  router.get('/recipes/:id', (req, res) => {
    const recipe = getRecipe(parseId(req.params.id));
    if (!recipe) throw notFound('Recipe not found');
    res.json(recipe);
  });

  // ── Comments ───────────────────────────────────────────────────────────────

  router.get('/recipes/:id/comments', (req, res) => {
    const recipeId = parseId(req.params.id);
    if (!getRecipe(recipeId)) throw notFound('Recipe not found');
    res.json({ data: listComments(recipeId) });
  });

  router.post('/recipes/:id/comments', (req, res) => {
    const recipeId = parseId(req.params.id);
    if (!getRecipe(recipeId)) throw notFound('Recipe not found');

    const text = requireString((req.body as { text?: unknown })?.text, 'text');

    const user = currentUser(req);
    if (user?.hasBan) throw forbidden('Comment posting not available - Banned account!');

    const violation = findViolation(text);
    if (violation) {
      throw unprocessable('Comment not posted - Rules violation!', { word: violation });
    }

    const comment = createComment({
      recipeId,
      userId: user?.id ?? null,
      author: user?.displayName ?? 'Guest',
      text,
    });

    res.status(201).json(comment);
  });

  // ── Job listings ───────────────────────────────────────────────────────────

  router.get('/jobs', (req, res) => {
    const { limit, offset } = paging(req);
    res.json(listJobs(limit, offset));
  });

  router.get('/jobs/:id', (req, res) => {
    const job = getJob(parseId(req.params.id));
    if (!job) throw notFound('Job listing not found');
    res.json(job);
  });

  router.post('/jobs', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;

    const user = currentUser(req);
    if (user) {
      const accountError = accountErrorFor(user);
      if (accountError) throw forbidden(accountError);
    }

    const employmentType = body.employmentType;
    if (
      employmentType !== 'Full-time' &&
      employmentType !== 'Part-time' &&
      employmentType !== 'Contract'
    ) {
      throw unprocessable('Employment type is required', { missing: ['Employment Type'] });
    }

    const missing: string[] = [];
    if (typeof body.title !== 'string' || !body.title.trim()) missing.push('Job Title');
    if (typeof body.description !== 'string' || !body.description.trim()) missing.push('Job Description');
    if (typeof body.location !== 'string' || !body.location.trim()) missing.push('Location');

    const min = body.minCompensation == null ? null : Number(body.minCompensation);
    const max = body.maxCompensation == null ? null : Number(body.maxCompensation);
    if (min === null || max === null || Number.isNaN(min) || Number.isNaN(max)) {
      missing.push('Compensation Range');
    } else if (max < min) {
      throw unprocessable('Maximum compensation cannot be below minimum', {
        missing: ['Compensation Range'],
      });
    }

    if (missing.length > 0) {
      throw unprocessable('Required job details missing', { missing });
    }

    const skills = Array.isArray(body.skills)
      ? body.skills.filter((skill): skill is string => typeof skill === 'string')
      : String(body.skills ?? '')
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean);

    const job = createJob({
      postedBy: user?.id ?? null,
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      location: String(body.location).trim(),
      minCompensation: min,
      maxCompensation: max,
      employmentType: employmentType as EmploymentType,
      skills,
      status: 'published',
    });

    res.status(201).json(job);
  });

  // ── Users ──────────────────────────────────────────────────────────────────

  router.get('/users/:handle', (req, res) => {
    const user = findByHandle(req.params.handle);
    if (!user) throw notFound('User not found');
    res.json(user);
  });

  router.use((_req, _res, next) => next(new HttpError(404, 'Unknown API route')));

  return router;
}
