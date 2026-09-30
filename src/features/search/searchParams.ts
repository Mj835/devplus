import type { SearchType } from '../../api/types';

/** What is being searched. Lives only in the URL (?q=&type=&page=), never duplicated in React state. */
export interface SearchState {
  q: string;
  type: SearchType;
  page: number;
}

export function parseSearchParams(params: URLSearchParams): SearchState {
  const page = Number(params.get('page'));
  return {
    q: params.get('q')?.trim() ?? '',
    type: params.get('type') === 'users' ? 'users' : 'repositories',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Defaults (repositories, page 1) are left out so URLs stay short and canonical. */
export function toSearchParams({ q, type, page }: SearchState): URLSearchParams {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (type !== 'repositories') params.set('type', type);
  if (page > 1) params.set('page', String(page));
  return params;
}
