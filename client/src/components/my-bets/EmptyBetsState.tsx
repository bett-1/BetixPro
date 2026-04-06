import { TicketX } from "lucide-react";

export function EmptyBetsState() {
  return (
    <div className="grid min-h-[320px] place-items-center overflow-hidden rounded-2xl border border-dashed border-[#2b3a4f] bg-[radial-gradient(circle_at_top,_rgba(245,197,24,0.08),_transparent_50%),#111827] p-8 text-center">
      <div className="space-y-5">
        <div className="mx-auto grid h-18 w-18 place-items-center rounded-full border border-[#32455f] bg-[#1e293b] text-[#8ea0b6] shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <TicketX size={32} />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-white">No bets yet</p>
          <p className="text-sm text-[#9db0c8]">
            You do not have any sportsbook bets open
          </p>
        </div>
        <a
          href="/user"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#22c55e] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          See all sportsbook bets
        </a>
      </div>
    </div>
  );
}
