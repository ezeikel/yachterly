import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.redirect("/?confirmed=0", 302);

  const key = `waitlist:token:${token}`;
  const email = await redis.get<string>(key);
  if (!email) return NextResponse.redirect("/?confirmed=0", 302);

  await redis.del(key);
  await redis.sadd("waitlist:confirmed", email);
  await redis.hset(`waitlist:meta:${email}`, { tsConfirmed: Date.now() });

  return NextResponse.redirect("/?confirmed=1", 302);
}