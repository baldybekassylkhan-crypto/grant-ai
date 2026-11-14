import { NextResponse } from "next/server";
import { EMAIL_RE, createSession, rateLimited, verifyPassword } from "@/lib/server/auth";
import { findUserByEmail, getUserData } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`login:${ip}:${email}`, 8)) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, reason: "invalid_credentials" }, { status: 401 });
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.pass_hash)) return NextResponse.json({ ok: false, reason: "invalid_credentials" }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, data: getUserData(user.id) });
}
