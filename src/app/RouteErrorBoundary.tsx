import { Component, type ErrorInfo, type ReactNode } from 'react';
import { btnPrimary, stateDesc, stateErrorContainer, stateTitle } from '../styles/classes';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Vite reports a failed dynamic import this way, e.g. when a new deploy removed an old chunk. */
const isChunkLoadError = (error: Error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message);

/**
 * Last line of defence for render errors and failed lazy-route loads. API errors never reach it:
 * those are handled in place by ErrorState. Keyed by pathname in App so navigating away resets it.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Console only for now; wire to an error-reporting service (Sentry etc.) in production.
    console.error('Route crashed', error, info.componentStack);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunk = isChunkLoadError(error);
    return (
      <div className={stateErrorContainer} role="alert">
        <h2 className={stateTitle}>{chunk ? 'A new version is available' : 'Something went wrong'}</h2>
        <p className={stateDesc}>
          {chunk
            ? 'This page could not be loaded, usually because the app was updated. Reload to get the latest version.'
            : 'An unexpected error stopped this page from rendering. Reloading usually fixes it.'}
        </p>
        <button type="button" className={`${btnPrimary} mt-2`} onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}
