import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CircleDashed,
  Coins,
  Compass,
  Flame,
  Grid3X3,
  Home,
  LifeBuoy,
  Medal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Timer,
  User,
} from "lucide-react";

const sideIcons: LucideIcon[] = [
  Home,
  Compass,
  Grid3X3,
  CircleDashed,
  User,
  LifeBuoy,
];

const metricCards = [
  {
    title: "Total Income",
    value: "$3,433.0",
    chip: "+4.5%",
    tone: "from-lime-400/25 to-lime-600/10 border-lime-300/30",
    icon: Coins,
  },
  {
    title: "Total Payers",
    value: "11,443",
    chip: "+2.8%",
    tone: "from-amber-300/25 to-orange-500/10 border-amber-300/30",
    icon: Medal,
  },
  {
    title: "Total Time",
    value: "11,443",
    chip: "-1.8%",
    tone: "from-rose-400/25 to-rose-700/10 border-rose-300/30",
    icon: Timer,
  },
];

const leagueRows = [
  { name: "NFL", progress: 38 },
  { name: "NHL", progress: 78 },
  { name: "NBA", progress: 63 },
];

const playerAvatars = ["AL", "MK", "JR", "WN"];

const transactions = [
  { name: "Income", type: "Parlay", amount: "+445" },
  { name: "Winnings", type: "Single", amount: "+220" },
  { name: "Fees", type: "Service", amount: "-54" },
];

function TinyLineChart() {
  return (
    <div className="relative mt-4 h-28 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2">
      <svg viewBox="0 0 320 120" className="h-full w-full">
        <defs>
          <linearGradient id="amberLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="limeLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>

        <path
          d="M0 76 C30 72, 40 34, 70 44 C98 52, 118 88, 145 82 C178 75, 184 26, 220 28 C248 29, 268 68, 320 52"
          fill="none"
          stroke="url(#amberLine)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 48 C28 54, 42 80, 72 78 C104 74, 115 44, 148 42 C178 42, 189 76, 224 82 C255 88, 278 66, 320 70"
          fill="none"
          stroke="url(#limeLine)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function RingProfitCard() {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
          Top 5 Sport Categories
        </h3>
        <span className="text-sm text-zinc-300">...</span>
      </div>

      <div className="relative mx-auto mt-3 h-58 w-full max-w-90">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(#d9f216 0deg 160deg, #f59e0b 160deg 275deg, #ef4444 275deg 338deg, #4338ca 338deg 360deg)",
          }}
        />
        <div className="absolute inset-[22%] rounded-full bg-zinc-950" />
        <div className="absolute inset-0 grid place-content-center text-center">
          <p className="font-['Space_Grotesk'] text-5xl font-bold text-white">
            $3,223.55
          </p>
          <p className="text-lg text-zinc-300">Total profit</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2 rounded-2xl border border-white/10 bg-black/25 p-2">
        {["FB", "BB", "TN", "RU", "VB", "CY"].map((item) => (
          <span
            key={item}
            className="grid h-9 place-content-center rounded-full border border-white/10 bg-zinc-900 text-xs text-zinc-200"
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

function MetricCard({
  title,
  value,
  chip,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  chip: string;
  tone: string;
  icon: LucideIcon;
}) {
  return (
    <article
      className={`rounded-3xl border bg-linear-to-br ${tone} p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-content-center rounded-full bg-black/50 text-lime-200">
          <Icon className="h-4 w-4" />
        </span>
        <span className="rounded-full border border-lime-300/50 bg-lime-400/20 px-2 py-0.5 text-xs font-semibold text-lime-200">
          {chip}
        </span>
      </div>
      <p className="mt-5 text-sm text-zinc-300">{title}</p>
      <p className="font-['Space_Grotesk'] text-4xl font-semibold text-white">
        {value}
      </p>
    </article>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,rgba(190,242,100,0.16),transparent_36%),radial-gradient(circle_at_90%_90%,rgba(245,158,11,0.1),transparent_28%),linear-gradient(160deg,#3f4136,#161812_45%,#11120f)] p-3 text-zinc-100 sm:p-5">
      <main className="mx-auto max-w-350 rounded-[36px] border border-white/15 bg-[linear-gradient(140deg,rgba(9,11,9,0.94),rgba(4,5,4,0.95))] p-4 shadow-[0_40px_90px_rgba(0,0,0,0.55)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[74px_minmax(0,1fr)_310px]">
          <aside className="hidden rounded-3xl border border-white/10 bg-black/35 p-2 lg:flex lg:flex-col lg:items-center lg:gap-3">
            <div className="mb-2 mt-2 grid h-11 w-11 place-content-center rounded-full border border-lime-300/40 bg-lime-300/15 text-lime-200">
              <Sparkles className="h-5 w-5" />
            </div>
            {sideIcons.map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="grid h-10 w-10 place-content-center rounded-xl border border-transparent text-zinc-400 transition hover:border-lime-300/30 hover:bg-lime-300/10 hover:text-lime-200"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
            <button
              type="button"
              className="mt-auto mb-2 grid h-10 w-10 place-content-center rounded-xl border border-white/10 text-zinc-400"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </aside>

          <section>
            <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-['Space_Grotesk'] text-4xl font-bold text-white sm:text-5xl">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Live overview, payouts, users, and funds activity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex h-12 w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-zinc-300 sm:w-72">
                  <Search className="h-4 w-4" />
                  <input
                    aria-label="Search"
                    placeholder="Search"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                  />
                </label>
                <button
                  type="button"
                  className="grid h-12 w-12 place-content-center rounded-full border border-lime-300/30 bg-lime-300/10 text-lime-200"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="grid h-12 w-12 place-content-center rounded-full border border-white/10 bg-white/5 text-zinc-300"
                >
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
              {[
                "Overview",
                "Favorites",
                "PPC",
                "Customize",
              ].map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-full px-3 py-1.5 transition ${
                    index === 0
                      ? "bg-lime-300/15 text-lime-200"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.95fr]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {metricCards.map((card) => (
                    <MetricCard key={card.title} {...card} />
                  ))}
                </div>

                <RingProfitCard />

                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
                    Top 5 Leagues
                  </h3>
                  <div className="mt-4 space-y-4">
                    {leagueRows.map((league) => (
                      <div key={league.name}>
                        <div className="mb-1 flex items-center justify-between text-sm text-zinc-300">
                          <span>{league.name}</span>
                          <span>{league.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/50">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-lime-300 to-lime-500"
                            style={{ width: `${league.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <div className="space-y-4">
                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
                      Total Wagered
                    </h3>
                    <span className="rounded-full border border-lime-300/40 bg-lime-300/20 px-2 py-0.5 text-xs text-lime-200">
                      +4.5%
                    </span>
                  </div>
                  <p className="font-['Space_Grotesk'] text-5xl font-bold text-white">
                    $3,433.0
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                      <span className="text-zinc-300">Percentage of Total Bets</span>
                      <strong>34%</strong>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                      <span className="text-zinc-300">Event Count</span>
                      <strong>35</strong>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                      Best Players
                    </h3>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-content-center rounded-full border border-white/20 bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {playerAvatars.map((tag) => (
                      <span
                        key={tag}
                        className="grid h-10 w-10 place-content-center rounded-full border border-white/20 bg-zinc-800 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-sm text-zinc-400">+145</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-zinc-400">Users</p>
                      <p className="font-['Space_Grotesk'] text-2xl text-white">67</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-zinc-400">Funds</p>
                      <p className="font-['Space_Grotesk'] text-2xl text-white">$22.4k</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                    Week Activity
                  </h3>
                  <TinyLineChart />
                </article>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-content-center rounded-full border border-lime-300/30 bg-lime-300/10 text-lime-200">
                  JW
                </div>
                <div>
                  <p className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
                    John Williams
                  </p>
                  <p className="text-xs text-zinc-400">Last activity: 6 Dec, 2025</p>
                </div>
              </div>
            </article>

            <article className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="rounded-2xl border border-lime-300/30 bg-lime-300/10 p-3">
                <p className="text-sm text-zinc-300">Earned</p>
                <p className="font-['Space_Grotesk'] text-3xl font-semibold text-white">$3,433.0</p>
              </div>
              <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-3">
                <p className="text-sm text-zinc-300">Lost</p>
                <p className="font-['Space_Grotesk'] text-3xl font-semibold text-white">$11,443</p>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                  Funds Activity
                </h3>
                <Flame className="h-4 w-4 text-amber-300" />
              </div>
              <TinyLineChart />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-zinc-400">Active</p>
                  <p className="font-['Space_Grotesk'] text-2xl text-white">$1,443</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-zinc-400">Playing</p>
                  <p className="font-['Space_Grotesk'] text-2xl text-white">$440</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
                Transactions
              </h3>
              <div className="mt-3 space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={`${transaction.name}-${transaction.type}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {transaction.name}
                      </p>
                      <p className="text-xs text-zinc-400">{transaction.type}</p>
                    </div>
                    <p className="font-semibold text-lime-300">{transaction.amount}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </main>
    </div>
  );
}
