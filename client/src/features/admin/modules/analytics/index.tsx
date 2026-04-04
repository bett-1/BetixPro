import { RefreshCw, TrendingUp } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminCardHeader,
  AdminSectionHeader,
  DepositWithdrawalChart,
} from "../../components/ui";
import { useAdminDashboardSummary } from "@/hooks/useAdminDashboardSummary";

export default function Analytics() {
  const { data, loading, error, refetch } = useAdminDashboardSummary();

  const metrics = data?.metrics ?? [];
  const chartData = data?.charts.depositWithdrawalTrend ?? [];

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Analytics"
        subtitle="Betting trends over the last 7 days"
        actions={
          <AdminButton variant="ghost" size="sm" onClick={() => void refetch()}>
            <RefreshCw size={13} />
            Refresh
          </AdminButton>
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
          : metrics.slice(0, 4).map((metric) => (
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
                    <TrendingUp size={18} />
                  </div>
                </div>
                <p className="text-xs text-admin-text-muted">{metric.helper}</p>
              </AdminCard>
            ))}
      </div>

      <AdminCard>
        <AdminCardHeader
          title="Deposit vs Withdrawal Trend"
          subtitle="Live 7-day movement"
          actions={
            <div className="inline-flex items-center gap-2 rounded-full border border-admin-border bg-admin-surface px-3 py-1 text-xs text-admin-text-muted">
              <TrendingUp size={12} />
              {data ? new Date(data.generatedAt).toLocaleTimeString() : "--:--"}
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
      </AdminCard>
    </div>
  );
}
