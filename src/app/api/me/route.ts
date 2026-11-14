import { NextResponse } from "next/server";
import { currentUser, destroySession } from "@/lib/server/auth";
import { deleteUser, getUserData, saveUserData } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Current account + saved data (plan, progress, mock history). */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user, data: getUserData(user.id) });
}

/** Save part of the account data. Body: { plan?, progress?, mockHistory? } */
export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  const raw = await req.text();
  if (raw.length > 300_000) return NextResponse.json({ ok: false, reason: "too_large" }, { status: 413 });
  let body: { plan?: unknown; progress?: unknown; mockHistory?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const patch: Parameters<typeof saveUserData>[1] = {};
  if (body.plan !== undefined && (body.plan === null || typeof body.plan === "object")) patch.plan = body.plan;
  if (body.progress && typeof body.progress === "object" && !Array.isArray(body.progress)) patch.progress = body.progress as Record<string, boolean>;
  if (Array.isArray(body.mockHistory)) patch.mockHistory = body.mockHistory.slice(-100);
  return NextResponse.json({ ok: true, data: saveUserData(user.id, patch) });
}

/** Delete the account and all its data. */
export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  deleteUser(user.id);
  await destroySession();
  return NextResponse.json({ ok: true });
}
