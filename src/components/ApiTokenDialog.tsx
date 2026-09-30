import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Key, X, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { getStoredToken, setStoredToken } from '../api/client';
import { btnCard, btnGhostIcon, btnPrimary, btnSecondary } from '../styles/classes';

export interface ApiTokenDialogProps {
  onClose: () => void;
  onTokenChanged: () => void;
}

/**
 * Native modal <dialog>: showModal() gives focus containment, an inert page behind it and the top layer.
 * Mounted only while open (see ApiTokenModal), so the input re-reads the current token each time.
 */
export function ApiTokenDialog({ onClose, onTokenChanged }: ApiTokenDialogProps) {
  const [tokenInput, setTokenInput] = useState(() => getStoredToken() || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    inputRef.current?.focus();
    return () => {
      clearTimeout(closeTimer.current);
      dialog?.close();
      opener?.focus();
    };
  }, []);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setStoredToken(tokenInput.trim() || null);
    setSavedSuccess(true);
    closeTimer.current = setTimeout(() => {
      setSavedSuccess(false);
      onTokenChanged();
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setStoredToken(null);
    setTokenInput('');
    onTokenChanged();
  };

  return (
    // Backdrop click is a mouse convenience; keyboard users have Escape (onCancel) and the Close button.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby="token-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-[520px] p-0 border-none bg-transparent text-fg overflow-visible animate-[fadeIn_0.15s_ease-out] backdrop:bg-[rgba(0,0,0,0.65)] backdrop:backdrop-blur-[4px]"
      // Escape: let React unmount us (via onClose) instead of the browser closing the element.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // Backdrop clicks target the <dialog> itself; clicks on the card land on its children.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface border border-line-strong rounded-[16px] w-full p-7 shadow-modal flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.6rem]">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-primary-light text-primary flex items-center justify-center">
              <Key size={18} />
            </div>
            <h2 id="token-dialog-title" className="text-[1.25rem] font-bold">
              GitHub API Token
            </h2>
          </div>
          <button type="button" className={btnGhostIcon} onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <p className="text-fg-muted text-[0.9rem]">
          By default, unauthenticated GitHub requests are capped at <strong>60 requests/hour</strong>. Adding a
          fine-grained or classic token increases your limit to <strong>5,000 requests/hour</strong>.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label htmlFor="gh-token-input" className="block text-[0.8rem] font-semibold mb-[0.4rem]">
              Personal Access Token (Stored locally in your browser)
            </label>
            <input
              ref={inputRef}
              id="gh-token-input"
              type="password"
              className="w-full px-[0.85rem] py-[0.65rem] rounded-[8px] bg-subtle border border-line-strong text-fg font-mono text-[0.9rem] focus:border-primary focus:outline-none"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
              autoComplete="off"
            />
          </div>

          <div className="flex items-center gap-[0.4rem] text-[0.8rem]">
            <ShieldCheck size={16} color="var(--open)" />
            <span className="text-fg-muted">Never sent to any server other than api.github.com directly.</span>
          </div>

          <div className="text-[0.8rem]">
            <a
              href="https://github.com/settings/tokens?type=beta"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[0.3rem]"
            >
              Generate token on GitHub <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex items-center justify-end gap-3">
            {getStoredToken() && (
              <button type="button" className={`${btnCard} mr-auto text-danger!`} onClick={handleClear}>
                Remove Token
              </button>
            )}
            <button type="button" className={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                'Save Token'
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
