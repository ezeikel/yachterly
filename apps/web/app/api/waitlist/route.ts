import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { z } from "zod";
import crypto from "node:crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const EmailSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, source } = EmailSchema.parse(json);
    const e = normaliseEmail(email);

    // block if unsubscribed
    const unsub = await redis.get<boolean>(`waitlist:unsub:${e}`);
    if (unsub) {
      return NextResponse.json(
        { ok: false, error: "This email has unsubscribed." },
        { status: 400 },
      );
    }

    // add to set + meta
    await redis.sadd("waitlist:emails", e);
    const now = Date.now();
    await redis.hset(`waitlist:meta:${e}`, {
      tsJoined: now,
      source: source ?? "unknown",
    });
    await redis.zadd("waitlist:z:joined", { score: now, member: e });

    // generate confirm token (7d expiry)
    const token = crypto.randomBytes(24).toString("base64url");
    await redis.set(`waitlist:token:${token}`, e, { ex: 60 * 60 * 24 * 7 });

    const confirmUrl = `${baseUrl}/confirm?token=${token}`;

    // send confirm email
    await resend.emails.send({
      from: "Yachterly <hello@mail.yachterly.com>",
      to: e,
      subject: "Confirm your Yachterly early access",
      html: `
        <div style="font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6">
          <h2>Welcome aboard 🛥️</h2>
          <p>Tap the button below to confirm your email and join the Yachterly early access list.</p>
          <p><a href="${confirmUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#111;color:#fff;text-decoration:none">Confirm my email</a></p>
          <p>Or copy & paste: ${confirmUrl}</p>
          <hr/>
          <p style="color:#666;font-size:12px">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Unable to add to waitlist." },
      { status: 400 },
    );
  }
}