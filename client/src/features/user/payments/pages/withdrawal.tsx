import { api } from "@/api/axiosConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  LoaderCircle,
  Smartphone,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatMoney } from "../data";
import { useEnabledPaymentMethods } from "../hooks/usePaymentMethods";
import { useWalletSummary, walletSummaryQueryKey } from "../wallet";

type WithdrawalResponse = {
  message: string;
  transactionId: string;
  wallet: { balance: number };
  details: { amount: number; fee: number; netAmount: number; phone: string };
};

function normalizePhone(phone: string) {
  const compact = phone.replace(/\s+/g, "").replace(/^\+/, "");
  return compact.startsWith("0") ? `254${compact.slice(1)}` : compact;
}

function isPhoneValid(phone: string) {
  return /^254(7|1)\d{8}$/.test(phone);
}

export default function PaymentsWithdrawalPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"mpesa" | "paystack" | null>(null);
  const { data: walletData, isLoading: isWalletLoading } = useWalletSummary();
  const queryClient = useQueryClient();

  const accountPhone = useMemo(
    () => normalizePhone(user?.phone ?? ""),
    [user?.phone],
  );
  const [phone, setPhone] = useState(accountPhone);
  const normalizedPhone = useMemo(() => normalizePhone(phone), [phone]);

  const enabledMethodsQuery = useEnabledPaymentMethods();
  const isMpesaEnabled = enabledMethodsQuery.data?.mpesa ?? false;
  const isPaystackEnabled = enabledMethodsQuery.data?.paystack ?? false;

  const enabledMethods = useMemo(() => {
    const methods: ("mpesa" | "paystack")[] = [];
    if (isMpesaEnabled) methods.push("mpesa");
    if (isPaystackEnabled) methods.push("paystack");
    return methods;
  }, [isMpesaEnabled, isPaystackEnabled]);

  useEffect(() => {
    if (enabledMethods.length > 0 && !selectedProvider) {
      setSelectedProvider(enabledMethods[0]);
    }
  }, [enabledMethods, selectedProvider]);

  const withdrawalMutation = useMutation({
    mutationFn: async (data: { amount: number; phone: string; provider: string }) => {
      const response = await api.post<WithdrawalResponse>(
        "/payments/withdrawals",
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        data.message || "Withdrawal request submitted successfully!",
      );
      setAmount("");
      setShowConfirmModal(false);
      queryClient.invalidateQueries({ queryKey: walletSummaryQueryKey });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to submit withdrawal request",
      );
    },
  });

  const limits = enabledMethodsQuery.data?.limits;

  const minWithdrawal = limits?.minWithdrawal ?? 50;
  const maxWithdrawal = limits?.maxWithdrawal ?? 500000;
  const feePercentage = limits?.feePercentage ?? 15;

  const numAmount = Number(amount) || 0;
  const feeAmount =
    numAmount > 0 ? Math.ceil((numAmount * feePercentage) / 100) : 0;
  const netAmount = numAmount - feeAmount;
  const balance = walletData?.wallet?.balance ?? 0;
  const totalNeeded = numAmount;

  useEffect(() => {
    if (accountPhone && !phone) setPhone(accountPhone);
  }, [accountPhone, phone]);

  const canWithdraw = useMemo(
    () =>
      numAmount >= minWithdrawal &&
      numAmount <= maxWithdrawal &&
      totalNeeded <= balance &&
      isPhoneValid(normalizedPhone),
    [
      numAmount,
      balance,
      normalizedPhone,
      totalNeeded,
      minWithdrawal,
      maxWithdrawal,
    ],
  );

  function validateWithdrawalInput() {
    if (!isPhoneValid(normalizedPhone)) {
      toast.error("Invalid phone. Use format: 2547XXXXXXXX");
      return false;
    }

    if (numAmount < minWithdrawal) {
      toast.error(
        `Minimum withdrawal is KES ${minWithdrawal.toLocaleString()}.`,
      );
      return false;
    }

    if (numAmount > maxWithdrawal) {
      toast.error(
        `Maximum withdrawal is KES ${maxWithdrawal.toLocaleString()}.`,
      );
      return false;
    }

    if (totalNeeded > balance) {
      toast.error(
        `Insufficient balance. Need KES ${totalNeeded.toLocaleString()}.`,
      );
      return false;
    }

    return true;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateWithdrawalInput()) return;
    setShowConfirmModal(true);
  }

  async function onConfirmWithdrawal() {
    if (!canWithdraw || !selectedProvider) return;

    setIsSubmitting(true);
    try {
      await withdrawalMutation.mutateAsync({
        amount: numAmount,
        phone: normalizedPhone,
        provider: selectedProvider,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const phoneError = phone && !isPhoneValid(normalizePhone(phone));
  const busy = isSubmitting || withdrawalMutation.isPending;

  if (isWalletLoading) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mx-auto w-full max-w-[700px] space-y-4">
          <article className="overflow-hidden rounded-3xl border border-[#1a2f45] bg-[#0b1421] shadow-2xl">
            <div className="border-b border-[#1a2f45] bg-[#0d1829] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-xl bg-[#14263a]" />
                <div className="space-y-2">
                  <div className="h-3 w-28 animate-pulse rounded bg-[#14263a]" />
                  <div className="h-2.5 w-44 animate-pulse rounded bg-[#122034]" />
                </div>
              </div>
            </div>

            <div className="space-y-4 px-7 py-6">
              <div className="h-12 animate-pulse rounded-2xl bg-[#122034]" />
              <div className="h-12 animate-pulse rounded-2xl bg-[#122034]" />
              <div className="h-12 animate-pulse rounded-2xl bg-[#f5c518]/30" />
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mx-auto w-full max-w-[700px] space-y-4">
        <article className="overflow-hidden rounded-3xl border border-[#1a2f45] bg-[#0b1421] shadow-2xl">
          <div className="border-b border-[#1a2f45] bg-[#0d1829] px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#f5c518]/20 bg-[#f5c518]/10">
                    <ArrowUpRight size={17} className="text-[#f5c518]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Withdraw Funds
                    </h2>
                    <p className="text-xs text-[#4a6a85]">
                      Choose provider and enter amount
                    </p>
                  </div>
                </div>

                {enabledMethods.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-xl border border-[#1a2f45] bg-[#0f1d2e] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#f5c518]/50">
                        {selectedProvider === "mpesa" ? (
                          <>
                            <Smartphone className="h-3.5 w-3.5 text-[#f5c518]" />
                            M-Pesa
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3.5 w-3.5 text-[#f5c518]" />
                            Paystack
                          </>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-[#4a6a85]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border border-[#1a2f45] bg-[#0b1421] text-white">
                      {enabledMethods.map((m) => (
                        <DropdownMenuItem
                          key={m}
                          onClick={() => setSelectedProvider(m)}
                          className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-xs font-medium hover:bg-[#14263a]"
                        >
                          <div className="flex items-center gap-2">
                            {m === "mpesa" ? (
                              <Smartphone className="h-3.5 w-3.5" />
                            ) : (
                              <CreditCard className="h-3.5 w-3.5" />
                            )}
                            {m === "mpesa" ? "M-Pesa" : "Paystack"}
                          </div>
                          {selectedProvider === m && <Check className="h-3.5 w-3.5 text-[#f5c518]" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
          </div>

          <div className="space-y-5 px-7 py-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-[#3d5a73]">
                    Amount (KES)
                  </span>
                  <div className="flex overflow-hidden rounded-2xl border border-[#1a2f45] bg-[#0f1d2e] transition-colors focus-within:border-[#f5c518]">
                    <span className="flex items-center gap-1.5 border-r border-[#1a2f45] px-3 text-xs font-bold text-[#3d5a73]">
                      <Banknote className="h-3.5 w-3.5" />
                      KES
                    </span>
                    <input
                      className="h-12 w-full bg-transparent px-3 text-base font-semibold text-white outline-none placeholder:text-[#2e4a63]"
                      type="number"
                      min={minWithdrawal}
                      max={maxWithdrawal}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Min ${minWithdrawal}`}
                    />
                  </div>
                  <p className="text-xs text-[#3d5a73]">
                    Minimum withdrawal: KES {minWithdrawal.toLocaleString()}
                  </p>
                </label>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <p className="text-xs font-medium uppercase tracking-widest text-[#3d5a73]">
                      {selectedProvider === "mpesa" ? "M-Pesa Number" : "Phone Number"}
                    </p>
                  </div>
                  <div className="relative">
                    <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d5a73]" />
                    <input
                      className={`mt-2 h-12 w-full rounded-2xl border bg-[#0f1d2e] px-3 pl-10 text-sm text-white outline-none placeholder:text-[#2e4a63] transition-colors ${
                        phoneError
                          ? "border-red-500/60 focus:border-red-500"
                          : "border-[#1a2f45] focus:border-[#f5c518]"
                      }`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="2547XXXXXXXX"
                    />
                  </div>
                  <p
                    className={`mt-2 text-xs ${
                      phoneError ? "text-red-400" : "text-[#3d5a73]"
                    }`}
                  >
                    {phoneError
                      ? "Use format: 2547XXXXXXXX"
                      : "Withdrawals are sent to this number."}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full rounded-2xl bg-[#f5c518] text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                )}
                {busy ? "Processing..." : "Request Withdrawal"}
              </Button>
            </form>
          </div>
        </article>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-[400px] border-[#1a2f45] bg-[#0b1421] p-0 text-white overflow-hidden shadow-2xl">
          <DialogHeader className="border-b border-[#1a2f45] bg-[#0d1829] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5c518]/10 text-[#f5c518]">
                <Banknote size={16} />
              </div>
              <DialogTitle className="text-sm font-bold text-white tracking-tight uppercase">
                Confirm Withdrawal
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-5 py-4">
            <div className="rounded-xl border border-[#1a2f45] bg-[#0d1829]/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#4a6a85] uppercase tracking-wider">
                <span>Withdrawal Details</span>
                <span className="flex items-center gap-1.5 text-white bg-[#14263a] px-2 py-0.5 rounded-md lowercase normal-case">
                  <Smartphone size={10} className="text-[#f5c518]" />
                  {normalizedPhone}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9bb0c6]">Amount</span>
                  <span className="font-semibold text-white">{formatMoney(numAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9bb0c6]">Service Fee ({feePercentage}%)</span>
                  <span className="font-semibold text-red-400">-{formatMoney(feeAmount)}</span>
                </div>
                <div className="mt-2 border-t border-[#1a2f45] pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f5c518]">You Receive</span>
                  <span className="text-base font-black text-white">{formatMoney(netAmount)}</span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-center text-[#4a6a85] leading-normal px-2">
              Funds will be sent to your registered number.
            </p>
          </div>

          <DialogFooter className="border-t border-[#1a2f45] bg-[#0d1829]/30 px-5 py-4 gap-2.5 flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={busy}
              className="h-10 flex-1 border-[#294157] bg-transparent text-[#dce7f2] hover:bg-[#102134] hover:text-white rounded-xl text-[11px] font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void onConfirmWithdrawal()}
              disabled={busy}
              className="h-10 flex-1 bg-[#f5c518] text-black hover:bg-[#e6b800] rounded-xl text-[11px] font-black shadow-lg shadow-[#f5c518]/10"
            >
              {busy ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "CONFIRM"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
