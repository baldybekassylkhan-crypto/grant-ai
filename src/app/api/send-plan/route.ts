/**
 * Sends the quiz plan by email through Resend (https://resend.com).
 * Configure in .env.local:
 *   RESEND_API_KEY=re_xxx
 *   PLAN_FROM_EMAIL="grant.ai <plan@your-verified-domain.kz>"
 * Without RESEND_API_KEY the route answers { ok: false, reason: "not_configured" }.
 */
import { NextResponse } from "next/server";
import https from "node:https";

/** POST JSON with a generous timeout (some networks take >10 s to connect, which trips fetch's default). */
function postJson(url: string, headers: Record<string, string>, body: unknown, timeoutMs = 45_000): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, { method: "POST", family: 4, headers: { ...headers, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } }, (res) => {
      let text = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (text += c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, text }));
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

export const runtime = "nodejs";

type Body = { email?: string; locale?: string; parent?: boolean; rows?: [string, string][]; steps?: string[]; planUrl?: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Tiny in-memory rate limit: 5 sends per IP per 10 minutes.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim();
  if (!EMAIL_RE.test(email) || email.length > 200) return NextResponse.json({ ok: false, reason: "invalid_email" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.PLAN_FROM_EMAIL || "grant.ai <onboarding@resend.dev>";
  if (!key) return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 200 });

  const kk = body.locale !== "ru";
  const rows = (body.rows ?? []).slice(0, 12).map(([k, v]) => [String(k).slice(0, 80), String(v).slice(0, 200)]);
  const steps = (body.steps ?? []).slice(0, 6).map((s) => String(s).slice(0, 200));
  const planUrl = typeof body.planUrl === "string" && /^https?:\/\//.test(body.planUrl) ? body.planUrl : "";
  const title = kk ? (body.parent ? "Балаңыздың ҰБТ жоспары" : "Сіздің ҰБТ жоспарыңыз") : body.parent ? "План подготовки к ЕНТ для вашего ребёнка" : "Ваш план подготовки к ЕНТ";

  const html = `<!doctype html><html><body style="margin:0;background:#F8FAFE;font-family:Arial,sans-serif;color:#030A19">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="font-size:22px;font-weight:800">grant.ai</div>
    <h1 style="font-size:22px;margin:16px 0 8px">${esc(title)}</h1>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px">
      ${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;border-bottom:1px solid #E1E5EC;color:#5B6576;font-size:14px">${esc(k)}</td><td style="padding:10px 14px;border-bottom:1px solid #E1E5EC;font-weight:700;font-size:14px;text-align:right">${esc(v)}</td></tr>`).join("")}
    </table>
    <h2 style="font-size:16px;margin:20px 0 8px;color:#C82E1E">${kk ? "Алғашқы қадамдар" : "Первые шаги"}</h2>
    <ol style="padding-left:20px;font-size:14px;line-height:1.6">${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    ${planUrl ? `<p><a href="${esc(planUrl)}" style="display:inline-block;background:#FF4B3C;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:800">${kk ? "Жоспарды ашу" : "Открыть план"}</a></p>` : ""}
    <p style="font-size:12px;color:#5B6576;margin-top:24px">${kk ? "grant.ai Ұлттық тестілеу орталығымен байланысты емес. Ресми ақпарат: testcenter.kz" : "grant.ai не связан с Национальным центром тестирования. Официальная информация: testcenter.kz"}</p>
  </div></body></html>`;

  try {
    const r = await postJson("https://api.resend.com/emails", { Authorization: `Bearer ${key}` }, { from, to: [email], subject: title, html });
    if (r.status < 200 || r.status >= 300) {
      console.error("send-plan: provider error", r.status, r.text);
      return NextResponse.json({ ok: false, reason: "provider_error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("send-plan: network error", e);
    return NextResponse.json({ ok: false, reason: "network_error" }, { status: 502 });
  }
}
