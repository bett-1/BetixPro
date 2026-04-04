import { useMemo, useState } from "react";
import {
  Activity,
  Building2,
  MapPin,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminCardHeader,
  AdminSectionHeader,
  AnalyticsTable,
  DeviceCard,
  DepositWithdrawalChart,
  GeoLocationCard,
  SummaryCard,
} from "../../components/ui";
import {
  branchAnalytics,
  deviceAnalytics,
  geoAnalytics,
  localLocationAnalytics,
} from "../../data/mock-data";
import { useAdminDashboardSummary } from "@/hooks/useAdminDashboardSummary";

const timeRanges = ["24h", "7d", "30d", "90d"] as const;

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState<(typeof timeRanges)[number]>("7d");
  const { data, loading, error, refetch } = useAdminDashboardSummary();

  const metrics = data?.metrics ?? [];
  const chartData = data?.charts.depositWithdrawalTrend ?? [];
  const recentTransactions = data?.recentTransactions ?? [];

  const recentTransactionRows = useMemo(
    () =>
      recentTransactions.map((transaction) => ({
        user: `${transaction.userEmail} · ${transaction.userPhone}`,
        type: transaction.type,
        amount: `KES ${transaction.amount.toLocaleString()}`,
        fee: `KES ${transaction.fee.toLocaleString()}`,
        totalDebit: `KES ${transaction.totalDebit.toLocaleString()}`,
        status: transaction.status,
        channel: transaction.channel,
        createdAt: new Date(transaction.createdAt).toLocaleString(),
      })),
    [recentTransactions],
  );

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Analytics"
        subtitle={`Live performance snapshot · ${selectedRange}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {timeRanges.map((range) => (
              <AdminButton
                key={range}
                variant={selectedRange === range ? "solid" : "ghost"}
                size="sm"
                onClick={() => setSelectedRange(range)}
              >
                {range}
              </AdminButton>
            ))}
            <AdminButton variant="ghost" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={13} />
              Refresh
            </AdminButton>
          </div>
        }
      />

      {error ? (
        <AdminCard className="border-admin-red/40 bg-admin-red-dim/20 text-admin-red">
          Failed to load analytics: {error}
        </AdminCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && metrics.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <AdminCard key={index} className="animate-pulse">
                <div className="h-5 w-24 rounded bg-admin-surface" />
                <div className="mt-3 h-8 w-32 rounded bg-admin-surface" />
                <div className="mt-2 h-4 w-40 rounded bg-admin-surface" />
              </AdminCard>
            ))
          : metrics.map((metric) => (
              <AdminCard key={metric.label} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-admin-text-muted">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-admin-text-primary">
                      {metric.value}
                    </p>
                  </div>
                  <div className="rounded-xl bg-admin-surface/60 p-2 text-admin-accent">
                    <Activity size={18} />
                  </div>
                </div>
                <p className="text-xs text-admin-text-muted">{metric.helper}</p>
              </AdminCard>
            ))}
      </div>

      <AdminCard>
        <AdminCardHeader
          title="Deposit vs Withdrawal Trend"
          subtitle="Backend summary for the last 7 days"
          actions={
            <div className="inline-flex items-center gap-2 rounded-full border border-admin-border bg-admin-surface px-3 py-1 text-xs text-admin-text-muted">
              <TrendingUp size={12} />
              Updated {data ? new Date(data.generatedAt).toLocaleTimeString() : "--:--"}
            </div>
          }
        />
        <div className="mt-4">
          {chartData.length > 0 ? (
            <DepositWithdrawalChart data={chartData} />
          ) : (
            <div className="rounded-2xl border border-dashed border-admin-border px-4 py-10 text-center text-admin-text-muted">
              No trend data available yet.
            </div>
          )}
        </div>
        {data?.charts.totals ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SummaryCard
              label="Deposits in last 7 days"
              value={`KES ${data.charts.totals.deposits7d.toLocaleString()}`}
              tone="accent"
            />
            <SummaryCard
              label="Withdrawals in last 7 days"
              value={`KES ${data.charts.totals.withdrawals7d.toLocaleString()}`}
              tone="gold"
            />
          </div>
        ) : null}
      </AdminCard>

      <AdminCard>
        <AdminCardHeader
          title="Recent Transactions"
          subtitle="Latest wallet activity from the live backend"
        />
        <div className="mt-4">
          {recentTransactionRows.length > 0 ? (
            <AnalyticsTable
              data={recentTransactionRows}
              columns={[
                { label: "User", key: "user" },
                { label: "Type", key: "type" },
                { label: "Amount", key: "amount" },
                { label: "Fee", key: "fee" },
                { label: "Total Debit", key: "totalDebit" },
                { label: "Status", key: "status" },
                { label: "Channel", key: "channel" },
                { label: "Created", key: "createdAt" },
              ]}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-admin-border px-4 py-10 text-center text-admin-text-muted">
              No recent transactions found.
            </div>
          )}
        </div>
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard>
          <AdminCardHeader
            title="Kenya Footprint"
            subtitle="Top locations and revenue concentration"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {geoAnalytics.slice(0, 4).map((location) => (
              <GeoLocationCard key={location.country + location.region} {...location} />
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader
            title="Local Branches"
            subtitle="Operations coverage and branch pressure"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {branchAnalytics.map((branch) => (
              <div
                key={branch.branch}
                className="rounded-2xl border border-admin-border bg-admin-surface/40 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 font-semibold text-admin-text-primary">
                    <Building2 size={13} />
                    {branch.branch}
                  </p>
                  <span
                    className={
                      branch.status === "active"
                        ? "rounded-full bg-admin-accent-dim px-2 py-1 text-[11px] font-semibold text-admin-accent"
                        : "rounded-full bg-admin-gold-dim px-2 py-1 text-[11px] font-semibold text-admin-gold"
                    }
                  >
                    {branch.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-admin-text-muted">
                  {branch.area}
                </p>
                <p className="mt-2 text-xs text-admin-text-secondary">
                  <Users size={12} className="mr-1 inline-block -translate-y-px" />
                  {branch.users.toLocaleString()} users · {branch.bets.toLocaleString()} bets · {branch.deposits} deposits
                </p>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHeader
          title="Device Mix"
          subtitle="Platform usage across connected devices"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {deviceAnalytics.map((device) => (
            <DeviceCard key={device.device} {...device} />
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader
          title="Location Rollup"
          subtitle="Operations-focused Kenyan sites from the local data set"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {localLocationAnalytics.map((location) => (
            <div
              key={location.location}
              className="rounded-2xl border border-admin-border bg-admin-surface/40 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-admin-text-primary">
                    {location.location}
                  </p>
                  <p className="text-xs text-admin-text-muted">
                    {location.area}
                  </p>
                </div>
                <p className="text-sm font-semibold text-admin-text-primary">
                  {location.share.toFixed(1)}%
                </p>
              </div>
              <p className="mt-2 text-xs text-admin-text-secondary">
                <MapPin size={12} className="inline-block -translate-y-px" /> {location.users.toLocaleString()} users · {location.bets.toLocaleString()} bets
              </p>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
