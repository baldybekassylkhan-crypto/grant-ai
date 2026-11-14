import { NextResponse } from "next/server";
import { EMAIL_RE, createSession, hashPassword, rateLimited } from "@/lib/server/auth";
import { createUser, findUserByEmail, getUserData } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`reg:${ip}`, 10)) return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  let body: { email?: string; password?: string; name?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim().slice(0, 80);
  const role = body.role === "parent" ? "parent" : "student";
  if (!EMAIL_RE.test(email) || email.length > 200) return NextResponse.json({ ok: false, reason: "invalid_email" }, { status: 400 });
  if (password.length < 8 || password.length > 200) return NextResponse.json({ ok: false, reason: "weak_password" }, { status: 400 });
  if (findUserByEmail(email)) return NextResponse.json({ ok: false, reason: "email_taken" }, { status: 409 });
  const id = createUser(email, name, role, hashPassword(password));
  await createSession(id);
  return NextResponse.json({ ok: true, user: { id, email, name, role }, data: getUserData(id) });
}
