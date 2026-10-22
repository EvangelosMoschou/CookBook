import type { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details);
export const forbidden = (message: string) => new HttpError(403, message);
export const notFound = (message = 'Not found') => new HttpError(404, message);
export const unprocessable = (message: string, details?: unknown) => new HttpError(422, message, details);

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: { message: `No route for ${req.method} ${req.path}` } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message, details: err.details } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}

export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw badRequest(`Invalid id: ${value}`);
  return id;
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw unprocessable(`${field} is required`);
  }
  return value.trim();
}

export function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}
