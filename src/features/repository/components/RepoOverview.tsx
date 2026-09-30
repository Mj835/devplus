import type { Ref } from 'react';
import { Check, Copy, ExternalLink, GitBranch, Star } from 'lucide-react';
import type { RepoDetail } from '../../../api/types';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { getLanguageColor } from '../../../lib/format';
import { btnCard, btnPrimary, btnSecondary, langDot, wrapAnywhere } from '../../../styles/classes';

const pill =
  'inline-flex items-center gap-[0.35rem] px-[0.6rem] py-[0.2rem] rounded-full font-bold tracking-[0.04em] border border-line';

interface Props {
  repo: RepoDetail;
  /** The page moves focus here once details load. */
  headingRef: Ref<HTMLHeadingElement>;
}

export function RepoOverview({ repo, headingRef }: Props) {
  const [copied, copy] = useCopyToClipboard();
  const cloneCommand = `git clone ${repo.url}.git`;

  return (
    <section
      aria-label="Repository details"
      className="bg-surface border border-line rounded-[16px] p-7 shadow-card relative overflow-hidden"
    >
      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-[0.85rem] flex-wrap min-w-0 max-md:w-full">
          <img
            src={repo.owner.avatarUrl}
            alt={repo.owner.login}
            className="w-[52px] h-[52px] rounded-[12px] border border-line"
          />
          <div className="min-w-0">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-[1.65rem] font-extrabold tracking-[-0.03em] flex items-center gap-2 flex-wrap"
            >
              <a
                href={repo.owner.url}
                target="_blank"
                rel="noreferrer"
                className={`${wrapAnywhere} text-fg-2 hover:text-primary`}
              >
                {repo.owner.login}
              </a>
              <span className="text-fg-muted">/</span>
              <span className={wrapAnywhere}>{repo.name}</span>
            </h1>

            <div className="flex items-center gap-2 mt-[0.35rem] flex-wrap">
              {/* With a token, private repos are reachable, so don't hardcode "Public". */}
              <span className={`${pill} text-[0.725rem] uppercase bg-primary-light text-primary`}>
                {repo.isPrivate ? 'Private' : 'Public'}
              </span>
              <span className={`${pill} max-w-full min-w-0 text-[0.75rem] font-mono bg-subtle text-fg-2`}>
                <GitBranch size={12} className="shrink-0" /> <span className="truncate">{repo.defaultBranch}</span>
              </span>
              {repo.language && (
                <span className={`${pill} text-[0.725rem] uppercase bg-subtle text-fg`}>
                  <span className={langDot} style={{ backgroundColor: getLanguageColor(repo.language) }} />
                  {repo.language}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap max-md:w-full">
          <a href={repo.url} target="_blank" rel="noreferrer" className={btnPrimary}>
            <Star size={16} />
            <span>Star on GitHub</span>
          </a>
          {/* An <a> styled as a button: the global a:hover tint applies, as in the original design. */}
          <a href={repo.url} target="_blank" rel="noreferrer" className={`${btnSecondary} hover:text-primary-hover`}>
            <span>Open in GitHub</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <p className="text-[1.05rem] text-fg-2 leading-[1.6] mt-4 mb-6">
        {repo.description ?? 'No description provided for this repository.'}
      </p>

      <div className="flex items-center justify-between gap-3 mt-4 bg-subtle border border-line rounded-[10px] px-[0.85rem] py-2 font-mono text-[0.825rem] text-fg">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary font-bold">$</span>
          <span className="truncate">{cloneCommand}</span>
        </div>
        <button type="button" className={btnCard} onClick={() => copy(cloneCommand)} title="Copy git clone command">
          {copied ? (
            <>
              <Check size={14} color="var(--open)" />
              <span className="text-open">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
