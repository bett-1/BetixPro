import { useMemo, useState } from "react";
import { ArrowLeft, CircleAlert, Info } from "lucide-react";
import { MatchSelectionCard } from "./MatchSelectionCard";
import type { BetDetail } from "@/features/user/hooks/useBetDetail";

function formatMoney(value: number) {
  return `KES ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type BetDetailModalProps = {
  bet: BetDetail;
  integrityError: boolean;
  onClose: () => void;
  onCancel: () => void;
  isCancelling: boolean;
};

export function BetDetailModal({
  bet,
  integrityError,
  onClose,
  onCancel,
  isCancelling,
}: BetDetailModalProps) {
  const [collapsed, setCollapsed] = useState(false);

  const statusClass = useMemo(() => {
    if (bet.status === "won") {
      return "bg-[#22c55e]";
    }

    if (bet.status === "lost") {
      return "bg-[#ef4444]";
    }

    if (bet.status === "bonus") {
      return "bg-[#F5C518] text-[#111827]";
    }

    if (bet.status === "open") {
      return "bg-[#3b82f6]";
    }

    return "bg-[#64748b]";
  }, [bet.status]);

  return (
    <section className="h-full overflow-y-auto bg-[#0d1117] p-4 text-white">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b border-[#2b3a4f] bg-[#0d1117]/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-sm text-[#9db0c8]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h2 className="text-sm font-semibold">BetID: {bet.bet_code}</h2>
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusClass}`}
        >
          {bet.status}
        </span>
      </header>

      <div className="mt-4 space-y-4">
        {bet.promoted_text ? (
          <p className="rounded-lg border border-[#4e4220] bg-[#2c260f] px-3 py-2 text-xs text-[#f5d569]">
            {bet.promoted_text}
          </p>
        ) : null}

        {integrityError ? (
          <p className="inline-flex items-center gap-2 rounded-lg border border-[#7f1d1d] bg-[#2b1111] px-3 py-2 text-xs text-[#fca5a5]">
            <CircleAlert size={14} />
            Data integrity error
          </p>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#2b3a4f] bg-[#1a2332] p-3">
            <p className="text-[11px] text-[#8ea0b6]">Amount</p>
            <p className="mt-1 text-sm font-semibold">
              {formatMoney(bet.amount)}
            </p>
          </div>
          <div className="rounded-lg border border-[#2b3a4f] bg-[#1a2332] p-3">
            <p className="inline-flex items-center gap-1 text-[11px] text-[#8ea0b6]">
              Possible Payout <Info size={12} />
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatMoney(bet.possible_payout)}
            </p>
          </div>
          <div className="rounded-lg border border-[#2b3a4f] bg-[#1a2332] p-3">
            <p className="text-[11px] text-[#8ea0b6]">W/L/T</p>
            <p className="mt-1 text-sm font-semibold">
              {bet.wlt.won}/{bet.wlt.lost}/{bet.wlt.tie}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-[#2b3a4f] bg-[#111827] px-3 py-2">
          <p className="text-sm text-[#9db0c8]">Intention Odds</p>
          <p className="font-semibold text-[#f5c518]">
            {bet.total_odds.toFixed(2)}x
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-full border border-[#2b3a4f] bg-[#111827] px-3 py-1.5 text-xs text-[#c6d6ea]"
          >
            Toggle Collapse All
          </button>

          {bet.status === "open" ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className="rounded-full bg-[#ef4444] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isCancelling ? "Cancelling..." : "Cancel Bet"}
            </button>
          ) : null}
        </div>

        {!collapsed ? (
          <div className="space-y-2">
            {bet.selections.map((selection) => (
              <MatchSelectionCard
                key={`${selection.event_id}-${selection.pick}`}
                selection={selection}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
