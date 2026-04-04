import { Building2, MapPin, Smartphone, Wifi } from "lucide-react";
import {
  AdminCard,
  AdminCardHeader,
  AdminSectionHeader,
  MetricCard,
} from "../../components/ui";
import {
  financialKPIs,
  geoAnalytics,
  deviceAnalytics,
  carrierAnalytics,
  branchAnalytics,
} from "../../data/mock-data";

export default function Analytics() {
  const totalUsers = geoAnalytics.reduce((sum, item) => sum + item.users, 0);
  const mobileUsers = deviceAnalytics
    .filter((item) => item.device.toLowerCase().includes("mobile"))
    .reduce((sum, item) => sum + item.users, 0);
  const desktopUsers =
    deviceAnalytics.find((item) => item.device === "Desktop")?.users ?? 0;
          subtitle="Simple Kenya-first view of revenue, audience, and branch activity"
  const mobileShare = ((mobileUsers / totalUsers) * 100).toFixed(1);
  const desktopShare = ((desktopUsers / totalUsers) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <AdminSectionHeader
            actions={
              <div className="flex flex-wrap gap-2 text-xs text-admin-text-muted">
                {timeRanges.map((range) => (
                  <span
                    className={
                      range === "7d"
                        ? "rounded-full bg-admin-accent px-3 py-1 font-semibold text-black"
                        : "rounded-full bg-admin-surface px-3 py-1 font-semibold text-admin-text-secondary"
                    }
                    key={range}
                  >
                    {range}
                  </span>
                ))}
              </div>
            }
                  }
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                >
                  {range}
                </span>
              ))}
            </div>
          }
        <div className="grid gap-4 xl:grid-cols-3">
          <AdminCard className="xl:col-span-1">
            <AdminCardHeader title="Users by Location" subtitle="Kenya and nearby markets" />
            <div className="mt-4 space-y-3">
              {geoAnalytics.map((location) => (
                <div
                  className="rounded-2xl border border-admin-border bg-admin-surface/40 px-4 py-3"
                  key={`${location.country}-${location.region}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-admin-text-primary">
                        {location.country}
                      </p>
                      <p className="text-xs text-admin-text-muted">{location.region}</p>
                    </div>
                    <p className="text-sm font-semibold text-admin-text-primary">
                      {location.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-admin-text-secondary">
                    {location.users.toLocaleString()} users · {location.bets.toLocaleString()} bets
                  </p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="xl:col-span-1">
            <AdminCardHeader title="Device Split" subtitle="Mobile-first usage pattern" />
            <div className="mt-4 space-y-3">
              {deviceAnalytics.map((device) => (
                <div
                  className="rounded-2xl border border-admin-border bg-admin-surface/40 px-4 py-3"
                  key={device.device}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-admin-text-primary">{device.device}</p>
                    <p className="text-sm font-semibold text-admin-text-primary">
                      {device.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-admin-text-secondary">
                    {device.users.toLocaleString()} users · {device.avgSessionDuration} avg session
                  </p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="xl:col-span-1">
            <AdminCardHeader title="Carrier Insights" subtitle="M-Pesa carrier mix" />
            <div className="mt-4 space-y-3">
              {carrierAnalytics.map((carrier) => (
                <div
                  className="rounded-2xl border border-admin-border bg-admin-surface/40 px-4 py-3"
                  key={carrier.carrier}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="inline-flex items-center gap-2 font-semibold text-admin-text-primary">
                      <Wifi size={13} />
                      {carrier.carrier}
                    </p>
                    <p className="text-sm font-semibold text-admin-text-primary">
                      {carrier.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-admin-text-secondary">
                    {carrier.users.toLocaleString()} users · {carrier.avgBetSize} avg bet
                  </p>
                </div>
              ))}
            </div>
          </AdminCard>
                      {carrier.avgPayout}
                    </td>
                  </tr>
                ))}
            title="Branches"
            subtitle="Primary local outlets and operating status"
          </TableShell>
          subtitle="Mobile-first, region-aware, and payment-led"
        />
        <p className="text-sm text-admin-text-secondary">
          Keep campaigns centered on Kenya, prioritize mobile money rails, and
          treat desktop as a secondary channel.
        </p>
        <p className="mt-2 text-xs text-admin-text-muted">
          Mobile share {mobileShare} percent, desktop share {desktopShare}{" "}
          percent.
        </p>
      </AdminCard>
    </div>
  );
}
