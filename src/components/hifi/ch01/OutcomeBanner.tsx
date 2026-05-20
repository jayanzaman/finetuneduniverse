'use client';

export type OutcomeBannerProps = {
  label: string;
  warn?: boolean;
  total: number;
  complexity: number;
  status: string;
};

export function OutcomeBanner({
  label,
  warn = false,
  total,
  complexity,
  status,
}: OutcomeBannerProps) {
  return (
    <div className={`outcome-banner${warn ? ' warn' : ''}`}>
      <div className={`outcome-orb-mini${warn ? ' warn' : ''}`} />
      <div className="outcome-text">
        <div className="outcome-eyebrow">Current universe</div>
        <div className={`outcome-label${warn ? ' warn' : ''}`}>{label}</div>
        <div className="outcome-meta">
          <span>
            Total score · <strong>{total.toFixed(2)}</strong>
          </span>
          <span>
            Cosmic complexity · <strong>{complexity.toFixed(2)}</strong>
          </span>
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
}
