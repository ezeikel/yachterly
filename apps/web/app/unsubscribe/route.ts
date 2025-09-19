import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.redirect("/?unsub=0", 302);

  const email = await redis.get<string>(`waitlist:token:${token}`);
  if (!email) return NextResponse.redirect("/?unsub=0", 302);

  await redis.set(`waitlist:unsub:${email}`, true);
  await redis.srem("waitlist:emails", email);
  await redis.srem("waitlist:confirmed", email);

  return NextResponse.redirect("/?unsub=1", 302);
}