import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LineChart,
  PenSquare,
  PieChart,
  PlayCircle,
  RefreshCw,
  Scale,
  Search,
  ServerCog,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminSectionKey =
  | "overview"
  | "users"
  | "markets"
  | "finance"
  | "content"
  | "analytics"
  | "security";

type SectionDefinition = {
  key: AdminSectionKey;
  title: string;
  description: string;
  icon: LucideIcon;
};

const sectionDefinitions: SectionDefinition[] = [
  {
    key: "overview",
    title: "Dashboard / Overview",
    description: "Platform pulse, live odds, and operational alerts.",
    icon: LayoutDashboard,
  },
  {
    key: "users",
    title: "User Management",
    description: "Profiles, KYC, bet history, and wallet behavior.",
    icon: Users,
  },
  {
    key: "markets",
    title: "Bet & Market Management",
    description: "Events, odds, stake limits, and bet lifecycle states.",
    icon: Scale,
  },
  {
    key: "finance",
    title: "Financial Management",
    description: "M-Pesa flows, pending payouts, refunds, and revenue.",
    icon: Wallet,
  },
  {
    key: "content",
    title: "Content / Event Management",
    description: "Sports catalogs, schedules, results, and promotions.",
    icon: CalendarClock,
  },
  {
    key: "analytics",
    title: "Analytics & Reports",
    description: "Trends, risk exposure, engagement, and cashflow outlook.",
    icon: BarChart3,
  },
  {
    key: "security",
    title: "Security & System Settings",
    description: "Roles, permissions, audit logs, API keys, and toggles.",
    icon: Shield,
  },
];

const overviewMetrics = [
  {
    label: "Total Bets (24h)",
    value: "84,219",
    delta: "+12.5%",
    direction: "up" as const,
  },
  {
    label: "Revenue (24h)",
    value: "KES 2.84M",
    delta: "+8.1%",
    direction: "up" as const,
  },
  {
    label: "Active Users",
    value: "19,442",
    delta: "+4.6%",
    direction: "up" as const,
  },
  {
    label: "Live Odds Latency",
    value: "124ms",
    delta: "-6.2%",
    direction: "down" as const,
  },
];

const liveOddsRows = [
  {
    event: "Arsenal vs Chelsea",
    market: "1X2",
    home: "2.05",
    draw: "3.35",
    away: "3.55",
    liquidity: "KES 3.2M",
    status: "Live",
  },
  {
    event: "Gor Mahia vs AFC Leopards",
    market: "Both Teams To Score",
    home: "1.84",
    draw: "-",
    away: "1.96",
    liquidity: "KES 1.1M",
    status: "Open",
  },
  {
    event: "LA Lakers vs Miami Heat",
    market: "Match Winner",
    home: "1.72",
    draw: "-",
    away: "2.08",
    liquidity: "KES 2.6M",
    status: "Live",
  },
  {
    event: "India vs Australia",
    market: "Top Batter",
    home: "3.20",
    draw: "-",
    away: "4.05",
    liquidity: "KES 980K",
    status: "Open",
  },
];

const systemAlerts = [
  {
    title: "Liability spike on Manchester City Win",
    severity: "High",
    note: "Exposure +28% within last 12 minutes.",
    time: "2m ago",
  },
  {
    title: "M-Pesa callback retries detected",
    severity: "Medium",
    note: "8 callbacks pending acknowledgement.",
    time: "7m ago",
  },
  {
    title: "KYC queue approaching SLA threshold",
    severity: "Medium",
    note: "31 profiles in review for > 2 hours.",
    time: "19m ago",
  },
  {
    title: "Unusual bet clustering on draw outcomes",
    severity: "Low",
    note: "Bot detector confidence at 62%.",
    time: "38m ago",
  },
];

type UserRow = {
  id: string;
  name: string;
  phone: string;
  kyc: "Verified" | "Pending" | "Rejected";
  status: "Active" | "Suspended";
  betVolume: string;
  deposits: string;
  withdrawals: string;
  lastBet: string;
};

const userRows: UserRow[] = [
  {
    id: "USR-1031",
    name: "Amina Njoroge",
    phone: "254712001182",
    kyc: "Verified",
    status: "Active",
    betVolume: "KES 124,000",
    deposits: "KES 140,500",
    withdrawals: "KES 35,200",
    lastBet: "Today, 10:22",
  },
  {
    id: "USR-1098",
    name: "Brian Otieno",
    phone: "254733443120",
    kyc: "Pending",
    status: "Active",
    betVolume: "KES 18,200",
    deposits: "KES 24,000",
    withdrawals: "KES 2,500",
    lastBet: "Today, 09:47",
  },
  {
    id: "USR-0944",
    name: "Caren Wambui",
    phone: "254701112903",
    kyc: "Rejected",
    status: "Suspended",
    betVolume: "KES 6,100",
    deposits: "KES 8,900",
    withdrawals: "KES 0",
    lastBet: "Yesterday, 18:12",
  },
  {
    id: "USR-0877",
    name: "Daniel Kiptoo",
    phone: "254722884112",
    kyc: "Verified",
    status: "Active",
    betVolume: "KES 310,600",
    deposits: "KES 402,700",
    withdrawals: "KES 91,300",
    lastBet: "Today, 11:03",
  },
];

const userBetHistory: Record<
  string,
  Array<{
    ticketId: string;
    event: string;
    stake: string;
    odds: string;
    outcome: "Won" | "Lost" | "Pending";
    placedAt: string;
  }>
> = {
  "USR-1031": [
    {
      ticketId: "BT-88214",
      event: "Arsenal vs Chelsea",
      stake: "KES 3,000",
      odds: "2.05",
      outcome: "Pending",
      placedAt: "Today, 10:22",
    },
    {
      ticketId: "BT-88003",
      event: "Nairobi Derby",
      stake: "KES 2,000",
      odds: "1.87",
      outcome: "Won",
      placedAt: "Today, 08:40",
    },
  ],
  "USR-1098": [
    {
      ticketId: "BT-87411",
      event: "Lakers vs Heat",
      stake: "KES 1,500",
      odds: "1.72",
      outcome: "Lost",
      placedAt: "Today, 09:47",
    },
    {
      ticketId: "BT-86680",
      event: "Madrid vs Sevilla",
      stake: "KES 800",
      odds: "3.20",
      outcome: "Pending",
      placedAt: "Yesterday, 23:13",
    },
  ],
  "USR-0944": [
    {
      ticketId: "BT-85210",
      event: "CSK vs MI",
      stake: "KES 500",
      odds: "4.05",
      outcome: "Lost",
      placedAt: "Yesterday, 18:12",
    },
  ],
  "USR-0877": [
    {
      ticketId: "BT-88276",
      event: "Liverpool vs Spurs",
      stake: "KES 7,500",
      odds: "2.65",
      outcome: "Pending",
      placedAt: "Today, 11:03",
    },
    {
      ticketId: "BT-87888",
      event: "Milan vs Roma",
      stake: "KES 4,000",
      odds: "1.98",
      outcome: "Won",
      placedAt: "Today, 07:56",
    },
  ],
};

const marketRows = [
  {
    event: "Real Madrid vs Sevilla",
    sport: "Football",
    startAt: "20:00 EAT",
    status: "Open",
    margin: "5.2%",
    maxStake: "KES 120,000",
  },
  {
    event: "Warriors vs Celtics",
    sport: "Basketball",
    startAt: "22:30 EAT",
    status: "Live",
    margin: "4.4%",
    maxStake: "KES 80,000",
  },
  {
    event: "KCB RFC vs Kabras",
    sport: "Rugby",
    startAt: "17:00 EAT",
    status: "Settled",
    margin: "6.1%",
    maxStake: "KES 40,000",
  },
  {
    event: "Everton vs Burnley",
    sport: "Football",
    startAt: "Canceled",
    status: "Canceled",
    margin: "-",
    maxStake: "-",
  },
];

const bookState = [
  { label: "Open Bets", count: "42,800", amount: "KES 11.2M" },
  { label: "Settled Bets", count: "35,944", amount: "KES 9.8M" },
  { label: "Canceled Bets", count: "618", amount: "KES 0.4M" },
];

const mpesaTransactions = [
  {
    id: "MPX-90128",
    user: "Amina Njoroge",
    type: "Deposit",
    amount: "KES 4,500",
    status: "Success",
    channel: "STK Push",
    at: "10:31",
  },
  {
    id: "MPX-90144",
    user: "Brian Otieno",
    type: "Withdrawal",
    amount: "KES 3,000",
    status: "Pending",
    channel: "B2C",
    at: "10:42",
  },
  {
    id: "MPX-90152",
    user: "Daniel Kiptoo",
    type: "Deposit",
    amount: "KES 10,000",
    status: "Success",
    channel: "STK Push",
    at: "10:44",
  },
  {
    id: "MPX-90163",
    user: "Caren Wambui",
    type: "Refund",
    amount: "KES 2,250",
    status: "Failed",
    channel: "Reversal",
    at: "10:48",
  },
];

const pendingPayments = [
  {
    ref: "PEND-7732",
    user: "Kevin Muriuki",
    amount: "KES 12,400",
    reason: "Withdrawal review",
    eta: "8m",
  },
  {
    ref: "PEND-7740",
    user: "Grace Nyambura",
    amount: "KES 5,000",
    reason: "KYC confirmation",
    eta: "16m",
  },
  {
    ref: "PEND-7744",
    user: "Ian Oloo",
    amount: "KES 19,200",
    reason: "Fraud score check",
    eta: "24m",
  },
];

const revenueCards = [
  { label: "Gross Gaming Revenue", value: "KES 18.4M", delta: "+8.2%" },
  { label: "Net Revenue", value: "KES 12.9M", delta: "+6.1%" },
  { label: "Refund Ratio", value: "1.9%", delta: "-0.4%" },
  { label: "M-Pesa Success Rate", value: "97.8%", delta: "+1.2%" },
];

const sportsCatalog = [
  { sport: "Football", leagues: 34, teams: 612, events: 228 },
  { sport: "Basketball", leagues: 12, teams: 196, events: 74 },
  { sport: "Tennis", leagues: 9, teams: 0, events: 39 },
  { sport: "Rugby", leagues: 5, teams: 72, events: 21 },
];

const scheduledEvents = [
  {
    event: "Napoli vs Inter",
    league: "Serie A",
    kickoff: "Fri 21:45",
    result: "Pending",
    promo: "Weekend Boost",
  },
  {
    event: "Nairobi City Stars vs Tusker",
    league: "KPL",
    kickoff: "Sat 16:00",
    result: "Pending",
    promo: "Kenya Mega Odds",
  },
  {
    event: "Heat vs Bucks",
    league: "NBA",
    kickoff: "Sat 03:00",
    result: "Scheduled",
    promo: "Hoops Combo",
  },
];

const promotions = [
  {
    name: "Acca Insurance",
    scope: "Football",
    status: "Active",
    uplift: "+13.4% slips",
  },
  {
    name: "Early Payout",
    scope: "Top Leagues",
    status: "Active",
    uplift: "+9.1% stake",
  },
  {
    name: "Night Owl Cashback",
    scope: "All Sports",
    status: "Paused",
    uplift: "+2.8% retention",
  },
];

const trendBars = [
  { label: "Football", value: 86 },
  { label: "Basketball", value: 64 },
  { label: "Tennis", value: 37 },
  { label: "Rugby", value: 29 },
  { label: "Virtuals", value: 52 },
];

const riskRows = [
  {
    market: "Premier League 1X2",
    exposure: "KES 4.8M",
    risk: "High",
    hedge: "Reduce max stake by 15%",
  },
  {
    market: "NBA Player Props",
    exposure: "KES 1.9M",
    risk: "Medium",
    hedge: "Widen odds margin +0.4%",
  },
  {
    market: "Rugby Outrights",
    exposure: "KES 0.7M",
    risk: "Low",
    hedge: "No action required",
  },
];

const engagementMetrics = [
  { metric: "DAU", value: "41,200", trend: "+5.4%" },
  { metric: "Bet Conversion", value: "28.1%", trend: "+2.2%" },
  { metric: "Avg Session", value: "14m 18s", trend: "+1.1%" },
  { metric: "Churn (7d)", value: "4.9%", trend: "-0.8%" },
];

const cashflowProjection = [
  { month: "May", inflow: "KES 42M", outflow: "KES 30M", net: "KES 12M" },
  { month: "Jun", inflow: "KES 45M", outflow: "KES 32M", net: "KES 13M" },
  { month: "Jul", inflow: "KES 47M", outflow: "KES 35M", net: "KES 12M" },
];

const adminRoles = [
  {
    role: "Super Admin",
    members: 2,
    permissions: "All modules",
    mfa: "Required",
  },
  {
    role: "Risk Manager",
    members: 4,
    permissions: "Markets, limits, analytics",
    mfa: "Required",
  },
  {
    role: "Finance Operator",
    members: 5,
    permissions: "M-Pesa, payouts, refunds",
    mfa: "Required",
  },
  {
    role: "Content Editor",
    members: 3,
    permissions: "Events, promotions",
    mfa: "Optional",
  },
];

const auditLogs = [
  {
    actor: "risk.supervisor",
    action: "Odds margin updated",
    module: "Bet Markets",
    at: "10:36",
    ip: "102.132.88.14",
  },
  {
    actor: "finance.ops",
    action: "Refund approved",
    module: "Payments",
    at: "10:41",
    ip: "102.132.88.18",
  },
  {
    actor: "content.admin",
    action: "Promotion paused",
    module: "Campaigns",
    at: "10:49",
    ip: "102.132.88.26",
  },
];

const apiKeys = [
  {
    name: "Odds Feed Service",
    prefix: "odds_live_***",
    lastUsed: "10:48",
    scope: "read:odds write:markets",
    status: "Active",
  },
  {
    name: "Payments Webhook",
    prefix: "mpesa_cb_***",
    lastUsed: "10:46",
    scope: "write:payments",
    status: "Active",
  },
  {
    name: "Data Warehouse Sync",
    prefix: "bi_sync_***",
    lastUsed: "09:59",
    scope: "read:reports",
    status: "Restricted",
  },
];

function statusTone(value: string) {
  const lower = value.toLowerCase();

  if (
    lower.includes("success") ||
    lower.includes("active") ||
    lower.includes("verified") ||
    lower.includes("won") ||
    lower.includes("open") ||
    lower.includes("required")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    lower.includes("pending") ||
    lower.includes("medium") ||
    lower.includes("live") ||
    lower.includes("scheduled") ||
    lower.includes("optional")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (
    lower.includes("failed") ||
    lower.includes("rejected") ||
    lower.includes("suspended") ||
    lower.includes("canceled") ||
    lower.includes("lost") ||
    lower.includes("high")
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}

function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusTone(value),
      )}
    >
      {value}
    </span>
  );
}

function SectionShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-xl font-semibold tracking-tight text-zinc-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function OverviewSection() {
  return (
    <SectionShell
      title="Platform Overview"
      description="Real-time sportsbook metrics for bets, users, revenue, and live market health."
      action={
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
          <span className="inline-flex size-2 animate-pulse rounded-full bg-emerald-500" />
          Live feed synced
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric, index) => (
          <article
            key={metric.label}
            className="animate-lift-in rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <p className="text-sm text-zinc-600">{metric.label}</p>
            <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-zinc-900">
              {metric.value}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold">
              {metric.direction === "up" ? (
                <TrendingUp className="size-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="size-3.5 text-emerald-600" />
              )}
              <span className="text-emerald-700">{metric.delta}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
              Live Odds Monitor
            </h3>
            <Button size="sm" variant="outline" className="gap-1.5">
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2">Event</th>
                  <th className="pb-2">Market</th>
                  <th className="pb-2">Home</th>
                  <th className="pb-2">Draw</th>
                  <th className="pb-2">Away</th>
                  <th className="pb-2">Liquidity</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {liveOddsRows.map((row) => (
                  <tr key={row.event}>
                    <td className="py-2.5 font-medium text-zinc-800">
                      {row.event}
                    </td>
                    <td className="py-2.5 text-zinc-700">{row.market}</td>
                    <td className="py-2.5 text-zinc-700">{row.home}</td>
                    <td className="py-2.5 text-zinc-700">{row.draw}</td>
                    <td className="py-2.5 text-zinc-700">{row.away}</td>
                    <td className="py-2.5 text-zinc-700">{row.liquidity}</td>
                    <td className="py-2.5">
                      <StatusPill value={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
              Alerts
            </h3>
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="size-3.5" />4 active
            </Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {systemAlerts.map((alert) => (
              <div
                key={alert.title}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    {alert.title}
                  </p>
                  <StatusPill value={alert.severity} />
                </div>
                <p className="mt-1 text-xs text-zinc-600">{alert.note}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  {alert.time}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}

function UserManagementSection({
  selectedUserId,
  setSelectedUserId,
  selectedUser,
}: {
  selectedUserId: string;
  setSelectedUserId: (value: string) => void;
  selectedUser: UserRow;
}) {
  return (
    <SectionShell
      title="User Management"
      description="Review users, KYC pipeline, wallet movement, and recent ticket behavior."
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Search className="size-3.5" />
            Search User
          </Button>
          <Button size="sm" className="gap-1.5">
            <UserCheck className="size-3.5" />
            Approve KYC Batch
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2.5">User</th>
              <th className="px-3 py-2.5">KYC</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Bet Volume</th>
              <th className="px-3 py-2.5">Deposits</th>
              <th className="px-3 py-2.5">Withdrawals</th>
              <th className="px-3 py-2.5">Last Bet</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {userRows.map((user) => (
              <tr
                key={user.id}
                className={cn(
                  "transition-colors hover:bg-zinc-50",
                  user.id === selectedUserId && "bg-emerald-50/70",
                )}
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className="text-left"
                  >
                    <p className="font-medium text-zinc-900">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.phone}</p>
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <StatusPill value={user.kyc} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusPill value={user.status} />
                </td>
                <td className="px-3 py-2.5 text-zinc-700">{user.betVolume}</td>
                <td className="px-3 py-2.5 text-zinc-700">{user.deposits}</td>
                <td className="px-3 py-2.5 text-zinc-700">
                  {user.withdrawals}
                </td>
                <td className="px-3 py-2.5 text-zinc-700">{user.lastBet}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm" className="gap-1.5">
                      <PenSquare className="size-3.5" />
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Selected User Snapshot
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                User
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {selectedUser.name}
              </p>
              <p className="text-xs text-zinc-600">{selectedUser.phone}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                KYC Status
              </p>
              <div className="mt-1">
                <StatusPill value={selectedUser.kyc} />
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Deposits
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {selectedUser.deposits}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Withdrawals
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {selectedUser.withdrawals}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Bet History
          </h3>
          <div className="mt-3 grid gap-2">
            {(userBetHistory[selectedUser.id] ?? []).map((bet) => (
              <div
                key={bet.ticketId}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    {bet.event}
                  </p>
                  <StatusPill value={bet.outcome} />
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  Ticket {bet.ticketId} | Stake {bet.stake} | Odds {bet.odds}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{bet.placedAt}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}

function MarketManagementSection() {
  return (
    <SectionShell
      title="Bet & Market Management"
      description="Create, edit, and close events while keeping odds and limits aligned to risk appetite."
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <PenSquare className="size-3.5" />
            Edit Odds
          </Button>
          <Button size="sm" className="gap-1.5">
            <PlayCircle className="size-3.5" />
            Create Event
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2.5">Event</th>
              <th className="px-3 py-2.5">Sport</th>
              <th className="px-3 py-2.5">Start</th>
              <th className="px-3 py-2.5">Margin</th>
              <th className="px-3 py-2.5">Max Stake</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {marketRows.map((market) => (
              <tr key={market.event} className="hover:bg-zinc-50">
                <td className="px-3 py-2.5 font-medium text-zinc-900">
                  {market.event}
                </td>
                <td className="px-3 py-2.5 text-zinc-700">{market.sport}</td>
                <td className="px-3 py-2.5 text-zinc-700">{market.startAt}</td>
                <td className="px-3 py-2.5 text-zinc-700">{market.margin}</td>
                <td className="px-3 py-2.5 text-zinc-700">{market.maxStake}</td>
                <td className="px-3 py-2.5">
                  <StatusPill value={market.status} />
                </td>
                <td className="px-3 py-2.5">
                  <Button variant="outline" size="sm">
                    {market.status === "Open" || market.status === "Live"
                      ? "Close"
                      : "View"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {bookState.map((state) => (
          <article
            key={state.label}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {state.label}
            </p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-zinc-900">
              {state.count}
            </p>
            <p className="text-sm text-zinc-600">{state.amount}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-zinc-200 p-4">
        <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
          Betting Limits Controller
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <LimitCard title="Global Max Stake" value="KES 120,000" />
          <LimitCard title="High-Risk League" value="KES 45,000" />
          <LimitCard title="In-Play Max Stake" value="KES 30,000" />
          <LimitCard title="Per Ticket Cap" value="KES 250,000" />
        </div>
      </div>
    </SectionShell>
  );
}

function LimitCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
      <Button variant="outline" size="sm" className="mt-3 w-full">
        Adjust
      </Button>
    </div>
  );
}

function FinancialManagementSection() {
  return (
    <SectionShell
      title="Financial Management"
      description="Monitor M-Pesa payments, pending transfers, refunds, and sportsbook revenue performance."
      action={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/payments">Open STK Push Console</Link>
          </Button>
          <Button size="sm" className="gap-1.5">
            <CircleDollarSign className="size-3.5" />
            Approve Refund Batch
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {revenueCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <p className="text-sm text-zinc-600">{card.label}</p>
            <p className="mt-1 font-['Space_Grotesk'] text-xl font-semibold text-zinc-900">
              {card.value}
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-700">
              {card.delta}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
              M-Pesa Transactions
            </h3>
            <Badge variant="outline" className="gap-1.5">
              <Landmark className="size-3.5" />
              Callback online
            </Badge>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2">Ref</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Channel</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {mpesaTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {transaction.id}
                    </td>
                    <td className="py-2.5 text-zinc-700">{transaction.user}</td>
                    <td className="py-2.5 text-zinc-700">{transaction.type}</td>
                    <td className="py-2.5 text-zinc-700">
                      {transaction.amount}
                    </td>
                    <td className="py-2.5 text-zinc-700">
                      {transaction.channel}
                    </td>
                    <td className="py-2.5">
                      <StatusPill value={transaction.status} />
                    </td>
                    <td className="py-2.5 text-zinc-700">{transaction.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Pending Payments
          </h3>
          <div className="mt-3 grid gap-3">
            {pendingPayments.map((payment) => (
              <div
                key={payment.ref}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">
                    {payment.ref}
                  </p>
                  <StatusPill value="Pending" />
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  {payment.user} | {payment.amount}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{payment.reason}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">
                    ETA {payment.eta}
                  </span>
                  <Button size="sm" variant="outline">
                    Release
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}

function ContentManagementSection() {
  return (
    <SectionShell
      title="Content & Event Management"
      description="Manage sports catalog, leagues, event schedules, results, and promotional campaigns."
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <CalendarClock className="size-3.5" />
            Reschedule
          </Button>
          <Button size="sm" className="gap-1.5">
            <PlayCircle className="size-3.5" />
            Add Event
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sportsCatalog.map((item) => (
          <article
            key={item.sport}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <p className="font-['Space_Grotesk'] text-lg font-semibold text-zinc-900">
              {item.sport}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Leagues: {item.leagues}
            </p>
            <p className="text-sm text-zinc-600">Teams: {item.teams}</p>
            <p className="text-sm text-zinc-600">Events: {item.events}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Event Scheduling & Results
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2">Event</th>
                  <th className="pb-2">League</th>
                  <th className="pb-2">Kickoff</th>
                  <th className="pb-2">Result</th>
                  <th className="pb-2">Promotion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {scheduledEvents.map((row) => (
                  <tr key={row.event}>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {row.event}
                    </td>
                    <td className="py-2.5 text-zinc-700">{row.league}</td>
                    <td className="py-2.5 text-zinc-700">{row.kickoff}</td>
                    <td className="py-2.5">
                      <StatusPill value={row.result} />
                    </td>
                    <td className="py-2.5 text-zinc-700">{row.promo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Promotions
          </h3>
          <div className="mt-3 grid gap-3">
            {promotions.map((promo) => (
              <div
                key={promo.name}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">
                    {promo.name}
                  </p>
                  <StatusPill value={promo.status} />
                </div>
                <p className="mt-1 text-xs text-zinc-600">{promo.scope}</p>
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  {promo.uplift}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}

function AnalyticsSection() {
  return (
    <SectionShell
      title="Analytics & Reports"
      description="Detect betting patterns, monitor risk, and project liquidity and cash movement."
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <PieChart className="size-3.5" />
            Export PDF
          </Button>
          <Button size="sm" className="gap-1.5">
            <LineChart className="size-3.5" />
            Generate Forecast
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Betting Trends by Category
          </h3>
          <div className="mt-4 grid gap-3">
            {trendBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-600">
                  <span>{bar.label}</span>
                  <span>{bar.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100">
                  <div
                    className="h-2 rounded-full bg-linear-to-r from-emerald-500 to-amber-500"
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Risk Analysis
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2">Market</th>
                  <th className="pb-2">Exposure</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {riskRows.map((risk) => (
                  <tr key={risk.market}>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {risk.market}
                    </td>
                    <td className="py-2.5 text-zinc-700">{risk.exposure}</td>
                    <td className="py-2.5">
                      <StatusPill value={risk.risk} />
                    </td>
                    <td className="py-2.5 text-zinc-700">{risk.hedge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            User Engagement
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {engagementMetrics.map((metric) => (
              <div
                key={metric.metric}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {metric.metric}
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">
                  {metric.value}
                </p>
                <p className="text-xs font-medium text-emerald-700">
                  {metric.trend}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Cashflow Projection
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2">Month</th>
                  <th className="pb-2">Inflow</th>
                  <th className="pb-2">Outflow</th>
                  <th className="pb-2">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {cashflowProjection.map((row) => (
                  <tr key={row.month}>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {row.month}
                    </td>
                    <td className="py-2.5 text-zinc-700">{row.inflow}</td>
                    <td className="py-2.5 text-zinc-700">{row.outflow}</td>
                    <td className="py-2.5 text-emerald-700">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </SectionShell>
  );
}

function SecuritySection({
  maintenanceMode,
  setMaintenanceMode,
  enforceMfa,
  setEnforceMfa,
  oddsGuard,
  setOddsGuard,
}: {
  maintenanceMode: boolean;
  setMaintenanceMode: (value: boolean) => void;
  enforceMfa: boolean;
  setEnforceMfa: (value: boolean) => void;
  oddsGuard: boolean;
  setOddsGuard: (value: boolean) => void;
}) {
  return (
    <SectionShell
      title="Security & System Settings"
      description="Control access, trace actions, rotate secrets, and manage production safety toggles."
      action={
        <Button size="sm" className="gap-1.5">
          <Settings className="size-3.5" />
          Save Security Policy
        </Button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Admin Roles & Permissions
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Members</th>
                  <th className="pb-2">Permissions</th>
                  <th className="pb-2">MFA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {adminRoles.map((role) => (
                  <tr key={role.role}>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {role.role}
                    </td>
                    <td className="py-2.5 text-zinc-700">{role.members}</td>
                    <td className="py-2.5 text-zinc-700">{role.permissions}</td>
                    <td className="py-2.5">
                      <StatusPill value={role.mfa} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            System Toggles
          </h3>
          <div className="mt-3 grid gap-3">
            <ToggleRow
              label="Maintenance Mode"
              description="Temporarily pause user betting access."
              active={maintenanceMode}
              onToggle={() => setMaintenanceMode(!maintenanceMode)}
            />
            <ToggleRow
              label="Mandatory Admin MFA"
              description="Force 2FA for all privileged accounts."
              active={enforceMfa}
              onToggle={() => setEnforceMfa(!enforceMfa)}
            />
            <ToggleRow
              label="Odds Drift Guard"
              description="Block odds updates outside configured range."
              active={oddsGuard}
              onToggle={() => setOddsGuard(!oddsGuard)}
            />
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            Audit Logs
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-2">Actor</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Module</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {auditLogs.map((log) => (
                  <tr key={`${log.actor}-${log.at}-${log.action}`}>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {log.actor}
                    </td>
                    <td className="py-2.5 text-zinc-700">{log.action}</td>
                    <td className="py-2.5 text-zinc-700">{log.module}</td>
                    <td className="py-2.5 text-zinc-700">{log.at}</td>
                    <td className="py-2.5 text-zinc-700">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-zinc-200 p-4">
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-zinc-900">
            API Keys
          </h3>
          <div className="mt-3 grid gap-3">
            {apiKeys.map((key) => (
              <div
                key={key.name}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">
                    {key.name}
                  </p>
                  <StatusPill value={key.status} />
                </div>
                <p className="mt-1 text-xs font-mono text-zinc-600">
                  {key.prefix}
                </p>
                <p className="mt-1 text-xs text-zinc-500">Scope: {key.scope}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Last used: {key.lastUsed}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <KeyRound className="size-3.5" />
                    Rotate
                  </Button>
                  <Button size="sm" variant="secondary">
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}

function ToggleRow({
  label,
  description,
  active,
  onToggle,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <div>
        <p className="text-sm font-semibold text-zinc-900">{label}</p>
        <p className="text-xs text-zinc-600">{description}</p>
      </div>
      <button
        type="button"
        aria-pressed={active}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors",
          active
            ? "border-emerald-600 bg-emerald-600"
            : "border-zinc-300 bg-zinc-300",
        )}
      >
        <span
          className={cn(
            "size-5 rounded-full bg-white transition-transform",
            active ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] =
    useState<AdminSectionKey>("overview");
  const [selectedUserId, setSelectedUserId] = useState(userRows[0]?.id ?? "");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enforceMfa, setEnforceMfa] = useState(true);
  const [oddsGuard, setOddsGuard] = useState(true);

  const selectedSection = useMemo(
    () =>
      sectionDefinitions.find((section) => section.key === activeSection) ??
      sectionDefinitions[0],
    [activeSection],
  );

  const selectedUser = useMemo(
    () => userRows.find((user) => user.id === selectedUserId) ?? userRows[0],
    [selectedUserId],
  );

  return (
    <div className="relative w-full pb-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-105 bg-linear-to-b from-emerald-100/70 via-amber-50 to-transparent" />

      <section className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-linear-to-r from-slate-950 via-emerald-900 to-amber-800 p-6 text-zinc-50 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-20 h-52 w-52 rounded-full bg-amber-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em]">
              <Activity className="size-3.5" />
              Sportsbook Control Center
            </p>
            <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin Command Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-100/85 sm:text-base">
              Unified administration for users, markets, M-Pesa finance flows,
              sportsbook operations, and security controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-200/40 bg-emerald-400/20 text-emerald-50">
              <CheckCircle2 className="mr-1 size-3.5" />
              Odds Engine Healthy
            </Badge>
            <Badge className="border-amber-200/40 bg-amber-400/20 text-amber-50">
              <Clock3 className="mr-1 size-3.5" />
              12 Pending Reviews
            </Badge>
            <Badge className="border-zinc-100/30 bg-zinc-100/15 text-zinc-100">
              <ServerCog className="mr-1 size-3.5" />
              API v1.12.4
            </Badge>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[255px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-sm backdrop-blur">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Modules
          </p>
          <div className="grid gap-2">
            {sectionDefinitions.map((section) => {
              const Icon = section.icon;
              const isActive = section.key === activeSection;

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 shadow-sm"
                      : "border-zinc-200 bg-white hover:bg-zinc-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        "size-4",
                        isActive ? "text-emerald-700" : "text-zinc-500",
                      )}
                    />
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-emerald-900" : "text-zinc-900",
                      )}
                    >
                      {section.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600">
                    {section.description}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="grid gap-6">
          <article className="rounded-xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <selectedSection.icon className="size-4 text-emerald-700" />
              <p className="font-medium text-zinc-800">
                {selectedSection.title}
              </p>
            </div>
            <p className="mt-1">{selectedSection.description}</p>
          </article>

          {activeSection === "overview" ? <OverviewSection /> : null}
          {activeSection === "users" ? (
            <UserManagementSection
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              selectedUser={selectedUser}
            />
          ) : null}
          {activeSection === "markets" ? <MarketManagementSection /> : null}
          {activeSection === "finance" ? <FinancialManagementSection /> : null}
          {activeSection === "content" ? <ContentManagementSection /> : null}
          {activeSection === "analytics" ? <AnalyticsSection /> : null}
          {activeSection === "security" ? (
            <SecuritySection
              maintenanceMode={maintenanceMode}
              setMaintenanceMode={setMaintenanceMode}
              enforceMfa={enforceMfa}
              setEnforceMfa={setEnforceMfa}
              oddsGuard={oddsGuard}
              setOddsGuard={setOddsGuard}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
