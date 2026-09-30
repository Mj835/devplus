import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { Navbar } from '../components/layout/Navbar';
import { loadRepositoryPage } from '../features/repository/loadRepositoryPage';
import { NotFoundPage } from './NotFoundPage';
import { queryClient } from './queryClient';
import { RouteErrorBoundary } from './RouteErrorBoundary';

// Route-level code splitting: each page is its own chunk, fetched on first visit.
const SearchPage = lazy(() => import('../features/search/SearchPage').then((m) => ({ default: m.SearchPage })));
const RepositoryPage = lazy(() => loadRepositoryPage().then((m) => ({ default: m.RepositoryPage })));

function PageFallback() {
  return (
    <p role="status" className="py-14 text-center text-fg-muted">
      Loading…
    </p>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  return (
    // Keyed by pathname so an error on one page doesn't stick after navigating away.
    <RouteErrorBoundary key={pathname}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/repos/:owner/:repo" element={<RepositoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <a
          className="absolute -left-[9999px] z-[999] focus:left-4 focus:top-4 focus:bg-surface focus:text-primary focus:px-[1.2rem] focus:py-[0.6rem] focus:rounded-[8px] focus:shadow-card focus:border focus:border-line-strong"
          href="#main"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="w-full max-w-[1240px] mx-auto pt-7 px-5 pb-16 flex-1">
          <AppRoutes />
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
