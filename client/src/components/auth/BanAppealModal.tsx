import { useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { isAxiosError } from "axios";
import { AlertTriangle, FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createBanAppealAction } from "@/hooks/useBanAppeals";
import { useAuth } from "@/context/AuthContext";

type BanAppealModalProps = {
  appealToken?: string | null;
  banReason?: string | null;
  onSuccess?: () => void;
};

export default function BanAppealModal({
  appealToken,
  banReason,
  onSuccess,
}: BanAppealModalProps) {
  const { authModal, openAuthModal, closeAuthModal } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const reasonText = useMemo(
    () => banReason || "No reason was provided by the admin.",
    [banReason],
  );

  const canShow = authModal === "ban-appeal";

  useMemo(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
    }
    return undefined;
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!appealToken) {
      setErrorMessage("Unable to submit appeal. Please try logging in again.");
      return;
    }

    if (appealText.trim().length < 10) {
      setErrorMessage(
        "Please provide at least 10 characters explaining your appeal.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createBanAppealAction(appealToken, appealText.trim());
      toast.success("Your appeal has been submitted.");
      onSuccess?.();
      closeAuthModal();
      setAppealText("");
    } catch (error: unknown) {
      let message = "Failed to submit appeal.";
      if (isAxiosError<{ message?: string }>(error)) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted || !canShow) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => closeAuthModal()}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-red-500/20 bg-[#09111f] text-white shadow-2xl shadow-black/80">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(239,68,68,0.15),transparent)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-red-500/15 p-3 text-red-300">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300/90">
                  Account Restricted
                </p>
                <h2 className="mt-1 text-2xl font-bold">Submit an Appeal</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Your account is currently banned. You can submit one appeal
                  for review below.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => closeAuthModal()}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Close appeal modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
          <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit}>
            {errorMessage ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Appeal message
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <textarea
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  rows={8}
                  placeholder="Explain why you believe the ban should be reviewed. Include any context that may help the admin team."
                  className="min-h-[180px] w-full resize-none border-0 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Be concise and factual. Appeals that provide context are
                reviewed faster.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => closeAuthModal()}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Sending appeal...
                  </span>
                ) : (
                  "Submit Appeal"
                )}
              </button>
            </div>
          </form>

          <aside className="border-t border-white/10 bg-white/[0.02] px-6 py-6 md:border-t-0 md:border-l">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3 text-red-300">
                <FileText size={18} />
                <p className="text-sm font-semibold">Ban details</p>
              </div>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Reason
                  </p>
                  <p className="mt-1 leading-6">{reasonText}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    What happens next
                  </p>
                  <p className="mt-1 leading-6">
                    Your appeal is queued for admin review. You will regain
                    access automatically if it is approved.
                  </p>
                </div>
                {appealToken ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                    Appeal token ready
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}
