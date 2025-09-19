import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.redirect("/?confirmed=0", 302);

  const key = `waitlist:token:${token}`;
  const email = await kv.get<string>(key);
  if (!email) return NextResponse.redirect("/?confirmed=0", 302);

  await kv.del(key);
  await kv.sadd("waitlist:confirmed", email);
  await kv.hset(`waitlist:meta:${email}`, { tsConfirmed: Date.now() });

  return NextResponse.redirect("/?confirmed=1", 302);
}