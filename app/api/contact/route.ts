import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";
import { adminContactTemplate } from "@/app/emails/adminContactTemplate";
import { userConfirmationTemplate } from "@/app/emails/userConfirmationTemplate";
import { sendBrevoEmail } from "@/app/lib/brevo-email";
import { resolveContactFormProps } from "@/app/lib/contact-form-config";
import { fetchDefaultContactPage, getContactPageFields } from "@/app/lib/contact-api";
import {
  checkContactEmailRateLimit,
  checkContactRateLimit,
  ContactRequestError,
  getClientIp,
  isAllowedContactRequest,
  isHoneypotTriggered,
  isRequestBodyTooLarge,
  isValidEmail,
  logContactApiError,
  readBoundedJsonBody,
  resolveSafeRecipientEmail,
  sanitizePlainTextField,
  sanitizeReplyToEmail,
  trimToMaxLength,
  validateContactFieldLengths,
  CONTACT_FIELD_LIMITS,
} from "@/app/lib/contact-security";

export const runtime = "nodejs";

// --- SMTP (legacy — kept for reference; re-enable if switching back from Brevo) ---
// function createMailTransporter() {
//   const user = process.env.SMTP_USER?.trim();
//   const pass = process.env.SMTP_PASSWORD?.trim();
//
//   if (!user || !pass) {
//     throw new Error("SMTP credentials are not configured");
//   }
//
//   const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
//   const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
//   const secure = process.env.SMTP_SECURE === "true";
//
//   return nodemailer.createTransport({
//     host,
//     port,
//     secure,
//     auth: { user, pass },
//   });
// }

function honeypotSuccessResponse() {
  return NextResponse.json(
    {
      success: true,
      message: "Email sent successfully",
      confirmationEmailSent: false,
    },
    { status: 200 }
  );
}

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(req: Request) {
  try {
    if (!isAllowedContactRequest(req)) {
      return jsonError("Forbidden", 403);
    }

    if (isRequestBodyTooLarge(req)) {
      return jsonError("Request body is too large", 413);
    }

    const clientIp = getClientIp(req);
    const rateLimit = checkContactRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return jsonError("Too many requests. Please try again later.", 429, {
        "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
      });
    }

    const payload = (await readBoundedJsonBody(req)) as Record<string, unknown> | null;
    const {
      fullName: rawFullName,
      email: rawEmail,
      phone: rawPhone = "",
      company: rawCompany,
      message: rawMessage,
      website: honeypotWebsite,
    } = payload ?? {};

    if (isHoneypotTriggered(honeypotWebsite)) {
      return honeypotSuccessResponse();
    }

    const fullName =
      typeof rawFullName === "string"
        ? trimToMaxLength(rawFullName, CONTACT_FIELD_LIMITS.fullName)
        : rawFullName;
    const email =
      typeof rawEmail === "string"
        ? trimToMaxLength(rawEmail, CONTACT_FIELD_LIMITS.email)
        : rawEmail;
    const phone =
      typeof rawPhone === "string"
        ? trimToMaxLength(rawPhone, CONTACT_FIELD_LIMITS.phone)
        : rawPhone;
    const company =
      typeof rawCompany === "string"
        ? trimToMaxLength(rawCompany, CONTACT_FIELD_LIMITS.company)
        : rawCompany;
    const message =
      typeof rawMessage === "string"
        ? trimToMaxLength(rawMessage, CONTACT_FIELD_LIMITS.message)
        : rawMessage;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof company !== "string" ||
      typeof message !== "string" ||
      typeof phone !== "string"
    ) {
      return jsonError("Invalid or missing fields", 400);
    }

    const lengthError = validateContactFieldLengths({ fullName, email, phone, company, message });
    if (lengthError) {
      return jsonError(lengthError, 400);
    }

    let cmsRecipientEmail: string | undefined;
    let configuredFields = resolveContactFormProps(undefined).fields;
    try {
      const contactPageRes = await fetchDefaultContactPage();
      const contactFields = getContactPageFields(contactPageRes.data);
      cmsRecipientEmail = contactFields?.contactFormSettings?.recipientEmail?.trim() || undefined;
      configuredFields = resolveContactFormProps(
        (contactFields?.contactFormSettings ?? undefined) as Record<string, unknown> | undefined
      ).fields;
    } catch {
      cmsRecipientEmail = undefined;
    }

    const visibleFieldNames = new Set(configuredFields.map((field) => field.name));
    const requiredFieldNames = new Set(
      configuredFields.filter((field) => field.required).map((field) => field.name)
    );

    if (requiredFieldNames.has("fullName") && !fullName.trim()) {
      return jsonError("Name is required", 400);
    }

    if (requiredFieldNames.has("email") && !email.trim()) {
      return jsonError("Email is required", 400);
    }

    if (visibleFieldNames.has("email") && email.trim() && !isValidEmail(email.trim())) {
      return jsonError("Please enter a valid email", 400);
    }

    if (requiredFieldNames.has("phone") && !phone.trim()) {
      return jsonError("Phone is required", 400);
    }

    if (requiredFieldNames.has("company") && !company.trim()) {
      return jsonError("Company is required", 400);
    }

    if (requiredFieldNames.has("message") && !message.trim()) {
      return jsonError("Message is required", 400);
    }

    const resolvedRecipientEmail = resolveSafeRecipientEmail(
      cmsRecipientEmail,
      process.env.TO_EMAIL
    );

    if (!resolvedRecipientEmail) {
      return jsonError("Recipient email is not configured", 500);
    }

    if (email.trim() && isValidEmail(email.trim())) {
      const emailRateLimit = checkContactEmailRateLimit(email.trim());
      if (!emailRateLimit.allowed) {
        return jsonError("Too many requests. Please try again later.", 429, {
          "Retry-After": String(emailRateLimit.retryAfterSeconds ?? 60),
        });
      }
    }

    const safeFullName = sanitizePlainTextField(fullName);
    const safeEmail = sanitizePlainTextField(email);
    const safePhone = sanitizePlainTextField(phone);
    const safeCompany = sanitizePlainTextField(company);
    const safeMessage = sanitizePlainTextField(message);

    const html = adminContactTemplate({
      fullName: safeFullName,
      email: safeEmail,
      phone: safePhone,
      company: safeCompany,
      message: safeMessage,
    });

    const replyTo = sanitizeReplyToEmail(safeEmail);

    const adminText = [
      `Name: ${safeFullName}`,
      `Email: ${safeEmail}`,
      `Phone: ${safePhone || "Not provided"}`,
      `Company: ${safeCompany}`,
      "Message:",
      safeMessage,
    ].join("\n");

    await sendBrevoEmail({
      to: resolvedRecipientEmail,
      replyTo,
      subject: "New Contact Form Submission – Cwit",
      text: adminText,
      html,
    });

    // --- SMTP (legacy) ---
    // const transporter = createMailTransporter();
    // if (process.env.NODE_ENV !== "production") {
    //   await transporter.verify();
    // }
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    //   to: resolvedRecipientEmail,
    //   replyTo,
    //   subject: "New Contact Form Submission – Cwit For Future",
    //   text: adminText,
    //   html,
    // });

    let confirmationEmailSent = false;
    if (safeEmail && isValidEmail(safeEmail)) {
      const userHtml = userConfirmationTemplate({ fullName: safeFullName });
      const userText = `Dear ${safeFullName},\n\nThank you for reaching out to us. We have received your message and our team will get back to you as soon as possible.\n\nWe typically respond within 24 business hours. If your matter is urgent, please feel free to contact us directly.\n\nBest regards,\nCWIT - Clear Wave Information Technology`;

      try {
        await sendBrevoEmail({
          to: safeEmail,
          subject: "Thank You for Contacting CWIT - Clear Wave Information Technology",
          text: userText,
          html: userHtml,
        });
        confirmationEmailSent = true;
      } catch (confirmationError) {
        logContactApiError(confirmationError);
      }

      // --- SMTP (legacy) ---
      // try {
      //   await transporter.sendMail({
      //     from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      //     to: email,
      //     subject: "Thank You for Contacting CWIT For Future",
      //     text: userText,
      //     html: userHtml,
      //   });
      //   confirmationEmailSent = true;
      // } catch (confirmationError) {
      //   console.error("Error sending user confirmation email:", confirmationError);
      // }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        confirmationEmailSent,
      },
      { status: 200 }
    );
  } catch (error) {
    logContactApiError(error);

    if (error instanceof ContactRequestError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Failed to send email", 500);
  }
}
