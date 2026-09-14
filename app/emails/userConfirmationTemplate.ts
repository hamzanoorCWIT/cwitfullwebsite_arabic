import { escapeHtml } from "@/app/lib/escape-html";

type UserConfirmationParams = {
  fullName: string;
};

export function userConfirmationTemplate({
  fullName,
}: UserConfirmationParams): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://cwit.ae";
  const logoUrl = `${siteUrl}/imgs/cwit_logo_1.png`;

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
                      <img src="${logoUrl}" alt="CWIT logo" style="display:block; height:40px; width:auto; margin:0 0 18px;" />
                      <h1 style="margin:0; font-size:20px; font-weight:400; color:#082f24;">
                        Thank You for Contacting Us!
                      </h1>
                      <p style="margin:6px 0 0; font-size:14px; color:#082f24;">
                        CWIT - Clear Wave Information Technology
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="font-size:15px; line-height:1.6;">
                        Dear <strong>${escapeHtml(fullName)}</strong>,
                      </p>
                      <p style="font-size:15px; line-height:1.6;">
                        Thank you for reaching out to us. We have received your message and our team will get back to you as soon as possible.
                      </p>
                      <p style="font-size:15px; line-height:1.6;">
                        We typically respond within 24 hours. If your matter is urgent, please feel free to contact us directly.
                      </p>
                      <p style="font-size:15px; line-height:1.6; margin-top:24px;">
                        Best regards,<br />
                        <strong>CWIT - Clear Wave Information Technology</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f0f0f0; padding:16px; text-align:center; font-size:12px; color:#777;">
                      This is an automated confirmation email from CWIT - Clear Wave Information Technology.
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
