import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentFeedbackModal } from "@/components/PaymentFeedbackModal";
import { PaymentLoadingModal } from "@/components/PaymentLoadingModal";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "../data";
import {
  usePaystackInitialize,
  usePaystackVerification,
} from "../hooks/usePaystackPayment";

const quickAmounts = [500, 1000, 2500, 5000];
const pendingStorageKey = "betwise-mpesa-pending-reference";

function normalizeAmount(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function MpesaDepositPage() {
  const { user } = useAuth();
  const initializeMutation = usePaystackInitialize();
  const [verificationReference, setVerificationReference] = useState<
    string | null
  >(null);
  const [amount, setAmount] = useState("100");
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | null
  >(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldVerify, setShouldVerify] = useState(false);
  const verificationQuery = usePaystackVerification(
    shouldVerify ? verificationReference : null,
  );

  const amountValue = useMemo(() => Number(amount) || 0, [amount]);

  useEffect(() => {
    const handleCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const routeStatus = params.get("status");

      if (!routeStatus) {
        localStorage.removeItem(pendingStorageKey);
        return;
      }

      window.history.replaceState({}, document.title, window.location.pathname);

      if (routeStatus === "success") {
        setPaymentStatus("success");
        setShowPaymentResult(true);
        setIsProcessing(false);
        localStorage.removeItem(pendingStorageKey);
        toast.success("Payment successful! Your wallet has been credited.");
      } else if (routeStatus === "failed") {
        setPaymentStatus("failed");
        setShowPaymentResult(true);
        setIsProcessing(false);
        localStorage.removeItem(pendingStorageKey);
        toast.error("Payment failed. Please try again.");
      } else if (routeStatus === "pending") {
        setIsProcessing(true);
        const storedReference = localStorage.getItem(pendingStorageKey);
        if (storedReference) {
          setVerificationReference(storedReference);
          setPaymentReference(storedReference);
          setShouldVerify(true);
        } else {
          setIsProcessing(false);
        }
      }
    };

    handleCallback();
  }, []);

  useEffect(() => {
    if (!shouldVerify || !verificationReference) return;

    const status = verificationQuery.data?.status;
    if (!status) return;

    if (status === "success") {
      localStorage.removeItem(pendingStorageKey);
      setPaymentStatus("success");
      setShowPaymentResult(true);
      setIsProcessing(false);
      setShouldVerify(false);
      toast.success("Payment confirmed! Your wallet has been credited.");
      return;
    }

    if (status === "failed" || status === "reversed") {
      localStorage.removeItem(pendingStorageKey);
      setPaymentStatus("failed");
      setShowPaymentResult(true);
      setIsProcessing(false);
      setShouldVerify(false);
      toast.error("Payment could not be confirmed.");
      return;
    }

    if (status === "pending") {
      setIsProcessing(true);
    }
  }, [verificationQuery.data?.status, shouldVerify, verificationReference]);

  useEffect(() => {
    if (
      shouldVerify &&
      verificationReference &&
      verificationQuery.isError &&
      verificationQuery.failureCount >= 10
    ) {
      localStorage.removeItem(pendingStorageKey);
      setPaymentStatus("failed");
      setShowPaymentResult(true);
      setIsProcessing(false);
      setShouldVerify(false);
      toast.error(
        "Payment verification timed out. Please check your transaction status.",
      );
    }
  }, [
    verificationQuery.isError,
    verificationQuery.failureCount,
    shouldVerify,
    verificationReference,
  ]);

  const onClose = () => {
    setShowPaymentResult(false);
    setPaymentReference(null);
    setPaymentStatus(null);
    setShouldVerify(false);
  };

  const onRetry = () => {
    if (paymentReference) {
      setShowPaymentResult(false);
      setPaymentStatus(null);
      setVerificationReference(paymentReference);
      setShouldVerify(true);
      setIsProcessing(true);
      toast.loading("Checking payment status...");
    }
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user?.email) {
      toast.error("User email not found.");
      return;
    }

    if (amountValue < 100) {
      toast.error("Minimum deposit is KES 100.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await initializeMutation.mutateAsync({
        email: user.email,
        amount: amountValue,
        metadata: {
          userId: user.id,
          source: "mpesa-deposit-page",
        },
      });

      localStorage.setItem(pendingStorageKey, response.reference);
      setVerificationReference(response.reference);
      setPaymentReference(response.reference);

      toast.loading("Redirecting to secure checkout...", {
        description: `Amount: KES ${formatMoney(amountValue)}`,
      });

      setTimeout(() => {
        window.location.assign(response.authorization_url);
      }, 500);
    } catch (error: any) {
      setIsProcessing(false);
      const message =
        error?.response?.data?.error ??
        error?.response?.data?.message ??
        error?.message ??
        "Unable to start payment";
      toast.error(message);
    }
  }

  return (
    <section className="mx-auto max-w-sm px-4 py-6">
      <PaymentLoadingModal
        isOpen={isProcessing}
        amount={amountValue}
        message={
          verificationReference
            ? "Confirming your M-Pesa payment"
            : "Preparing M-Pesa checkout"
        }
      />

      <PaymentFeedbackModal
        isOpen={showPaymentResult && paymentStatus === "success"}
        status="success"
        title="Payment Successful"
        message="Your wallet has been credited successfully."
        onClose={onClose}
      />

      <PaymentFeedbackModal
        isOpen={showPaymentResult && paymentStatus === "failed"}
        status="failed"
        title="Payment Failed"
        message="Your payment could not be confirmed. Please try again."
        onClose={onClose}
        onRetry={onRetry}
      />

      <article className="overflow-hidden rounded-2xl border border-[#1e3048] bg-[#0b1421] shadow-2xl">
        {/* ── Header ── */}
        <div className="relative flex items-center gap-3 border-b border-[#1e3048] bg-[#0d1829] px-5 py-3.5">
          {/* green left accent bar */}
          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#00A859]" />

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
            alt="M-Pesa"
            className="h-6 w-auto object-contain"
          />

          <div className="h-4 w-px bg-[#243a53]" />

          <div className="flex flex-1 items-baseline justify-between">
            <span className="text-sm font-semibold text-white">
              Deposit Funds
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#00A859]/10 px-2 py-0.5 text-[10px] font-medium text-[#00A859]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A859]" />
              Secure
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5">
          {/* Quick amounts — single row */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(String(value))}
                className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                  amountValue === value
                    ? "border-[#00A859] bg-[#00A859]/10 text-[#00A859]"
                    : "border-[#1e3048] bg-[#0f1a2a] text-[#8a9bb0] hover:border-[#00A859]/40 hover:text-white"
                }`}
              >
                {formatMoney(value)}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-[#5a7a99] uppercase tracking-wide">
                Amount (KES)
              </span>
              <Input
                value={amount}
                onChange={(event) =>
                  setAmount(normalizeAmount(event.target.value))
                }
                inputMode="numeric"
                type="text"
                placeholder="100"
                className="h-12 rounded-xl border-[#1e3048] bg-[#0f1a2a] text-base text-white placeholder:text-[#3a5068] transition-colors focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859]"
              />
            </label>

            <Button
              type="submit"
              disabled={initializeMutation.isPending || isProcessing}
              className="h-12 w-full rounded-xl bg-[#00A859] text-sm font-bold text-white transition-colors hover:bg-[#008f4c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : "Pay with M-Pesa"}
            </Button>
          </form>
        </div>
      </article>
    </section>
  );
}
