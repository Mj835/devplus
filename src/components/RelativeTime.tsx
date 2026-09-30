import { formatDate, formatRelativeTime } from '../lib/format';

/** "3d ago" on screen; the exact date stays available as machine-readable dateTime and as a tooltip. */
export function RelativeTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={formatDate(iso)}>
      {formatRelativeTime(iso)}
    </time>
  );
}
