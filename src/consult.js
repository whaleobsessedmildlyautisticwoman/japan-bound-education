// Handles the consultation form's POST — sends a branded HTML notification
// via Resend, instead of relying on a form service's own plain layout.
//
// Requires one environment variable, set as a secret in the Worker's
// settings (Settings -> Variables and Secrets), never committed here:
//   RESEND_API_KEY   — from https://resend.com, after verifying the sending
//                       domain (japanboundeducation.com) there.

const NOTIFY_TO = "info@japanboundeducation.com";
const FROM_ADDRESS = "Japan Bound Education <notifications@japanboundeducation.com>";

const REQUIRED_FIELDS = ["name", "email", "phone", "country"];

const COUNTRY_LABELS = {
  Pakistan: "Pakistan",
  India: "India",
  Bangladesh: "Bangladesh",
  Nepal: "Nepal",
  "Sri Lanka": "Sri Lanka",
  Other: "Other",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRow(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #E7E1DA;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#8a8378;vertical-align:top;width:150px;">
        ${label}
      </td>
      <td style="padding:14px 0;border-top:1px solid #E7E1DA;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:#15120F;vertical-align:top;">
        ${value}
      </td>
    </tr>`;
}

function buildEmailHtml(fields) {
  const name = escapeHtml(fields.name);
  const email = escapeHtml(fields.email);
  const phone = escapeHtml(fields.phone);
  const country = escapeHtml(COUNTRY_LABELS[fields.country] || fields.country);
  const intake = fields.intake ? escapeHtml(fields.intake) : "";
  const message = fields.message ? escapeHtml(fields.message).replace(/\n/g, "<br>") : "";

  const rows = [
    renderRow("Name", name),
    renderRow("Email", `<a href="mailto:${email}" style="color:#BC002D;text-decoration:none;">${email}</a>`),
    renderRow("Phone / WhatsApp", phone),
    renderRow("Country", country),
    renderRow("Preferred intake", intake),
    renderRow("Message", message),
  ].join("");

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F6F1E9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1E9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf8f7;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#BC002D;padding:28px 32px;">
              <span style="font-family:Georgia,'Iowan Old Style',serif;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-.01em;">
                Japan Bound Education
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#BC002D;">
                New consultation request
              </p>
              <h1 style="margin:8px 0 0;font-family:Georgia,'Iowan Old Style',serif;font-size:24px;font-weight:500;color:#15120F;">
                ${name}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #E7E1DA;">
              <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;color:#8a8378;">
                Sent from the consultation form at japanboundeducation.com. Reply to this email to respond directly to ${name}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function handleConsult(request, env) {
  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid form data." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Honeypot: a field real visitors never see or fill; bots that blindly
  // fill every input trip it. Silently report success so they move on.
  if (formData.get("website")) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fields = {
    name: (formData.get("name") || "").toString().trim(),
    email: (formData.get("email") || "").toString().trim(),
    phone: (formData.get("phone") || "").toString().trim(),
    country: (formData.get("country") || "").toString().trim(),
    intake: (formData.get("intake") || "").toString().trim(),
    message: (formData.get("message") || "").toString().trim(),
  };

  const missing = REQUIRED_FIELDS.filter((key) => !fields[key]);
  if (missing.length) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required fields." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: false, error: "Email service not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [NOTIFY_TO],
      reply_to: fields.email,
      subject: "New consultation request: Japan Bound Education",
      html: buildEmailHtml(fields),
    }),
  });

  if (!resendResponse.ok) {
    return new Response(JSON.stringify({ ok: false, error: "Failed to send notification." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
