"use client";

import Link from "next/link";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-1 py-0.5 text-sm font-medium text-[#878787] outline-none transition-colors",
        "hover:text-[#ebebeb]",
        "focus-visible:ring-2 focus-visible:ring-[#555fbb]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919]",
        "shrink-0 [font-family:var(--font-geist-sans)] sm:text-[14px]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
