import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Key } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ApiTokenModal } from '../ApiTokenModal';
import { getStoredToken, TOKEN_CHANGED_EVENT } from '../../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { btnIcon } from '../../styles/classes';

export function Navbar() {
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [hasToken, setHasToken] = useState(() => Boolean(getStoredToken()));
  const queryClient = useQueryClient();

  // The token can also be changed from an error card's dialog, so listen rather than set locally.
  useEffect(() => {
    const sync = () => setHasToken(Boolean(getStoredToken()));
    window.addEventListener(TOKEN_CHANGED_EVENT, sync);
    return () => window.removeEventListener(TOKEN_CHANGED_EVENT, sync);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-glass backdrop-blur-[14px] border-b border-line px-5 py-[0.85rem] transition-[background,border-color] duration-[250ms]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4 max-md:flex-wrap">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex flex-col text-fg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px] bg-(image:--accent-gradient) text-white shadow-glow shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="inline-block text-[1.125rem] font-extrabold tracking-[-0.03em] text-gradient">
                    DevPulse
                  </span>
                  {/* Phones: hidden so the sticky header stays one row instead of eating ~20% of the screen. */}
                  <div className="text-[0.7rem] font-semibold text-fg-muted tracking-[0.04em] uppercase max-sm:hidden">
                    Engineering Intelligence
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-[0.4rem] px-[0.65rem] py-[0.3rem] rounded-full text-[0.75rem] font-semibold bg-primary-light text-primary border border-line cursor-pointer hover:border-primary"
              onClick={() => setTokenModalOpen(true)}
              title="GitHub API token configuration"
            >
              <Key size={13} aria-hidden="true" />
              {/* Full label on larger screens, a short one on phones, icon only on the narrowest; always one accessible name. */}
              <span className="max-sm:sr-only">{hasToken ? 'API Token Active (5k/hr)' : 'Free Tier (60/hr)'}</span>
              <span aria-hidden="true" className="sm:hidden max-[359px]:hidden">
                {hasToken ? '5k/hr' : '60/hr'}
              </span>
            </button>

            <ThemeToggle />

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={btnIcon}
              aria-label="GitHub Website"
              title="Open GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <ApiTokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onTokenChanged={() => queryClient.invalidateQueries()}
      />
    </>
  );
}
