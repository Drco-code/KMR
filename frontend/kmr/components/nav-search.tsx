"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
    close();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center text-ink transition-colors hover:text-gold"
        aria-label="Search products"
      >
        <Search className="size-[18px]" />
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="fixed inset-x-0 top-[calc(2.5rem+5rem)] z-40 border-b border-border bg-background shadow-lg"
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-6 py-3 md:px-20">
        <Search className="size-[18px] shrink-0 text-ink-muted" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (!value) close();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          placeholder="Search the collection…"
          className="w-full border-b border-ink bg-transparent py-1 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={close}
          className="flex size-9 shrink-0 items-center justify-center text-ink transition-colors hover:text-gold"
          aria-label="Close search"
        >
          <X className="size-[18px]" />
        </button>
      </div>
    </form>
  );
}
