import { useEffect, useMemo, useState } from "react";

type CancellationTimerProps = {
  cancellableUntil: string;
  onExpire?: () => void;
};

export function CancellationTimer({
  cancellableUntil,
  onExpire,
}: CancellationTimerProps) {
  const [remainingMs, setRemainingMs] = useState(
    new Date(cancellableUntil).getTime() - Date.now(),
  );

  useEffect(() => {
    const tick = () => {
      const nextValue = new Date(cancellableUntil).getTime() - Date.now();
      setRemainingMs(nextValue);

      if (nextValue <= 0) {
        onExpire?.();
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [cancellableUntil, onExpire]);

  const progress = useMemo(() => {
    const fullMs = 5 * 60 * 1000;
    return Math.max(0, Math.min(1, remainingMs / fullMs));
  }, [remainingMs]);

  if (remainingMs <= 0) {
    return null;
  }

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div className="inline-flex items-center gap-2 text-xs text-[#fca5a5]">
      <span
        className="h-6 w-6 rounded-full"
        style={{
          background: `conic-gradient(#ef4444 ${Math.floor(progress * 360)}deg, #334155 0deg)`,
        }}
      />
      <span>
        Cancel in {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
