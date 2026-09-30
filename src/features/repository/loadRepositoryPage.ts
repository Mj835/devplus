/**
 * The repository page's chunk loader, kept in its own module so the router (lazy route) and
 * search results (preload on hover/focus) can share it without importing the page itself.
 */
export const loadRepositoryPage = () => import('./RepositoryPage');
