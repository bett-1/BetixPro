import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { api } from "@/api/axiosConfig";
import AuthCard from "@/components/auth/AuthCard";

const KENYAN_PHONE_REGEX = /^(\+?254|0)(7|1)\d{8}$/;

type Step = "email" | "success" | "instructions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [sentEmail, setSentEmail] = useState("");

  const isValid = email.length > 4 && KENYAN_PHONE_REGEX.test(phone.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const { data } = await api.post<{ message: string }>(
        "/auth/forgot-password",
        {
          email,
          phone,
        },
      );

      // Check if email was not found
      if (data.message.includes("No account found")) {
        setErrorMessage("Email does not exist in our system.");
        setLoading(false);
        return;
      }

      // Email exists and reset link was sent
      setSentEmail(email);
      setStep("success");
      
      // Auto-transition to instructions after 2 seconds
      setTimeout(() => {
        setStep("instructions");
      }, 2000);
    } catch {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRestartProcess() {
    setEmail("");
    setPhone("");
    setErrorMessage("");
    setSentEmail("");
    setStep("email");
  }

  if (step === "success") {
    return (
      <AuthCard
        title="Success!"
        subtitle="Reset link sent"
        backTo="/"
        backLabel="Back to home"
        footer={
          <p className="text-center text-sm text-admin-text-muted">
            <Link className="font-semibold text-admin-accent" to="/">
              Go to home
            </Link>
          </p>
        }
      >
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-admin-border-success bg-admin-bg-success p-3 text-center">
            <p className="text-sm font-medium text-admin-accent">
              ✓ Email verified
            </p>
            <p className="mt-1 text-xs text-admin-text-muted">
              Reset link sent to {sentEmail}
            </p>
          </div>
          <p className="text-xs text-admin-text-muted">
            Redirecting to instructions...
          </p>
        </div>
      </AuthCard>
    );
  }

  if (step === "instructions") {
    return (
      <AuthCard
        title="Check your email"
        subtitle="Password reset instructions"
        backTo="/"
        backLabel="Back to home"
        footer={
          <p className="text-center text-sm text-admin-text-muted">
            <Link className="font-semibold text-admin-accent" to="/">
              Go to home
            </Link>
          </p>
        }
      >
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-admin-border bg-[var(--color-bg-elevated)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-admin-text-primary">
              What to do next:
            </h3>
            <ol className="space-y-2 text-xs text-admin-text-muted">
              <li className="flex gap-2">
                <span className="font-semibold text-admin-accent">1.</span>
                <span>Check your inbox at <strong>{sentEmail}</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-admin-accent">2.</span>
                <span>Click the reset link in the email (valid for 15 minutes)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-admin-accent">3.</span>
                <span>Create a new password</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-admin-accent">4.</span>
                <span>Log in with your new password</span>
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-admin-border-warning bg-admin-bg-warning/10 p-3">
            <p className="text-xs text-admin-text-muted">
              <strong>⚠ Link expires in 15 minutes.</strong> If you don't see the email, check your spam folder or request a new link.
            </p>
          </div>

          <button
            onClick={handleRestartProcess}
            className="h-10 w-full rounded-lg border border-admin-border bg-[var(--color-bg-elevated)] text-sm font-semibold text-admin-text-primary hover:bg-admin-border"
          >
            Request another link
          </button>
        </div>
      </AuthCard>
    );
  }

  // step === "email"
  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your details to reset your password"
      backTo="/"
      backLabel="Back to home"
      footer={
        <p className="text-center text-sm text-admin-text-muted">
          Remembered your password?{" "}
          <Link className="font-semibold text-admin-accent" to="/">
            Go to home
          </Link>
        </p>
      }
    >
      <form className="grid gap-3.5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <label
            className="text-sm font-medium text-admin-text-primary"
            htmlFor="forgot-email"
          >
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value.trim())}
            disabled={loading}
            className="h-11 rounded-xl border border-admin-border bg-[var(--color-bg-elevated)] px-3 text-sm text-admin-text-primary outline-none disabled:opacity-60"
          />
          {errorMessage && (
            <p className="text-xs text-red-500">{errorMessage}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <label
            className="text-sm font-medium text-admin-text-primary"
            htmlFor="forgot-phone"
          >
            Phone
          </label>
          <input
            id="forgot-phone"
            type="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="07XXXXXXXX or +2547XXXXXXXX"
            disabled={loading}
            className="h-11 rounded-xl border border-admin-border bg-[var(--color-bg-elevated)] px-3 text-sm text-admin-text-primary outline-none disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="h-10 rounded-lg bg-admin-accent text-sm font-semibold text-[var(--color-text-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Validating..." : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
