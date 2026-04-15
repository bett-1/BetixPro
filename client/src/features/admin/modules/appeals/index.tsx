import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminSectionHeader,
  StatusBadge,
} from "../../components/ui";
import {
  respondToBanAppealAction,
  useAdminBanAppealDetail,
} from "@/hooks/useBanAppeals";

export default function BanAppealReviewPage() {
  const { appealId } = useParams({ from: "/admin/appeals/$appealId" });
  const { appeal, loading, error } = useAdminBanAppealDetail(appealId);
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latestStatus = appeal?.status ?? "PENDING";
  const canRespond = latestStatus === "PENDING";

  const userName = useMemo(() => {
    return appeal?.user?.fullName || appeal?.user?.email || "Unknown user";
  }, [appeal]);

  const handleSubmit = async () => {
    if (!appeal) return;
    if (responseText.trim().length < 10) {
      toast.error("Response must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await respondToBanAppealAction(appeal.id, decision, responseText.trim());
      toast.success(
        decision === "APPROVE"
          ? "Appeal approved and ban lifted"
          : "Appeal rejected and response sent",
      );
      window.location.reload();
    } catch (responseError: any) {
      toast.error(
        responseError?.response?.data?.message || "Failed to submit response",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Ban Appeal Review"
        subtitle="Review the ban appeal, respond to the user, and lift the ban if approved."
        actions={
          <Link
            to="/admin/appeals"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-admin-border/70 bg-admin-surface/45 text-admin-text-secondary hover:border-admin-border-strong hover:bg-admin-hover hover:text-admin-text-primary h-8 px-2.5 text-[11px] font-medium transition duration-200"
          >
            Back to Appeals
          </Link>
        }
      />

      {error && (
        <AdminCard className="border-admin-red/40 bg-admin-red-dim/20 text-admin-red">
          {error}
        </AdminCard>
      )}

      {loading ? (
        <AdminCard className="py-12 text-center text-admin-text-muted">
          Loading appeal...
        </AdminCard>
      ) : appeal ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <AdminCard className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Appeal Status
                </p>
                <div className="mt-2">
                  <StatusBadge
                    status={
                      latestStatus === "PENDING"
                        ? "pending"
                        : latestStatus === "APPROVED"
                          ? "active"
                          : "banned"
                    }
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Submitted
                </p>
                <p className="mt-2 text-sm text-admin-text-primary">
                  {new Date(appeal.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgba(13,33,55,0.16)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                Appeal Message
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-admin-text-primary">
                {appeal.appealText}
              </p>
            </div>

            {appeal.responseText && (
              <div className="rounded-2xl border border-admin-accent/20 bg-admin-accent/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Existing Response
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-admin-text-primary">
                  {appeal.responseText}
                </p>
              </div>
            )}
          </AdminCard>

          <div className="space-y-4">
            <AdminCard className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  User
                </p>
                <p className="mt-2 text-sm font-semibold text-admin-text-primary">
                  {userName}
                </p>
                <p className="mt-1 text-sm text-admin-text-secondary">
                  {appeal.user?.phone}
                </p>
                <p className="text-sm text-admin-text-secondary">
                  {appeal.user?.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Ban Reason
                </p>
                <p className="mt-2 text-sm text-admin-text-primary">
                  {appeal.user?.banReason || "No ban reason recorded"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
                  Decision
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <AdminButton
                    variant={decision === "APPROVE" ? "solid" : "ghost"}
                    onClick={() => setDecision("APPROVE")}
                    disabled={!canRespond}
                  >
                    Approve
                  </AdminButton>
                  <AdminButton
                    variant={decision === "REJECT" ? "solid" : "ghost"}
                    onClick={() => setDecision("REJECT")}
                    disabled={!canRespond}
                  >
                    Reject
                  </AdminButton>
                </div>
              </div>
            </AdminCard>

            <AdminCard className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-admin-text-primary">
                  Response to user
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="mt-2 min-h-32 w-full rounded-xl border border-white/10 bg-[rgba(13,33,55,0.16)] px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent/50"
                  placeholder="Explain the decision and any next steps..."
                  disabled={!canRespond || isSubmitting}
                />
              </div>

              <div className="flex gap-2">
                <Link
                  to="/admin/appeals"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-admin-border/70 bg-admin-surface/45 text-admin-text-secondary hover:border-admin-border-strong hover:bg-admin-hover hover:text-admin-text-primary h-9 px-3.5 text-sm font-medium transition duration-200 flex-1"
                >
                  Cancel
                </Link>
                <AdminButton
                  className="flex-1 bg-admin-accent hover:bg-admin-accent/90"
                  onClick={() => void handleSubmit()}
                  disabled={
                    !canRespond ||
                    isSubmitting ||
                    responseText.trim().length < 10
                  }
                >
                  {isSubmitting ? "Submitting..." : "Send Response"}
                </AdminButton>
              </div>
            </AdminCard>
          </div>
        </div>
      ) : (
        <AdminCard className="py-12 text-center text-admin-text-muted">
          Appeal not found.
        </AdminCard>
      )}
    </div>
  );
}
