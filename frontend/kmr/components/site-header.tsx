import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CartBadge } from "@/components/cart-badge";
import { MobileNav } from "@/components/mobile-nav";
import { NavSearch } from "@/components/nav-search";
import { MegaMenu } from "@/components/mega-menu";
import { ContactUsButton } from "@/components/contact-us-button";
import { NavLink } from "@/components/nav-link";
import { getCategories, getPromoBanner } from "@/lib/api/client";

const MEGA_MENU_ITEMS = [
  { label: "Tools", slug: "tools" },
  { label: "Outdoor Equipment", slug: "outdoor-equipment" },
  { label: "Building Materials", slug: "building-materials" },
  { label: "Home Essentials", slug: "home-essentials" },
  { label: "Auto Essentials", slug: "auto-essentials" },
];

export async function SiteHeader() {
  // The promo bar is admin-managed (PromoBanner resource in the dashboard):
  // it only renders while a message is set and the banner is active.
  const [categories, promo] = await Promise.all([
    getCategories(),
    getPromoBanner(),
  ]);

  return (
    <header className="sticky top-0 z-40">
      {promo?.message ? (
        <div className="flex min-h-10 items-center justify-center bg-black px-6 py-2 text-center md:px-20">
          {promo.link ? (
            <Link
              href={promo.link}
              className="text-xs font-medium tracking-[0.15em] text-white uppercase transition-colors hover:text-gold"
            >
              {promo.message}
            </Link>
          ) : (
            <p className="text-xs font-medium tracking-[0.15em] text-white uppercase">
              {promo.message}
            </p>
          )}
        </div>
      ) : null}
      <div className="flex h-20 items-center justify-between border-b border-border bg-background px-6 md:px-20">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-ink md:text-2xl"
        >
          KMR
        </Link>

        <nav className="hidden items-center gap-3 2xl:flex">
          {MEGA_MENU_ITEMS.map((item) => (
            <MegaMenu key={item.slug} label={item.label} slug={item.slug} categories={categories} />
          ))}
          <NavLink href="/consultancy">B2B Solutions</NavLink>
          <NavLink href="/catalog">Top Sellers</NavLink>
          <NavLink href="/consultancy">Consultancy</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <NavSearch />
          <Link
            href="/quote"
            className="relative flex size-9 items-center justify-center text-ink transition-colors hover:text-gold"
          >
            <ShoppingCart className="size-[18px]" />
            <CartBadge />
            <span className="sr-only">View quote cart</span>
          </Link>
          <ContactUsButton />
          <MobileNav categories={categories} />
        </div>
      </div>
    </header>
  );
}
