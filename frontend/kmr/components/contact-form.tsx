"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "submitting" | "success";

// Placeholder contact form, there's no backend for messages yet, so submit
// simulates a short delay and shows a success state. Wire this to a real
// endpoint (or a mail/WhatsApp provider) when one exists.
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;
    setStatus("submitting");
    window.setTimeout(() => setStatus("success"), 900);
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-5 rounded-sm border border-border bg-white p-10 text-center md:p-14">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Check className="size-7" />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl text-ink">Message Sent</h2>
          <p className="max-w-sm text-ink-muted">
            Thanks{name ? `, ${name.split(" ")[0]}` : ""}. We&apos;ve received
            your message and will get back to you shortly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
            setStatus("idle");
          }}
          className="text-sm font-semibold tracking-[0.05em] text-gold uppercase underline underline-offset-4 transition-colors hover:text-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClasses =
    "h-11 rounded-sm border-border bg-background px-4 text-sm text-ink placeholder:text-ink-muted/50 focus-visible:border-gold focus-visible:ring-gold/30";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-sm border border-border bg-white p-6 md:p-8"
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl text-ink">Send a Message</h2>
        <p className="text-sm text-ink-muted">
          Tell us what you&apos;re looking for and we&apos;ll take it from there.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="contact-name"
            className="text-xs font-semibold tracking-[0.15em] text-ink uppercase"
          >
            Full Name
          </Label>
          <Input
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="contact-email"
            className="text-xs font-semibold tracking-[0.15em] text-ink uppercase"
          >
            Email
          </Label>
          <Input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="contact-phone"
          className="text-xs font-semibold tracking-[0.15em] text-ink uppercase"
        >
          Phone <span className="normal-case text-ink-muted">(optional)</span>
        </Label>
        <Input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+233 XX XXX XXXX"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="contact-message"
          className="text-xs font-semibold tracking-[0.15em] text-ink uppercase"
        >
          Message
        </Label>
        <Textarea
          id="contact-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          rows={5}
          className="rounded-sm border-border bg-background px-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus-visible:border-gold focus-visible:ring-gold/30"
        />
      </div>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 rounded-sm bg-black px-10 py-5 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
