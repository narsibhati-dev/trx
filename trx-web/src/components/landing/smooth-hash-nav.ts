import type { MouseEvent } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

/** Use on Next.js `<Link>` when `href` is like `/#section` so same-page clicks scroll smoothly. */
export function onSamePageHashLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string,
) {
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return;
  }
  const hash = url.hash.slice(1);
  if (!hash) return;
  const linkPath = url.pathname || "/";
  if (pathname !== linkPath) return;
  e.preventDefault();
  scrollToSection(hash);
  window.history.replaceState(null, "", `#${hash}`);
}
