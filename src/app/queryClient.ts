import { QueryClient } from '@tanstack/react-query';
import { GitHubError } from '../api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // GitHub data changes slowly and the unauthenticated budget is tiny: reuse responses.
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      // Only transient failures are retried; rate limits and 4xx would just burn quota.
      retry: (failureCount, error) => error instanceof GitHubError && error.retryable && failureCount < 2,
    },
  },
});
