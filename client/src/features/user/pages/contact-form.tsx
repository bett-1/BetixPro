import { useState } from "react";
import { z } from "zod";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/axiosConfig";

const contactFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject must not exceed 100 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must not exceed 2000 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  userEmail?: string;
  onSuccess?: () => void;
}

export default function ContactForm({
  userEmail,
  onSuccess,
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<ContactFormData> = {};
      result.error.errors.forEach((error) => {
        fieldErrors[error.path[0] as keyof ContactFormData] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/contact", formData);

      toast.success("Your message has been sent successfully!");
      setFormData({ subject: "", message: "" });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to send your message. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#294157] bg-[linear-gradient(135deg,#111d2e_0%,#0f1a2a_100%)] p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Send us a Message
        </h2>
        <p className="text-[#8a9bb0] text-sm">
          Have a question or concern? We'd love to hear from you. Fill out the
          form below and we'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Display (Info Only) */}
        {userEmail && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b1120] border border-[#294157]">
            <Mail className="h-5 w-5 text-[#f5c518]" />
            <div>
              <p className="text-xs text-[#8a9bb0]">Email</p>
              <p className="text-sm font-medium text-white">{userEmail}</p>
            </div>
          </div>
        )}

        {/* Subject Input */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-semibold text-white mb-2"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="What is this about?"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-lg border bg-[#0b1120] text-white outline-none transition ${
              errors.subject
                ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(255,59,48,0.1)]"
                : "border-[#294157] focus:border-[#f5c518] focus:shadow-[0_0_0_2px_rgba(245,197,24,0.1)]"
            } placeholder:text-[#5a6b7d]`}
            disabled={isSubmitting}
          />
          {errors.subject && (
            <p className="mt-1 text-xs text-red-400">{errors.subject}</p>
          )}
          <p className="mt-1 text-xs text-[#5a6b7d]">
            {formData.subject.length}/100 characters
          </p>
        </div>

        {/* Message Textarea */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-semibold text-white mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us what's on your mind..."
            maxLength={2000}
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border bg-[#0b1120] text-white outline-none transition resize-none ${
              errors.message
                ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(255,59,48,0.1)]"
                : "border-[#294157] focus:border-[#f5c518] focus:shadow-[0_0_0_2px_rgba(245,197,24,0.1)]"
            } placeholder:text-[#5a6b7d]`}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-400">{errors.message}</p>
          )}
          <p className="mt-1 text-xs text-[#5a6b7d]">
            {formData.message.length}/2000 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#f5c518] px-6 py-3 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
