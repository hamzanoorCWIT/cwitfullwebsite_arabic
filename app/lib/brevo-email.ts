import {
  isValidEmail,
  normalizeRecipientEmail,
  sanitizeEmailDisplayName,
} from "@/app/lib/contact-security";

type SendBrevoEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

function assertSafeEmailAddress(email: string, fieldName: string): string {
  const normalized = normalizeRecipientEmail(email);
  if (!normalized) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return normalized;
}

function assertSafeSubject(subject: string): string {
  const cleaned = subject.replace(/[\r\n]/g, " ").trim();
  if (!cleaned) {
    throw new Error("Email subject is required");
  }
  return cleaned.slice(0, 200);
}

export async function sendBrevoEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendBrevoEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Brevo API key is not configured");
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL?.trim();
  if (!fromEmail || !isValidEmail(fromEmail)) {
    throw new Error("Brevo sender email is not configured");
  }

  const fromName = sanitizeEmailDisplayName(
    process.env.BREVO_FROM_NAME?.trim() || "CWIT For Future"
  );
  const safeTo = assertSafeEmailAddress(to, "recipient");
  const safeSubject = assertSafeSubject(subject);
  const safeReplyTo = replyTo ? assertSafeEmailAddress(replyTo, "reply-to") : undefined;

  const payload: Record<string, unknown> = {
    sender: { name: fromName, email: fromEmail },
    to: [{ email: safeTo }],
    subject: safeSubject,
    htmlContent: html,
  };

  if (text) payload.textContent = text.replace(/[\r\n]*\r\n/g, "\n").slice(0, 20_000);
  if (safeReplyTo) payload.replyTo = { email: safeReplyTo };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Brevo API request failed (${res.status})`);
  }
}
