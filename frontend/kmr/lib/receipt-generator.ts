import { jsPDF } from "jspdf";
import { formatPrice, formatAmount, getItemSubtotal, calculateCartEstimatedTotal } from "@/lib/price";
import type { QuoteCartItem } from "@/lib/store/quote-cart";

export interface ReceiptCustomerInfo {
  name: string;
  company?: string;
  phone?: string;
  location?: string;
}

function getItemDisplayName(item: QuoteCartItem) {
  if (item.variantColorName && item.name.includes(" — ")) {
    return item.name.split(" — ")[0];
  }
  return item.name;
}

export function generateQuoteReceiptPDF(
  customer: ReceiptCustomerInfo,
  items: QuoteCartItem[]
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const quoteRef = `KMR-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Top Brand Bar Accent
  doc.setFillColor(26, 39, 68); // #1a2744 brand dark blue
  doc.rect(0, 0, pageWidth, 6, "F");

  let y = 20;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(26, 39, 68);
  doc.text("KMR CITY VENTURES", margin, y);

  // Quote Ref and Date (Right aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Quote Ref: ${quoteRef}`, pageWidth - margin, y - 4, { align: "right" });
  doc.text(`Date: ${dateStr}`, pageWidth - margin, y + 1, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Architectural Coatings & Hardware Solutions", margin, y);

  y += 10;
  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;

  // Customer Information Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 39, 68);
  doc.text("QUOTE PREPARED FOR:", margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  const leftCol = margin + 5;
  const rightCol = margin + contentWidth / 2 + 5;

  doc.text(`Name: ${customer.name}`, leftCol, y + 13);
  if (customer.company) {
    doc.text(`Company: ${customer.company}`, leftCol, y + 19);
  }

  if (customer.phone) {
    doc.text(`Phone: ${customer.phone}`, rightCol, y + 13);
  }
  if (customer.location) {
    doc.text(`Location: ${customer.location}`, rightCol, y + 19);
  }

  y += 34;

  // Table Header
  doc.setFillColor(26, 39, 68);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);

  doc.text("ITEM & SPECIFICATION", margin + 4, y + 5.5);
  doc.text("QTY", margin + 95, y + 5.5, { align: "center" });
  doc.text("UNIT PRICE", margin + 125, y + 5.5, { align: "right" });
  doc.text("SUBTOTAL", margin + contentWidth - 4, y + 5.5, { align: "right" });

  y += 8;

  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);

  items.forEach((item, index) => {
    // Check if we need a new page
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    const isEven = index % 2 === 1;
    if (isEven) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y, contentWidth, 12, "F");
    }

    const displayName = getItemDisplayName(item);
    const subtotal = getItemSubtotal(item.priceDescription, item.quantity);
    const unitPrice = formatPrice(item.priceDescription) || "Quote required";

    // Item name
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(displayName.length > 42 ? displayName.slice(0, 40) + "..." : displayName, margin + 4, y + 5);

    // Variants (color, size)
    const variants: string[] = [];
    if (item.variantColorName) variants.push(`Color: ${item.variantColorName}`);
    if (item.variantSize) variants.push(`Size: ${item.variantSize}`);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    if (variants.length > 0) {
      doc.text(variants.join(" | "), margin + 4, y + 9);
    }

    // Qty
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    doc.text(String(item.quantity), margin + 95, y + 6, { align: "center" });

    // Unit Price
    doc.text(unitPrice, margin + 125, y + 6, { align: "right" });

    // Subtotal
    doc.setFont("helvetica", "bold");
    if (subtotal !== null) {
      doc.text(formatAmount(subtotal), margin + contentWidth - 4, y + 6, { align: "right" });
    } else {
      doc.setFont("helvetica", "normal");
      doc.text("On Request", margin + contentWidth - 4, y + 6, { align: "right" });
    }

    y += 12;
  });

  // Bottom Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);

  y += 8;

  // Totals Section
  const { hasPricedItems, unpricedCount, formattedTotal } = calculateCartEstimatedTotal(items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Items: ${totalItems}`, margin + 4, y + 4);

  if (hasPricedItems) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(26, 39, 68);
    doc.text("ESTIMATED TOTAL:", margin + 105, y + 4);

    doc.setFontSize(12);
    doc.text(formattedTotal, margin + contentWidth - 4, y + 4, { align: "right" });

    if (unpricedCount > 0) {
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(180, 120, 0);
      doc.text(`+ ${unpricedCount} item(s) pricing confirmed upon quote review`, margin + contentWidth - 4, y + 3, {
        align: "right",
      });
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(26, 39, 68);
    doc.text("Pricing On Request", margin + contentWidth - 4, y + 4, { align: "right" });
  }

  y += 24;

  // Notice Box
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(26, 39, 68);
  doc.text("IMPORTANT NOTE:", margin + 4, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This receipt is a summary of your requested quote. Final confirmation, batch availability, applicable wholesale",
    margin + 4,
    y + 9.5
  );
  doc.text(
    "discounts, and delivery logistics will be verified directly with your KMR representative via WhatsApp.",
    margin + 4,
    y + 13.5
  );

  // Footer Branding
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for choosing KMR City Ventures.", margin, pageHeight - 12);
  doc.text("support@kmrcityventures.com", pageWidth - margin, pageHeight - 12, { align: "right" });

  // Trigger browser download
  const filename = `KMR-Quote-Receipt-${quoteRef}.pdf`;
  doc.save(filename);
}
