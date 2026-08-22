import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HeaderCartButton } from "@/components/header-cart-button";
import { MobileNav } from "@/components/mobile-nav";
import { NavSearch } from "@/components/nav-search";
import { MegaMenu } from "@/components/mega-menu";
import { ContactUsButton } from "@/components/contact-us-button";
import { NavLink } from "@/components/nav-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCategories, getPromoBanner } from "@/lib/api/client";

export async function SiteHeader() {
  const [t, categories, promo] = await Promise.all([
    getTranslations("nav"),
    getCategories().catch(() => []),
    getPromoBanner().catch(() => ({ message: null, link: null })),
  ]);

  const MEGA_MENU_ITEMS = [
    { label: t("tools"), slug: "tools" },
    { label: t("outdoorEquipment"), slug: "outdoor-equipment" },
    { label: t("buildingMaterials"), slug: "building-materials" },
    { label: t("homeEssentials"), slug: "home-essentials" },
  ];

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
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/logo.png"
            alt="KMR City Ventures"
            width={480}
            height={317}
            priority
            className="h-12 w-auto md:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-4 xl:gap-6 2xl:flex">
          {MEGA_MENU_ITEMS.map((item) => (
            <MegaMenu key={item.slug} label={item.label} slug={item.slug} categories={categories} />
          ))}
          <NavLink href="/consultancy">{t("b2bSolutions")}</NavLink>
          <NavLink href="/catalog">{t("topSellers")}</NavLink>
          <NavLink href="/consultancy">{t("consultancy")}</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <NavSearch />
          <HeaderCartButton />
          <LanguageSwitcher />
          <ContactUsButton />
          <MobileNav categories={categories} />
        </div>
      </div>
    </header>
  );
}
