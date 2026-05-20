'use client';

export function FateLadder({ position }: { position: number }) {
  const clamped = Math.max(0, Math.min(1, position));
  return (
    <div className="fate-ladder">
      <div className="fate-ladder-head">
        <span>Outcome ladder · total score</span>
        <span>0.00 · catastrophic → 1.00 · perfect</span>
      </div>
      <div className="fate-bar">
        <div className="fate-cata">Catastrophic</div>
        <div className="fate-poor">Poor</div>
        <div className="fate-marg">Marginal</div>
        <div className="fate-excel">Excellent</div>
        <div className="fate-perfect">Perfect</div>
        <div className="fate-marker" style={{ left: `${clamped * 100}%` }} />
      </div>
    </div>
  );
}
