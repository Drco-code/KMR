"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { useQuoteCart, type QuoteCartItem } from "@/lib/store/quote-cart";
import { submitQuoteRequest } from "@/lib/api/client";
import { generateQuoteReceiptPDF } from "@/lib/receipt-generator";
import {
  formatPrice,
  formatAmount,
  getItemSubtotal,
  calculateCartEstimatedTotal,
} from "@/lib/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function getItemDisplayName(item: QuoteCartItem) {
  if (item.variantColorName && item.name.includes(" — ")) {
    return item.name.split(" — ")[0];
  }
  return item.name;
}

function formatItemLine(item: QuoteCartItem) {
  const baseName = getItemDisplayName(item);
  const details = [
    item.variantColorName ? `Color: ${item.variantColorName}` : "",
    item.variantSize ? `Size: ${item.variantSize}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return details ? `${baseName} (${details})` : baseName;
}

function buildWhatsAppMessage(
  name: string,
  company: string,
  location: string,
  items: QuoteCartItem[]
) {
  const { hasPricedItems, unpricedCount, formattedTotal } = calculateCartEstimatedTotal(items);

  const lines = [
    `Hi KMR, I'd like to request a quote.`,
    ``,
    `Name: ${name}`,
    ...(company ? [`Company: ${company}`] : []),
    ...(location ? [`Location: ${location}`] : []),
    ``,
    `Items:`,
    ...items.map((item) => {
      const lineName = formatItemLine(item);
      const subtotal = getItemSubtotal(item.priceDescription, item.quantity);
      if (subtotal !== null) {
        const unit = formatPrice(item.priceDescription);
        return `- ${lineName} (Qty: ${item.quantity}) — ${formatAmount(subtotal)}${item.quantity > 1 ? ` (${unit} each)` : ""}`;
      }
      const rawPrice = formatPrice(item.priceDescription);
      return `- ${lineName} (Qty: ${item.quantity})${rawPrice ? `: ${rawPrice}` : ""}`;
    }),
    ``,
    ...(hasPricedItems
      ? [`Estimated Total: ${formattedTotal}${unpricedCount > 0 ? ` (+ ${unpricedCount} custom/quote item(s))` : ""}`]
      : [`Estimated Total: Pricing on Request`]),
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

  const { hasPricedItems, unpricedCount, formattedTotal } = calculateCartEstimatedTotal(items);

  function handleDownloadReceipt() {
    if (!name.trim()) {
      alert("Please enter your name first.");
      return;
    }
    generateQuoteReceiptPDF(
      {
        name,
        company: company || undefined,
        phone: phone || undefined,
        location: location || undefined,
      },
      items
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // 1. Generate & download receipt PDF automatically
    try {
      generateQuoteReceiptPDF(
        {
          name,
          company: company || undefined,
          phone: phone || undefined,
          location: location || undefined,
        },
        items
      );
    } catch {
      // If PDF download fails in background, continue with WhatsApp submission
    }

    // 2. Submit quote request audit trail to backend
    try {
      await submitQuoteRequest({
        customerName: name,
        customerCompany: company || undefined,
        customerPhone: phone || undefined,
        customerLocation: location || undefined,
        items: items.map((item) => ({
          productName: formatItemLine(item),
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

    // Small timeout ensures browser starts the PDF download before navigating
    setTimeout(() => {
      clear();
      if (url) {
        window.location.href = url;
      } else {
        router.push("/");
      }
    }, 450);
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

          <div className="mt-2 flex flex-col gap-3">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-black px-10 py-6 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
            >
              {submitting ? "Preparing & Sending…" : "Send via WhatsApp & Download Receipt"}
            </Button>

            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center gap-2 rounded-sm border border-border bg-white py-3 text-xs font-semibold tracking-[0.08em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
            >
              <Download className="size-4" />
              Download Receipt PDF
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-ink">Itemized Summary</h2>
          <Separator />
          {items.map((item) => {
            const displayName = getItemDisplayName(item);
            const subtotal = getItemSubtotal(item.priceDescription, item.quantity);

            return (
              <div key={item.itemKey} className="flex items-start justify-between gap-6 text-sm">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-medium text-ink">{displayName}</span>
                  {(item.variantColorName || item.variantSize) && (
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-ink-muted">
                      {item.variantColorName && (
                        <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-0.5 rounded text-ink">
                          <span className="text-ink-muted">Color:</span>
                          {item.variantColorCode && (
                            <span
                              className="size-2.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: item.variantColorCode }}
                              aria-hidden
                            />
                          )}
                          <span className="font-medium">{item.variantColorName}</span>
                        </div>
                      )}

                      {item.variantSize && (
                        <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-ink">
                          <span className="text-ink-muted">Size:</span>
                          <span className="font-medium">{item.variantSize}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-ink-muted">Qty: {item.quantity}</span>
                </div>

                <div className="text-right shrink-0">
                  {subtotal !== null ? (
                    <div>
                      <span className="font-medium text-ink block">{formatAmount(subtotal)}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-ink-muted block">
                          ({formatPrice(item.priceDescription)} ea)
                        </span>
                      )}
                    </div>
                  ) : formatPrice(item.priceDescription) ? (
                    <span className="text-ink-muted">{formatPrice(item.priceDescription)}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
          <Separator />

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">
                {items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
              </span>
              {hasPricedItems ? (
                <div className="text-right">
                  <span className="text-xs text-ink-muted block">Estimated Total</span>
                  <span className="text-xl font-bold text-ink">{formattedTotal}</span>
                  {unpricedCount > 0 && (
                    <span className="text-xs text-gold block">+ {unpricedCount} custom/quote item(s)</span>
                  )}
                </div>
              ) : (
                <span className="font-medium text-ink">Pricing on Request</span>
              )}
            </div>

            <p className="text-[11px] text-ink-muted/80">
              * Final order confirmation, delivery, and applicable bulk rates will be confirmed directly with your sales representative.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
