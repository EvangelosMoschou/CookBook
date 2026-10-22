export type DataSource = 'mock' | 'api';

/**
 * Selects where the UI reads its data from.
 *
 *   mock — deterministic in-memory data, used by the scenario demo harness
 *   api  — the SQLite-backed HTTP API (see server/)
 *
 * Set VITE_DATA_SOURCE=api to run against the real database.
 */
export const DATA_SOURCE: DataSource = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'mock';

export const isApiMode = DATA_SOURCE === 'api';
