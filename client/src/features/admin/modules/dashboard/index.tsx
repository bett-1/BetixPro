import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Filter,
  Loader,
  MoreHorizontal,
  TriangleAlert,
} from "lucide-react";
import { api } from "@/api/axiosConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AdminButton,
  AdminCard,
  AdminCardHeader,
  DepositWithdrawalChart,
  AdminSectionHeader,
  InlinePill,
  StatusBadge,
  TableShell,
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeadCellClassName,
} from "../../components/ui";

type DashboardMetric = {
  label: string;
  value: string;
  tone: "accent" | "blue" | "gold" | "red";
  helper?: string;
};

type DashboardTransaction = {
  id: string;
  reference: string;
  mpesaCode?: string | null;
  userEmail: string;
  userPhone: string;
  type: "deposit" | "withdrawal";
  amount: number;
  fee: number;
  totalDebit: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  channel: string;
};

type DashboardSummaryResponse = {
  generatedAt: string;
  metrics: DashboardMetric[];
  charts: {
    depositWithdrawalTrend: Array<{
      period: string;
      deposits: number;
      withdrawals: number;
    }>;
    totals: {
      deposits7d: number;
      withdrawals7d: number;
    };
  };
  recentTransactions: DashboardTransaction[];
};

function formatCurrency(value: number) {
  return `KES ${value.toLocaleString()}`;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: async () => {
      const response = await api.get<DashboardSummaryResponse>(
        "/admin/dashboard/summary",
      );

      return response.data;
    },
    refetchInterval: 10_000,
  });

  const metrics = data?.metrics ?? [];
  const chartData = data?.charts.depositWithdrawalTrend ?? [];
  const recentTransactions = data?.recentTransactions ?? [];
  const pendingWithdrawals = metrics.find(
    (metric) => metric.label === "Pending Withdrawals",
  )?.value;
  const pendingCount = pendingWithdrawals
    ? Number(pendingWithdrawals.replace(/\D/g, ""))
    : 0;

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Overview"
        subtitle={
          data
            ? `Live platform snapshot refreshed at ${new Date(
                data.generatedAt,
              ).toLocaleString("en-KE", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`
            : "Live platform snapshot from the server"
        }
      />

      {pendingCount > 0 ? (
        <Alert className="border-amber-400/30 bg-amber-400/10">
          <TriangleAlert className="h-4 w-4 text-amber-300" />
          <AlertTitle className="text-amber-200">
            Pending Withdrawal Requests
          </AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3 text-amber-100/90">
            <span>
              You have {pendingCount} withdrawal request
              {pendingCount === 1 ? "" : "s"} waiting for review.
            </span>
            <Link
              to="/admin/withdrawals"
              className="rounded-lg border border-amber-300/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-amber-100 transition hover:bg-amber-300/20"
            >
              Review Requests
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && metrics.length === 0
          ? Array.from({ length: 6 }).map((_, index) => (
              <AdminCard key={index} className="animate-pulse">
                <div className="h-6 w-24 rounded bg-admin-surface" />
                <div className="mt-4 h-8 w-32 rounded bg-admin-surface" />
                <div className="mt-2 h-4 w-20 rounded bg-admin-surface" />
              </AdminCard>
            ))
          : metrics.map((metric) => (
              <AdminCard key={metric.label}>
                <p className="text-[11px] uppercase tracking-[0.08em] text-admin-text-muted">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-admin-text-primary">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs text-admin-text-secondary">
                  {metric.helper ?? "Live operational metric"}
                </p>
              </AdminCard>
            ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AdminCard>
          <AdminCardHeader
            title="Deposit vs Withdrawal Trend"
            subtitle="Completed transactions over last 7 days"
          />
          <DepositWithdrawalChart data={chartData} />
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="7 Day Totals" subtitle="Liquidity monitor" />
          <div className="space-y-3 pt-2">
            <div className="rounded-xl border border-admin-border bg-admin-surface p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-admin-text-muted">
                Deposits (7d)
              </p>
              <p className="mt-1 text-xl font-bold text-admin-accent">
                {formatCurrency(data?.charts.totals.deposits7d ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-admin-surface p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-admin-text-muted">
                Withdrawals (7d)
              </p>
              <p className="mt-1 text-xl font-bold text-admin-gold">
                {formatCurrency(data?.charts.totals.withdrawals7d ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-admin-border bg-admin-surface p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-admin-text-muted">
                Net (7d)
              </p>
              <p className="mt-1 text-xl font-bold text-admin-text-primary">
                {formatCurrency(
                  (data?.charts.totals.deposits7d ?? 0) -
                    (data?.charts.totals.withdrawals7d ?? 0),
                )}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHeader
          title="Recent Activity"
          subtitle="Live wallet and withdrawal flow"
          actions={
            <>
              <AdminButton variant="ghost">
                <Filter size={13} />
                Filter
              </AdminButton>
              <AdminButton variant="ghost">
                <Download size={13} />
                Export
              </AdminButton>
            </>
          }
        />

        <TableShell>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                {[
                  "Reference",
                  "User",
                  "Type",
                  "Amount",
                  "Status",
                  "Time",
                  "Actions",
                ].map((heading) => (
                  <th className={adminTableHeadCellClassName} key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className={adminTableCellClassName} colSpan={7}>
                    <div className="flex items-center justify-center py-8">
                      <Loader className="animate-spin" size={24} />
                    </div>
                  </td>
                </tr>
              ) : recentTransactions.length === 0 ? (
                <tr>
                  <td className={adminTableCellClassName} colSpan={7}>
                    <div className="flex items-center justify-center py-8 text-admin-text-muted">
                      No recent activity yet.
                    </div>
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr className="even:bg-admin-surface/45" key={transaction.id}>
                    <td
                      className={`${adminTableCellClassName} text-xs font-semibold text-admin-blue`}
                    >
                      {transaction.mpesaCode ?? transaction.reference}
                    </td>
                    <td
                      className={`${adminTableCellClassName} font-semibold text-admin-text-primary`}
                    >
                      <div>
                        <p className="text-xs">{transaction.userEmail}</p>
                        <p className="text-[10px] text-admin-text-muted">
                          {transaction.userPhone}
                        </p>
                      </div>
                    </td>
                    <td className={adminTableCellClassName}>
                      <InlinePill
                        label={transaction.type}
                        tone={
                          transaction.type === "deposit" ? "accent" : "gold"
                        }
                      />
                    </td>
                    <td
                      className={`${adminTableCellClassName} font-semibold text-admin-text-primary`}
                    >
                      {formatCurrency(transaction.amount)}
                      {transaction.type === "withdrawal" ? (
                        <span className="ml-2 text-[10px] text-admin-text-muted">
                          Fee {formatCurrency(transaction.fee)}
                        </span>
                      ) : null}
                    </td>
                    <td className={adminTableCellClassName}>
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td
                      className={`${adminTableCellClassName} text-xs text-admin-text-muted`}
                    >
                      {new Date(transaction.createdAt).toLocaleString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className={adminTableCellClassName}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <AdminButton
                            size="sm"
                            variant="ghost"
                            aria-label="Row actions"
                          >
                            <MoreHorizontal size={14} />
                          </AdminButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Open user</DropdownMenuItem>
                          <DropdownMenuItem>
                            {transaction.type === "withdrawal"
                              ? "Review payout"
                              : "Review deposit"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </AdminCard>
    </div>
  );
}
