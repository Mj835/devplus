import { useSearchParams } from 'react-router';
import { parseSearchParams, toSearchParams, type SearchState } from './searchParams';

/** URL-backed search state: `[state, update]`, where update merges and writes back to the URL. */
export function useSearchState() {
  const [params, setParams] = useSearchParams();
  const state = parseSearchParams(params);

  const update = (next: Partial<SearchState>, options?: { replace?: boolean }) =>
    setParams(toSearchParams({ ...state, ...next }), options);

  return [state, update] as const;
}
