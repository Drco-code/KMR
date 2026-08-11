"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { gsap } from "@/lib/gsap";

export function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLFormElement>(null);

  // Same imperative-trigger pattern as MegaMenu's panel transition, driven
  // directly by the open/close actions, not a state-dependency effect, so
  // there's no race with when the panel is actually interactive.
  function animateOpen() {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.killTweensOf(panel);
    gsap.set(panel, { pointerEvents: "auto" });
    gsap.fromTo(
      panel,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function animateClose() {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.killTweensOf(panel);
    gsap.to(panel, {
      opacity: 0,
      y: -8,
      duration: 0.2,
      ease: "power2.in",
      pointerEvents: "none",
    });
  }

  // Uses the functional setState form so the open/close decision is always
  // based on the real current state, never a possibly-stale closure, the
  // header button and the input's onBlur can both fire in the same event
  // tick (a click blurs the input first), and both need to agree on which
  // direction to animate.
  function openSearch() {
    setOpen((prev) => {
      if (!prev) animateOpen();
      return true;
    });
  }

  function closeSearch() {
    setOpen((prev) => {
      if (prev) animateClose();
      return false;
    });
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
    closeSearch();
  }

  return (
    <>
      <button
        type="button"
        // Stops the button from stealing focus, which would blur the input
        // first and fire its own onBlur close, letting this button's own
        // click handler be the single source of truth for toggling.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => (open ? closeSearch() : openSearch())}
        className="relative flex size-9 items-center justify-center text-ink transition-colors hover:text-gold"
        aria-label={open ? "Close search" : "Search products"}
        aria-expanded={open}
      >
        <Search
          className={`absolute size-[18px] transition-all duration-200 ${open ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
        />
        <X
          className={`absolute size-[18px] transition-all duration-200 ${open ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        />
      </button>

      <form
        ref={panelRef}
        onSubmit={handleSubmit}
        role="search"
        className="pointer-events-none fixed inset-x-0 top-[calc(2.5rem+5rem)] z-40 -translate-y-2 border-b border-border bg-background opacity-0 shadow-lg"
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-6 py-3 md:px-20">
          <Search className="size-[18px] shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              if (!value) closeSearch();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSearch();
            }}
            placeholder="Search the collection…"
            className="w-full border-b border-ink bg-transparent py-1 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </div>
      </form>
    </>
  );
}
