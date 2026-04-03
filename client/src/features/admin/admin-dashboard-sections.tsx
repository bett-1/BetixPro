import type { CSSProperties } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Flag,
  Lock,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Unlock,
  XCircle,
} from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminCardHeading,
  AdminDonutChart,
  AdminInlinePill,
  AdminMetricCard,
  AdminMiniChart,
  AdminSectionIntro,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminTableShell,
} from "./admin-dashboard-components";
import {
  betFilters,
  betSummaryStats,
  dashboardKpis,
  eventFilters,
  events,
  oddsRows,
  platformUsers,
  recentBets,
  reportCards,
  riskAlerts,
  riskControls,
  riskExposureLimits,
  settingsSections,
  transactionSummaryStats,
  transactions,
  userSummaryStats,
} from "./admin-dashboard-data";

const calculatePotentialWin = (stake: string, odds: string) => {
  const parsedStake = Number(stake.replace("$", "").replace(",", ""));
  const parsedOdds = Number(odds);

  return `$${Math.round(parsedStake * parsedOdds).toLocaleString()}`;
};

export function DashboardSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Overview"
        subtitle="Friday, April 3, 2026 - Live Platform Snapshot"
      />

      <div className="admin-grid admin-grid--kpi">
        {dashboardKpis.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="admin-grid admin-grid--dashboard-charts">
        <AdminCard>
          <AdminCardHeading
            title="Revenue & Bet Volume"
            subtitle="Last 7 days"
            actions={
              <div className="admin-legend">
                <span className="admin-legend__item">
                  <span className="admin-legend__swatch" data-tone="accent" />
                  Revenue
                </span>
                <span className="admin-legend__item">
                  <span
                    className="admin-legend__swatch admin-legend__swatch--dim"
                    data-tone="accent"
                  />
                  Volume
                </span>
              </div>
            }
          />
          <AdminMiniChart />
        </AdminCard>

        <AdminCard>
          <AdminCardHeading
            title="Sport Distribution"
            subtitle="By bet count"
          />
          <AdminDonutChart />
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHeading
          title="Recent Bets"
          subtitle="Live feed - auto-updating"
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

        <AdminTableShell>
          <table className="admin-table">
            <thead>
              <tr>
                {[
                  "Bet ID",
                  "User",
                  "Sport",
                  "Event",
                  "Market",
                  "Odds",
                  "Stake",
                  "Status",
                  "Time",
                  "Action",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBets.map((bet) => (
                <tr key={bet.id}>
                  <td className="admin-text-blue admin-text-strong admin-text-xs">
                    {bet.id}
                  </td>
                  <td className="admin-text-primary admin-text-strong">
                    {bet.user}
                  </td>
                  <td>{bet.sport}</td>
                  <td className="admin-truncate-cell">{bet.event}</td>
                  <td>{bet.market}</td>
                  <td className="admin-text-gold admin-text-strong">
                    {bet.odds}
                  </td>
                  <td className="admin-text-primary admin-text-strong">
                    {bet.stake}
                  </td>
                  <td>
                    <AdminStatusBadge status={bet.status} />
                  </td>
                  <td className="admin-text-muted admin-text-xs">
                    {bet.time}
                  </td>
                  <td>
                    <div className="admin-inline-group admin-inline-group--tight">
                      <AdminButton size="sm" variant="ghost">
                        <Eye size={11} />
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost">
                        <Flag size={11} />
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </AdminCard>
    </div>
  );
}

export function UserManagementSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="User Management"
        subtitle="48,291 registered accounts"
        actions={
          <>
            <AdminButton variant="ghost">
              <Download size={13} />
              Export
            </AdminButton>
            <AdminButton>
              <Plus size={13} />
              Add User
            </AdminButton>
          </>
        }
      />

      <div className="admin-grid admin-grid--stats-4">
        {userSummaryStats.map((stat) => (
          <AdminSummaryCard
            key={stat.label}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>

      <AdminCard>
        <div className="admin-table-toolbar">
          <div className="admin-input-shell">
            <Search size={14} className="admin-text-muted" />
            <input placeholder="Search users..." />
          </div>
          <div className="admin-inline-group">
            <AdminButton variant="ghost">
              <Filter size={13} />
              KYC Status
            </AdminButton>
            <AdminButton variant="ghost">
              <SlidersHorizontal size={13} />
              Risk Level
            </AdminButton>
          </div>
        </div>

        <AdminTableShell>
          <table className="admin-table">
            <thead>
              <tr>
                {[
                  "User ID",
                  "Name",
                  "Email",
                  "Balance",
                  "Bets",
                  "Win Rate",
                  "KYC",
                  "Risk",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platformUsers.map((user) => (
                <tr key={user.id}>
                  <td className="admin-text-blue admin-text-strong admin-text-xs">
                    {user.id}
                  </td>
                  <td className="admin-text-primary admin-text-strong">
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td className="admin-text-accent admin-text-strong">
                    {user.balance}
                  </td>
                  <td>{user.totalBets}</td>
                  <td>{Math.round((user.won / user.totalBets) * 100)}%</td>
                  <td>
                    <AdminStatusBadge status={user.kyc} />
                  </td>
                  <td>
                    <AdminStatusBadge status={user.risk} />
                  </td>
                  <td>
                    <AdminStatusBadge status={user.status} />
                  </td>
                  <td>
                    <div className="admin-inline-group admin-inline-group--tight">
                      <AdminButton size="sm" variant="ghost">
                        <Eye size={11} />
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost">
                        <Edit size={11} />
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost">
                        {user.status === "active" ? (
                          <Lock size={11} />
                        ) : (
                          <Unlock size={11} />
                        )}
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </AdminCard>
    </div>
  );
}

export function EventsSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Events & Sports"
        subtitle="Manage live and upcoming events"
        actions={
          <AdminButton>
            <Plus size={13} />
            Add Event
          </AdminButton>
        }
      />

      <div className="admin-filter-row">
        {eventFilters.map((filter) => (
          <AdminButton
            key={filter}
            variant={filter === "All" ? "solid" : "ghost"}
          >
            {filter}
          </AdminButton>
        ))}
      </div>

      <div className="admin-event-list">
        {events.map((event) => (
          <AdminCard className="admin-event-card" key={event.id}>
            <div className="admin-event-card__primary">
              {event.status === "live" ? (
                <span className="admin-live-dot" />
              ) : null}
              <div>
                <div className="admin-event-card__meta">
                  <AdminStatusBadge status={event.status} />
                  <span className="admin-text-muted admin-text-xs">
                    {event.league}
                  </span>
                  <span className="admin-text-muted admin-text-xs">-</span>
                  <span className="admin-text-muted admin-text-xs">
                    {event.date}
                  </span>
                </div>
                <p className="admin-event-card__title">
                  {event.home} <span className="admin-text-muted">vs</span>{" "}
                  {event.away}
                </p>
              </div>
            </div>

            <div className="admin-event-card__stats">
              <div>
                <p className="admin-event-card__value admin-text-blue">
                  {event.markets}
                </p>
                <p className="admin-event-card__label">Markets</p>
              </div>
              <div>
                <p className="admin-event-card__value admin-text-gold">
                  {event.totalBets.toLocaleString()}
                </p>
                <p className="admin-event-card__label">Bets</p>
              </div>
              <div>
                <p className="admin-event-card__value admin-text-red">
                  {event.exposure}
                </p>
                <p className="admin-event-card__label">Exposure</p>
              </div>
            </div>

            <div className="admin-inline-group admin-inline-group--tight">
              <AdminButton size="sm" variant="ghost">
                <Eye size={13} />
              </AdminButton>
              <AdminButton size="sm" variant="ghost">
                <Edit size={13} />
              </AdminButton>
              <AdminButton size="sm" variant="ghost">
                <XCircle size={13} />
              </AdminButton>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

export function OddsControlSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Odds Control"
        subtitle="Manage markets, odds, and margins"
        actions={
          <>
            <AdminButton variant="ghost">
              <RefreshCw size={13} />
              Sync Feed
            </AdminButton>
            <AdminButton>
              <Plus size={13} />
              New Market
            </AdminButton>
          </>
        }
      />

      <AdminCard>
        <AdminTableShell>
          <table className="admin-table">
            <thead>
              <tr>
                {[
                  "Event",
                  "Market",
                  "Selection 1",
                  "Odds",
                  "Selection 2",
                  "Odds",
                  "Selection 3",
                  "Odds",
                  "Margin",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oddsRows.map((row) => (
                <tr key={`${row.event}-${row.market}`}>
                  <td className="admin-text-primary admin-text-strong admin-truncate-cell">
                    {row.event}
                  </td>
                  <td>{row.market}</td>
                  <td className="admin-text-primary">{row.selectionOne}</td>
                  <td>
                    <AdminInlinePill label={row.oddsOne} tone="accent" />
                  </td>
                  <td>{row.selectionTwo || "-"}</td>
                  <td>
                    {row.oddsTwo ? (
                      <AdminInlinePill label={row.oddsTwo} tone="accent" />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="admin-text-primary">{row.selectionThree}</td>
                  <td>
                    <AdminInlinePill label={row.oddsThree} tone="accent" />
                  </td>
                  <td className="admin-text-gold admin-text-strong">
                    {row.margin}
                  </td>
                  <td>
                    <AdminStatusBadge status={row.status} />
                  </td>
                  <td>
                    <div className="admin-inline-group admin-inline-group--tight">
                      <AdminButton size="sm" variant="ghost">
                        <Edit size={11} />
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost">
                        {row.status === "active" ? (
                          <Lock size={11} />
                        ) : (
                          <Unlock size={11} />
                        )}
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </AdminCard>
    </div>
  );
}

export function TransactionsSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Transactions"
        subtitle="Deposits, withdrawals, and payment review"
        actions={
          <AdminButton variant="ghost">
            <Download size={13} />
            Export CSV
          </AdminButton>
        }
      />

      <div className="admin-grid admin-grid--stats-4">
        {transactionSummaryStats.map((stat) => (
          <AdminSummaryCard
            key={stat.label}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>

      <AdminCard>
        <AdminTableShell>
          <table className="admin-table">
            <thead>
              <tr>
                {[
                  "TXN ID",
                  "User",
                  "Type",
                  "Method",
                  "Amount",
                  "Status",
                  "Time",
                  "Actions",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="admin-text-blue admin-text-strong admin-text-xs">
                    {transaction.id}
                  </td>
                  <td className="admin-text-primary admin-text-strong">
                    {transaction.user}
                  </td>
                  <td>
                    <AdminInlinePill
                      label={transaction.type}
                      tone={
                        transaction.type === "deposit" ? "accent" : "red"
                      }
                    />
                  </td>
                  <td>{transaction.method}</td>
                  <td
                    className={
                      transaction.amount.startsWith("+")
                        ? "admin-text-accent admin-text-strong"
                        : "admin-text-red admin-text-strong"
                    }
                  >
                    {transaction.amount}
                  </td>
                  <td>
                    <AdminStatusBadge status={transaction.status} />
                  </td>
                  <td className="admin-text-muted admin-text-xs">
                    {transaction.time}
                  </td>
                  <td>
                    <div className="admin-inline-group admin-inline-group--tight">
                      <AdminButton size="sm" variant="ghost">
                        <Eye size={11} />
                      </AdminButton>
                      {transaction.status === "pending" ? (
                        <>
                          <AdminButton size="sm" variant="ghost">
                            <CheckCircle size={11} />
                          </AdminButton>
                          <AdminButton size="sm" variant="ghost">
                            <XCircle size={11} />
                          </AdminButton>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </AdminCard>
    </div>
  );
}

export function RiskManagementSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Risk Management"
        subtitle="Fraud detection, AML, and exposure monitoring"
      />

      <div className="admin-grid admin-grid--double">
        <AdminCard>
          <AdminCardHeading
            title="Active Alerts"
            subtitle={`${riskAlerts.length} alerts requiring attention`}
          />
          <div className="admin-alert-list">
            {riskAlerts.map((alert) => {
              const tone =
                alert.type === "high"
                  ? "red"
                  : alert.type === "medium"
                    ? "gold"
                    : "blue";

              return (
                <div className="admin-alert" data-tone={tone} key={alert.id}>
                  <AlertTriangle className="admin-alert__icon" size={14} />
                  <div className="admin-alert__body">
                    <p className="admin-alert__message">{alert.message}</p>
                    <div className="admin-inline-group admin-inline-group--tight">
                      <span className="admin-text-muted admin-text-xs">
                        {alert.user}
                      </span>
                      <span className="admin-text-muted admin-text-xs">-</span>
                      <span className="admin-text-muted admin-text-xs">
                        {alert.time}
                      </span>
                    </div>
                  </div>
                  <AdminStatusBadge status={alert.type} />
                </div>
              );
            })}
          </div>
        </AdminCard>

        <div className="admin-stack">
          <AdminCard>
            <AdminCardHeading title="Event Exposure Limits" />
            <div className="admin-stack">
              {riskExposureLimits.map((limit) => (
                <div className="admin-progress" key={limit.event}>
                  <div className="admin-progress__header">
                    <span className="admin-text-secondary">{limit.event}</span>
                    <span className="admin-text-strong" data-tone={limit.tone}>
                      ${limit.used}k / ${limit.limit}k
                    </span>
                  </div>
                  <div className="admin-progress__track">
                    <span
                      className="admin-progress__value"
                      data-tone={limit.tone}
                      style={
                        {
                          width: `${Math.min(
                            (limit.used / limit.limit) * 100,
                            100,
                          )}%`,
                        } as CSSProperties
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <AdminCardHeading title="Risk Controls" />
            <div className="admin-setting-list">
              {riskControls.map((control) => (
                <div className="admin-setting-row" key={control.label}>
                  <span className="admin-text-secondary">{control.label}</span>
                  <div className="admin-inline-group admin-inline-group--tight">
                    <span className="admin-text-primary admin-text-strong">
                      {control.value}
                    </span>
                    <AdminButton size="sm" variant="ghost">
                      <Edit size={10} />
                    </AdminButton>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

export function ReportsSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Reports & Analytics"
        subtitle="Financial, operational, and compliance reports"
      />

      <div className="admin-grid admin-grid--reports">
        {reportCards.map((report) => {
          const Icon = report.icon;

          return (
            <AdminCard className="admin-report-card" interactive key={report.title}>
              <div className="admin-report-card__header">
                <div className="admin-card__icon" data-tone={report.tone}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="admin-report-card__title">{report.title}</p>
                  <p className="admin-report-card__description">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="admin-report-card__footer">
                <span className="admin-text-muted admin-text-xs">
                  Last: {report.lastGenerated}
                </span>
                <div className="admin-inline-group admin-inline-group--tight">
                  <AdminButton size="sm" variant="ghost">
                    <Eye size={11} />
                    View
                  </AdminButton>
                  <AdminButton size="sm" variant="ghost">
                    <Download size={11} />
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}

export function BetManagementSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Bet Management"
        subtitle="All bets, settlements, and void management"
        actions={
          <>
            <AdminButton variant="ghost">
              <RefreshCw size={13} />
              Refresh
            </AdminButton>
            <AdminButton variant="ghost">
              <Download size={13} />
              Export
            </AdminButton>
          </>
        }
      />

      <div className="admin-grid admin-grid--stats-5">
        {betSummaryStats.map((stat) => (
          <AdminSummaryCard
            key={stat.label}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>

      <div className="admin-filter-row">
        {betFilters.map((filter) => (
          <AdminButton
            key={filter}
            variant={filter === "All Bets" ? "solid" : "ghost"}
          >
            {filter}
          </AdminButton>
        ))}
      </div>

      <AdminCard>
        <AdminTableShell>
          <table className="admin-table">
            <thead>
              <tr>
                {[
                  "Bet ID",
                  "User",
                  "Sport",
                  "Event",
                  "Market",
                  "Odds",
                  "Stake",
                  "Potential Win",
                  "Status",
                  "Time",
                  "Actions",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBets.map((bet) => (
                <tr key={`${bet.id}-management`}>
                  <td className="admin-text-blue admin-text-strong admin-text-xs">
                    {bet.id}
                  </td>
                  <td className="admin-text-primary admin-text-strong">
                    {bet.user}
                  </td>
                  <td>{bet.sport}</td>
                  <td className="admin-truncate-cell">{bet.event}</td>
                  <td>{bet.market}</td>
                  <td className="admin-text-gold admin-text-strong">
                    {bet.odds}
                  </td>
                  <td className="admin-text-primary admin-text-strong">
                    {bet.stake}
                  </td>
                  <td className="admin-text-accent admin-text-strong">
                    {calculatePotentialWin(bet.stake, bet.odds)}
                  </td>
                  <td>
                    <AdminStatusBadge status={bet.status} />
                  </td>
                  <td className="admin-text-muted admin-text-xs">
                    {bet.time}
                  </td>
                  <td>
                    <div className="admin-inline-group admin-inline-group--tight">
                      <AdminButton size="sm" variant="ghost">
                        <Eye size={11} />
                      </AdminButton>
                      <AdminButton size="sm" variant="ghost">
                        <XCircle size={11} />
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </AdminCard>
    </div>
  );
}

export function SettingsSection() {
  return (
    <div className="admin-panel">
      <AdminSectionIntro
        title="Platform Settings"
        subtitle="System configuration and admin preferences"
      />

      <div className="admin-grid admin-grid--double">
        {settingsSections.map((section) => (
          <AdminCard key={section.title}>
            <AdminCardHeading title={section.title} />
            <div className="admin-setting-list">
              {section.items.map((item) => (
                <div className="admin-setting-row" key={item}>
                  <span className="admin-text-secondary">{item}</span>
                  <AdminButton size="sm" variant="ghost">
                    <Edit size={10} />
                    Edit
                  </AdminButton>
                </div>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
