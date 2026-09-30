import { Link } from 'react-router';
import { Star, GitFork, AlertCircle, Clock, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import type { Repo } from '../../../api/types';
import { RelativeTime } from '../../../components/RelativeTime';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { formatCount, formatDate, getLanguageColor } from '../../../lib/format';
import { btnCard, btnCardAccent, card, cardFooter, langDot } from '../../../styles/classes';
import { loadRepositoryPage } from '../../repository/loadRepositoryPage';

const statItem = 'inline-flex items-center gap-[0.35rem] font-medium';

// Start fetching the repository page's code as soon as the user shows intent. Only the code: prefetching
// API data on hover would spend the 60 req/h unauthenticated budget on repos nobody opens.
const preload = { onMouseEnter: loadRepositoryPage, onFocus: loadRepositoryPage };

export function RepoCard({ repo }: { repo: Repo }) {
  const [copied, copy] = useCopyToClipboard();
  const detailsPath = `/repos/${repo.owner.login}/${repo.name}`;

  return (
    <article className={card}>
      <header className="flex items-start gap-[0.85rem] mb-3">
        <img
          src={repo.owner.avatarUrl}
          alt={repo.owner.login}
          width={42}
          height={42}
          loading="lazy"
          className="rounded-[10px] shrink-0 bg-subtle border border-line object-cover"
        />
        <div className="flex-1 min-w-0">
          <Link
            to={detailsPath}
            {...preload}
            className="block truncate text-[1.05rem] font-bold text-fg hover:text-primary"
            title={repo.fullName}
          >
            {repo.name}
          </Link>
          <div className="text-[0.8rem] text-fg-muted flex items-center gap-1">
            <span>by</span>
            <a
              href={repo.owner.url}
              target="_blank"
              rel="noreferrer"
              className="text-fg-muted font-semibold hover:text-primary-hover"
            >
              {repo.owner.login}
            </a>
          </div>
        </div>
      </header>

      <p className="text-[0.875rem] text-fg-2 leading-normal mb-4 line-clamp-2 min-h-[2.6rem]">
        {repo.description ?? 'No description provided.'}
      </p>

      <div className="flex flex-wrap items-center gap-[0.85rem] mt-auto pt-[0.85rem] border-t border-line text-[0.8rem] text-fg-2">
        {repo.language && (
          <div className="inline-flex items-center gap-[0.4rem] font-semibold text-[0.775rem]">
            <span className={langDot} style={{ backgroundColor: getLanguageColor(repo.language) }} />
            <span>{repo.language}</span>
          </div>
        )}

        <div className={statItem} title={`${repo.stars.toLocaleString()} Stars`}>
          <Star size={14} color="#f59e0b" fill="#f59e0b" className="opacity-90" />
          <strong className="font-bold text-fg">{formatCount(repo.stars)}</strong>
        </div>

        <div className={statItem} title={`${repo.forks.toLocaleString()} Forks`}>
          <GitFork size={14} color="var(--primary)" />
          <strong className="font-bold text-fg">{formatCount(repo.forks)}</strong>
        </div>

        <div className={statItem} title={`${repo.openIssues.toLocaleString()} Open Issues`}>
          <AlertCircle size={14} color="var(--danger)" />
          <span>{formatCount(repo.openIssues)}</span>
        </div>

        <div
          className={`${statItem} text-fg-muted ml-auto text-[0.75rem]`}
          title={`Updated ${formatDate(repo.updatedAt)}`}
        >
          <Clock size={13} />
          <RelativeTime iso={repo.updatedAt} />
        </div>
      </div>

      <div className={cardFooter}>
        <button type="button" className={btnCard} onClick={() => copy(`${repo.url}.git`)} title="Copy Git clone URL">
          {copied ? (
            <>
              <Check size={13} color="var(--open)" />
              <span className="text-open">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Clone URL</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-[0.4rem]">
          <a href={repo.url} target="_blank" rel="noreferrer" className={btnCard} title="Open repository in GitHub">
            <ExternalLink size={13} />
            <span className="sr-only">View on GitHub</span>
          </a>
          <Link to={detailsPath} {...preload} className={btnCardAccent} title="View insights & details">
            <span>Insights</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
