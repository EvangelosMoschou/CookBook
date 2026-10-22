import { getDb } from '../db/connection';
import type { EmploymentType, JobListing, JobStatus, Page } from '../domain/types';

interface JobRow {
  id: number;
  title: string;
  description: string;
  location: string;
  min_compensation: number | null;
  max_compensation: number | null;
  employment_type: EmploymentType;
  skills: string;
  status: JobStatus;
  created_at: string;
}

const toJob = (row: JobRow): JobListing => ({
  id: row.id,
  title: row.title,
  description: row.description,
  location: row.location,
  minCompensation: row.min_compensation,
  maxCompensation: row.max_compensation,
  employmentType: row.employment_type,
  skills: JSON.parse(row.skills) as string[],
  status: row.status,
  createdAt: row.created_at,
});

export function listJobs(limit: number, offset: number): Page<JobListing> {
  const db = getDb();
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM job_listings').get() as { total: number };
  const rows = db
    .prepare('SELECT * FROM job_listings ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as JobRow[];

  return { data: rows.map(toJob), total, limit, offset };
}

export function getJob(id: number): JobListing | null {
  const row = getDb().prepare('SELECT * FROM job_listings WHERE id = ?').get(id) as JobRow | undefined;
  return row ? toJob(row) : null;
}

export interface NewJob {
  postedBy: number | null;
  title: string;
  description: string;
  location: string;
  minCompensation: number | null;
  maxCompensation: number | null;
  employmentType: EmploymentType;
  skills: string[];
  status: JobStatus;
}

export function createJob(input: NewJob): JobListing {
  const info = getDb()
    .prepare(
      `INSERT INTO job_listings
         (posted_by, title, description, location, min_compensation, max_compensation, employment_type, skills, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.postedBy,
      input.title,
      input.description,
      input.location,
      input.minCompensation,
      input.maxCompensation,
      input.employmentType,
      JSON.stringify(input.skills),
      input.status,
    );

  const created = getJob(Number(info.lastInsertRowid));
  if (!created) throw new Error('Job insert failed');
  return created;
}

export function countJobs(): number {
  const { total } = getDb().prepare('SELECT COUNT(*) AS total FROM job_listings').get() as {
    total: number;
  };
  return total;
}
