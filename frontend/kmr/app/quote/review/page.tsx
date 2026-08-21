"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuoteCart } from "@/lib/store/quote-cart";
import { submitQuoteRequest } from "@/lib/api/client";
import { formatPrice } from "@/lib/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function buildWhatsAppMessage(
  name: string,
  company: string,
  location: string,
  items: { name: string; quantity: number; priceDescription: string | null }[]
) {
  const lines = [
    `Hi KMR, I'd like to request a quote.`,
    ``,
    `Name: ${name}`,
    ...(company ? [`Company: ${company}`] : []),
    ...(location ? [`Location: ${location}`] : []),
    ``,
    `Items:`,
    ...items.map((item) => {
      const price = formatPrice(item.priceDescription);
      return `- ${item.name} (Qty: ${item.quantity})${price ? `: ${price}` : ""}`;
    }),
  ];
  return lines.join("\n");
}

export default function QuoteReviewPage() {
  const router = useRouter();
  const items = useQuoteCart((state) => state.items);
  const clear = useQuoteCart((state) => state.clear);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6 px-6 py-24 text-center md:px-20">
        <p className="text-ink-muted">Your quote cart is empty.</p>
        <Link href="/catalog" className="text-sm font-semibold text-gold uppercase">
          Browse the Catalog
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitQuoteRequest({
        customerName: name,
        customerCompany: company || undefined,
        customerPhone: phone || undefined,
        customerLocation: location || undefined,
        items: items.map((item) => ({
          productName: item.name,
          quantity: item.quantity,
        })),
      });
    } catch {
      // best-effort audit trail, the WhatsApp message is the real order channel
    }

    const message = buildWhatsAppMessage(name, company, location, items);
    const url = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      : null;

    clear();

    if (url) {
      window.location.href = url;
    } else {
      router.push("/");
    }
  }

  return (
    <div className="flex flex-col gap-10 px-6 py-16 md:px-20 md:py-24">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Quote Review
        </span>
        <h1 className="font-display text-4xl text-ink md:text-5xl">
          Confirm Your Details
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:max-w-md">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Delivery Location (optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-sm bg-black px-10 py-6 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
          >
            {submitting ? "Sending…" : "Send via WhatsApp"}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-ink">Itemized Summary</h2>
          <Separator />
          {items.map((item) => (
            <div key={item.itemKey} className="flex items-center justify-between gap-6 text-sm">
              <div className="flex min-w-0 flex-col">
                <span className="text-ink">{item.name}</span>
                <span className="text-xs text-ink-muted">Qty: {item.quantity}</span>
              </div>
              {formatPrice(item.priceDescription) && (
                <span className="text-ink-muted">{formatPrice(item.priceDescription)}</span>
              )}
            </div>
          ))}
          <Separator />
          <p className="text-sm text-ink-muted">
            {items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
          </p>
        </div>
      </div>
    </div>
  );
}
