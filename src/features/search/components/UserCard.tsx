import { useQuery } from '@tanstack/react-query';
import { MapPin, ExternalLink, RotateCcw, Search } from 'lucide-react';
import { Link } from 'react-router';
import { userQuery } from '../../../api/queries';
import type { UserSummary } from '../../../api/types';
import { formatCount } from '../../../lib/format';
import { btnCard, btnCardAccent, card, cardFooter } from '../../../styles/classes';

/**
 * Search results only carry login + avatar, so each card lazily fetches the full profile.
 * Basic info renders immediately; a failed profile fetch degrades that card gracefully.
 */
export function UserCard({ user }: { user: UserSummary }) {
  const profile = useQuery(userQuery(user.login));
  const p = profile.data;

  return (
    <article className={card}>
      <div className="h-[48px] -mx-5 -mt-5 bg-(image:--accent-gradient) opacity-75" />
      <div className="relative -mt-[24px]">
        <div className="relative inline-block mb-2">
          <img
            src={user.avatarUrl}
            alt={user.login}
            width={54}
            height={54}
            loading="lazy"
            className="rounded-full border-[3px] border-surface shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
          />
        </div>

        <div className="mb-3">
          <div className="text-[1.05rem] font-bold text-fg leading-[1.2]">{p?.name || user.login}</div>
          <div className="text-[0.825rem] text-fg-muted">@{user.login}</div>
          {p?.location && (
            <div className="flex items-center gap-[0.3rem] text-[0.8rem] text-fg-2 mt-[0.35rem]">
              <MapPin size={13} color="var(--primary)" />
              <span>{p.location}</span>
            </div>
          )}
        </div>

        {profile.isPending && (
          <div className="py-3">
            <div className="skeleton h-[42px] w-full mb-[8px]" />
          </div>
        )}

        {profile.isError && (
          <div className="my-2 text-[0.8rem] text-fg-muted">
            <span>Profile details unavailable. </span>
            <button type="button" className={`${btnCard} px-2! py-[0.2rem]! mt-1`} onClick={() => profile.refetch()}>
              <RotateCcw size={12} /> Retry
            </button>
          </div>
        )}

        {p && (
          <dl className="grid grid-cols-3 gap-2 bg-subtle rounded-[10px] px-2 py-[0.65rem] text-center my-3">
            {[
              { label: 'Followers', value: p.followers },
              { label: 'Following', value: p.following },
              { label: 'Repos', value: p.publicRepos },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[0.7rem] text-fg-muted font-semibold uppercase tracking-[0.02em]">{label}</dt>
                <dd className="m-0 text-[1rem] font-extrabold text-fg">{formatCount(value)}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className={cardFooter}>
          <Link
            to={`/?q=user:${encodeURIComponent(user.login)}&type=repositories`}
            className={btnCard}
            title={`Search all repositories by ${user.login}`}
          >
            <Search size={13} />
            <span>Repos</span>
          </Link>

          <a href={user.url} target="_blank" rel="noreferrer" className={btnCardAccent}>
            <span>GitHub Profile</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </article>
  );
}
