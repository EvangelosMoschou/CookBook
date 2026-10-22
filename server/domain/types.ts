/** Shared vocabulary shared by the API and the client. */

export type VerificationStatus = 'Verified' | 'Unverified' | 'Pending';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export type JobStatus = 'draft' | 'published';

export interface Recipe {
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

export interface Comment {
  id: number;
  recipeId: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface JobListing {
  id: number;
  title: string;
  description: string;
  location: string;
  minCompensation: number | null;
  maxCompensation: number | null;
  employmentType: EmploymentType;
  skills: string[];
  status: JobStatus;
  createdAt: string;
}

export interface User {
  id: number;
  handle: string;
  displayName: string;
  verificationStatus: VerificationStatus;
  hasBan: boolean;
  createdAt: string;
}

export interface Page<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
