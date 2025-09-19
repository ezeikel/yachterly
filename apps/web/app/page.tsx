"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { track } from '@vercel/analytics';
import styles from "./page.module.css";

type State = "idle" | "loading" | "ok" | "error";

export default function Home() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  // Track page view on mount
  useEffect(() => {
    track('waitlist_page_view', {
      source: 'hero'
    });
  }, []);

  function handleEmailFocus() {
    track('waitlist_email_focus', {
      source: 'hero'
    });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    
    // Track form submission attempt
    track('waitlist_form_submit', {
      source: 'hero',
      email_domain: email.split('@')[1] || 'unknown'
    });
    
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "hero" }),
      });
      
      if (res.ok) {
        setState("ok");
        // Track successful signup
        track('waitlist_signup_success', {
          source: 'hero',
          email_domain: email.split('@')[1] || 'unknown'
        });
      } else {
        setState("error");
        // Track API error
        track('waitlist_signup_error', {
          source: 'hero',
          error_type: 'api_error',
          status: res.status
        });
      }
    } catch (error) {
      setState("error");
      // Track network/client error
      track('waitlist_signup_error', {
        source: 'hero',
        error_type: 'network_error'
      });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Yachterly.</h1>
        <Image src="/images/card.png" alt="Yacht card" width={927} height={568} className={styles.card} />
        <p className={styles.description}>
          Yachterly is the modern fintech platform for yacht crew: virtual cards,
          real-time expenses, payroll & defect management. Secure, global, digital.
        </p>

        <p className={styles.description}>
          Join the waitlist to get early access to the platform.
        </p>

        <form onSubmit={submit} className={styles.form} noValidate>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            onFocus={handleEmailFocus}
            className={styles.input}
            aria-label="Email address"
          />
          <button type="submit" className={styles.cta} disabled={state === "loading"}>
            {state === "loading" ? "Sending..." : "Get Early Access"}
          </button>
        </form>
        
        {state === "ok" && <p className={styles.note}>Check your inbox to confirm your email.</p>}
        {state === "error" && <p className={styles.error}>Something went wrong. Please try again.</p>}
      </div>
    </div>
  );
}

