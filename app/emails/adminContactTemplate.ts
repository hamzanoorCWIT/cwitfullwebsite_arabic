import { escapeHtml } from "@/app/lib/escape-html";

type AdminContactParams = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
};

export function adminContactTemplate({
  fullName,
  email,
  phone,
  company,
  message,
}: AdminContactParams): string {
  return `
    <!DOCTYPE html>
      <html>
        <body style="margin:0; padding:0; background:#f4f6f6; font-family: Arial, Helvetica, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:0;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background:#2dfdc3; padding:24px 32px;">
                      <h1 style="margin:0; font-size:20px; font-weight:400; color:#082f24;">
                        New Contact Form Submission
                      </h1>
                      <p style="margin:6px 0 0; font-size:14px; color:#082f24;">
                        CWIT For Future
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="font-size:15px; line-height:1.6;">
                      You have received a new message from your website contact form.
                      </p>
                      <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:24px;">
                        <tr><td style="font-weight:bold;">Full Name</td><td>${escapeHtml(fullName)}</td></tr>
                        <tr><td style="font-weight:bold;">Email</td><td>${escapeHtml(email)}</td></tr>
                        <tr><td style="font-weight:bold;">Phone</td><td>${escapeHtml(phone || "Not provided")}</td></tr>
                        <tr><td style="font-weight:bold;">Company</td><td>${escapeHtml(company || "Not provided")}</td></tr>
                      </table>
                      <div style="background:#f7f9f9; border-left:4px solid #2e3620ff; padding:16px;">
                        <p style="font-weight:bold;">Message</p>
                        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f0f0f0; padding:16px; text-align:center; font-size:12px; color:#777;">
                      This message was sent from the Cwit For Future website contact form.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
}
