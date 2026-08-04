"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once at module scope (not inside a component/effect) per
// GSAP's guidance for Next.js — avoids "plugin already registered"
// warnings from Fast Refresh re-running effects.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
