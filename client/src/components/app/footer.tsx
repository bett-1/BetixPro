import { Link } from "@tanstack/react-router";
import {
  Mail,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Successfully subscribed to newsletter!");
      setIsSubscribed(true);
      setEmail("");

      // Reset subscription state after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full border-t border-[#23384f] bg-[#0b1120]">
      {/* Main Footer Content */}
      <div className="mx-auto w-full max-w-[1280px] gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5c518]">
                <span className="text-lg font-bold text-black">B</span>
              </div>
              <h3 className="text-2xl font-bold text-white">BetWise</h3>
            </div>
            <p className="mt-4 text-base leading-relaxed text-[#8a9bb0]">
              Smart betting with fast M-Pesa deposits and a secure wallet
              experience. Play responsibly.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#294157] text-[#8a9bb0] transition hover:border-[#f5c518] hover:text-[#f5c518]"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5c-.563-.074-2.313-.229-4.425-.229-4.815 0-8.175 2.95-8.175 8.362v2.937z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#294157] text-[#8a9bb0] transition hover:border-[#f5c518] hover:text-[#f5c518]"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75-2.35 7-7 7-11.667z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#294157] text-[#8a9bb0] transition hover:border-[#f5c518] hover:text-[#f5c518]"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path
                    d="M16.5 7.5a2 2 0 11-4 0 2 2 0 014 0zM6 12a6 6 0 1112 0 6 6 0 01-12 0z"
                    fill="#0b1120"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <nav className="mt-6 grid gap-4">
              <Link
                to="/"
                className="text-base text-[#8a9bb0] transition hover:text-[#f5c518] hover:translate-x-0.5"
              >
                Home
              </Link>
              <Link
                to="/user/payments"
                className="text-base text-[#8a9bb0] transition hover:text-[#f5c518] hover:translate-x-0.5"
              >
                Deposits
              </Link>
              <a
                href="#"
                className="text-base text-[#8a9bb0] transition hover:text-[#f5c518] hover:translate-x-0.5"
              >
                How It Works
              </a>
              <a
                href="#"
                className="text-base text-[#8a9bb0] transition hover:text-[#f5c518] hover:translate-x-0.5"
              >
                FAQ
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold uppercase tracking-wider text-white">
              Contact
            </h4>
            <div className="mt-6 grid gap-4 text-base text-[#8a9bb0]">
              <a
                href="mailto:support@betwise.com"
                className="transition hover:text-[#f5c518]"
              >
                support@betwise.com
              </a>
              <a
                href="tel:+254700000000"
                className="transition hover:text-[#f5c518]"
              >
                +254 700 000 000
              </a>
              <p>Nairobi, Kenya</p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="sm:col-span-2 lg:col-span-1 rounded-2xl border border-[#23384f] bg-[linear-gradient(135deg,#111d2e_0%,#0f1a2a_100%)] p-6">
            <h4 className="text-lg font-bold uppercase tracking-wider text-white">
              Stay Updated
            </h4>
            <p className="mt-2 text-sm text-[#8a9bb0]">
              Get betting tips & promotions
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-4 flex flex-col gap-3"
            >
              {isSubscribed ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-medium text-green-400">
                    subscribed!
                  </span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9bb0]" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#294157] bg-[#0f1a2a] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5a6b7d] focus:border-[#f5c518] focus:shadow-[0_0_0_2px_rgba(245,197,24,0.1)]"
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#f5c518] text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "..." : "Subscribe"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#23384f]" />

        {/* Bottom Footer */}
        <div className="mt-8 flex flex-col gap-4 text-sm text-[#8a9bb0] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} BetWise. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="transition hover:text-[#f5c518]">
              Terms
            </a>
            <span className="text-[#294157]">·</span>
            <a href="#" className="transition hover:text-[#f5c518]">
              Privacy
            </a>
            <span className="text-[#294157]">·</span>
            <a href="#" className="transition hover:text-[#f5c518]">
              Cookies
            </a>
          </div>
          <p className="font-medium text-[#f5c518]">Play Responsibly · 18+</p>
        </div>
      </div>
    </footer>
  );
}
