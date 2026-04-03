import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payments")({
  component: PaymentsPage,
});

type StkPushResponse = {
  message: string;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  customerMessage?: string;
};

function PaymentsPage() {
  const [method, setMethod] = useState<"mpesa" | "airtel">("mpesa");
  const [phone, setPhone] = useState("254712345678");
  const [amount, setAmount] = useState("100");
  const [accountReference, setAccountReference] = useState("BET-DEPOSIT");
  const [description, setDescription] = useState("Betting wallet deposit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<StkPushResponse | null>(null);

  const isFormValid = useMemo(() => {
    return phone.trim().length >= 10 && Number(amount) >= 1;
  }, [amount, phone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid) {
      toast.error("Enter a valid phone and amount.");
      return;
    }

    setIsSubmitting(true);
    setResponse(null);

    try {
      const { data } = await api.post<StkPushResponse>(
        "/payments/mpesa/stk-push",
        {
          method,
          phone,
          amount: Number(amount),
          accountReference,
          description,
        },
      );

      setResponse(data);
      toast.success(data.customerMessage ?? "STK push sent. Check your phone.");
    } catch (error: unknown) {
      const fallbackMessage = "Could not start M-Pesa payment. Try again.";
      const messageFromApi =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } })
          .response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;

      toast.error(messageFromApi ?? fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#0f3553] bg-gradient-to-b from-[#03192b] to-[#02101e] p-6 text-white shadow-2xl sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-wide">DEPOSIT</h1>
      <p className="mt-2 text-sm text-slate-200">
        Please select a payment method:
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMethod("mpesa")}
          className={`h-14 rounded-md border text-left font-bold transition ${
            method === "mpesa"
              ? "border-lime-300 bg-gradient-to-r from-[#0abf21] to-[#0b9d1f] text-white"
              : "border-[#2c4d64] bg-[#0a2a3f] text-slate-200 hover:bg-[#12364e]"
          }`}
        >
          <span className="px-5 tracking-wide">M-PESA</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod("airtel");
            toast.info("Airtel Money coming soon. Using M-Pesa STK for now.");
          }}
          className={`h-14 rounded-md border text-left font-bold transition ${
            method === "airtel"
              ? "border-red-300 bg-gradient-to-r from-[#7e0a0a] to-[#5f0505] text-white"
              : "border-[#4d2c32] bg-[#2a0f14] text-rose-100 hover:bg-[#3b171e]"
          }`}
        >
          <span className="px-5 tracking-wide">AIRTEL MONEY</span>
        </button>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-200">
          Amount
          <div className="flex w-full overflow-hidden rounded-md border border-[#2b5068] bg-[#f3f3f3]">
            <span className="flex h-11 items-center border-r border-zinc-300 px-3 text-xs font-semibold text-zinc-600">
              KSH
            </span>
            <input
              className="h-11 w-full bg-transparent px-3 text-zinc-900 outline-none"
              value={amount}
              type="number"
              min={1}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Amount to deposit"
            />
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="h-11 rounded-none bg-[#07a6e8] px-6 font-bold text-white hover:bg-[#0899d3]"
            >
              {isSubmitting ? "WAIT..." : "DEPOSIT"}
            </Button>
          </div>
        </label>

        <p className="text-sm text-slate-300">
          Minimum KSH 1.00, Maximum KSH 250,000.00
        </p>

        <label className="grid gap-1 text-sm font-medium text-slate-200">
          M-Pesa Phone Number
          <input
            className="h-10 rounded-md border border-[#2b5068] bg-[#06243a] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="2547XXXXXXXX"
            autoComplete="tel"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-200">
            Account Reference
            <input
              className="h-10 rounded-md border border-[#2b5068] bg-[#06243a] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
              value={accountReference}
              onChange={(event) => setAccountReference(event.target.value)}
              placeholder="BET-DEPOSIT"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-200">
            Description
            <input
              className="h-10 rounded-md border border-[#2b5068] bg-[#06243a] px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Betting wallet deposit"
            />
          </label>
        </div>
      </form>

      {response ? (
        <div className="mt-5 rounded-md border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <p className="font-semibold">{response.message}</p>
          {response.customerMessage ? (
            <p className="mt-1">{response.customerMessage}</p>
          ) : null}
          {response.checkoutRequestId ? (
            <p className="mt-1 break-all">
              Checkout Request ID: {response.checkoutRequestId}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
