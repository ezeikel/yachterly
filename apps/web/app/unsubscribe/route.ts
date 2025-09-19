import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.redirect("/?unsub=0", 302);

  const email = await kv.get<string>(`waitlist:token:${token}`);
  if (!email) return NextResponse.redirect("/?unsub=0", 302);

  await kv.set(`waitlist:unsub:${email}`, true);
  await kv.srem("waitlist:emails", email);
  await kv.srem("waitlist:confirmed", email);

  return NextResponse.redirect("/?unsub=1", 302);
}