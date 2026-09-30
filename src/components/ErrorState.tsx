import { useState } from 'react';
import { AlertTriangle, WifiOff, Clock, RotateCcw, Key } from 'lucide-react';
import { GitHubError } from '../api/client';
import { formatTime } from '../lib/format';
import { ApiTokenModal } from './ApiTokenModal';
import { useQueryClient } from '@tanstack/react-query';
import { btnPrimary, btnSecondary, stateDesc, stateErrorContainer, stateIcon, stateTitle } from '../styles/classes';

const btnRetry =
  'inline-flex items-center gap-[0.4rem] px-[1.15rem] py-2 rounded-[8px] text-[0.875rem] font-semibold bg-primary text-white border-none cursor-pointer mt-2 transition-all hover:bg-primary-hover';

interface Props {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

function describe(error: unknown): string {
  if (!(error instanceof GitHubError)) return 'An unexpected error occurred while communicating with GitHub.';
  switch (error.kind) {
    case 'rate-limit':
      return error.resetAt
        ? `GitHub's rate limit was reached. It resets at ${formatTime(error.resetAt)}. You can add a personal access token to get 5,000 requests/hr.`
        : "GitHub's rate limit was reached. Please wait a moment or configure an API token for higher limits.";
    case 'network':
      return 'Could not reach GitHub. Please check your internet connection and try again.';
    case 'invalid':
      return `GitHub rejected the request: ${error.message}`;
    default:
      return error.message;
  }
}

export function ErrorState({ error, title = 'Something went wrong', onRetry }: Props) {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const isRateLimit = error instanceof GitHubError && error.kind === 'rate-limit';
  const isNetwork = error instanceof GitHubError && error.kind === 'network';

  const getIcon = () => {
    if (isRateLimit) return <Clock size={28} />;
    if (isNetwork) return <WifiOff size={28} />;
    return <AlertTriangle size={28} />;
  };

  return (
    <>
      <div className={stateErrorContainer} role="alert">
        <div className={`${stateIcon} bg-danger-bg text-danger`}>{getIcon()}</div>
        <h3 className={stateTitle}>{title}</h3>
        <p className={stateDesc}>{describe(error)}</p>

        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          {isRateLimit && (
            <button type="button" className={btnPrimary} onClick={() => setTokenModalOpen(true)}>
              <Key size={15} />
              <span>Configure API Token</span>
            </button>
          )}

          {onRetry && !(error instanceof GitHubError && error.kind === 'invalid') && (
            <button type="button" className={isRateLimit ? btnSecondary : btnRetry} onClick={onRetry}>
              <RotateCcw size={15} />
              <span>Try again</span>
            </button>
          )}
        </div>
      </div>

      <ApiTokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        // invalidateQueries already refetches every active query, including this one.
        onTokenChanged={() => queryClient.invalidateQueries()}
      />
    </>
  );
}
