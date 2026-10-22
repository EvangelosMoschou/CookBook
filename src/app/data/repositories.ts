import { apiRequest } from './client';

// ─── Wire types (mirror server/domain/types.ts) ───────────────────────────────

export interface RecipeDto {
  id: number;
  name: string;
  category: string;
  author: string;
  ingredients: string[];
  instructions: string;
  rating: number;
  ranking: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface CommentDto {
  id: number;
  recipeId: number;
  author: string;
  text: string;
  createdAt: string;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';

export interface JobListingDto {
  id: number;
  title: string;
  description: string;
  location: string;
  minCompensation: number | null;
  maxCompensation: number | null;
  employmentType: EmploymentType;
  skills: string[];
  status: 'draft' | 'published';
  createdAt: string;
}

export interface PageDto<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface HealthDto {
  status: string;
  database: string;
  counts: { recipes: number; comments: number; jobs: number; users: number };
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export const listRecipes = (limit = 100, offset = 0) =>
  apiRequest<PageDto<RecipeDto>>(`/recipes?limit=${limit}&offset=${offset}`);

export const getRecipe = (id: number) => apiRequest<RecipeDto>(`/recipes/${id}`);

// ─── Comments ─────────────────────────────────────────────────────────────────

export const listComments = (recipeId: number) =>
  apiRequest<{ data: CommentDto[] }>(`/recipes/${recipeId}/comments`);

export const createComment = (recipeId: number, text: string) =>
  apiRequest<CommentDto>(`/recipes/${recipeId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

// ─── Job listings ─────────────────────────────────────────────────────────────

export const listJobs = (limit = 100, offset = 0) =>
  apiRequest<PageDto<JobListingDto>>(`/jobs?limit=${limit}&offset=${offset}`);

export interface NewJobInput {
  title: string;
  description: string;
  location: string;
  minCompensation: number | null;
  maxCompensation: number | null;
  employmentType: EmploymentType;
  skills: string[];
}

export const createJob = (input: NewJobInput) =>
  apiRequest<JobListingDto>('/jobs', { method: 'POST', body: JSON.stringify(input) });

// ─── Health ───────────────────────────────────────────────────────────────────

export const getHealth = () => apiRequest<HealthDto>('/health');
