import Link from "next/link";
import { FOCUS_RING, raisedTopBar, SCENE } from "@/app/landing-material";
import { C } from "./tokens";
import { TrxLogo } from "./TrxLogo";

export function LandingFooter() {
  return (
    <footer className={`relative z-10 ${SCENE} pb-0 pt-10`}>
      <div className="mx-auto box-border max-w-[1280px] px-4 sm:px-10">
        <div className={raisedTopBar("px-5 py-9 sm:px-10")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <TrxLogo size={24} />
              <p style={{ color: C.text3, fontSize: "13px", fontFamily: "var(--font-geist-sans)", maxWidth: "240px", lineHeight: "1.6", margin: "8px 0 0" }}>
                A fast TUI package manager written in Rust.
              </p>
            </div>

            <div className="flex items-center gap-6">
              {[
                { label: "GitHub", href: "https://github.com/pie-314/trx",        external: true },
                { label: "Issues", href: "https://github.com/pie-314/trx/issues", external: true },
                { label: "Docs",   href: "/",                                      external: false },
              ].map(link =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={["text-[13px] text-[#505050] no-underline transition-colors hover:text-[#878787]", "[font-family:var(--font-geist-sans)]", FOCUS_RING].join(" ")}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={["text-[13px] text-[#505050] no-underline transition-colors hover:text-[#878787]", "[font-family:var(--font-geist-sans)]", FOCUS_RING].join(" ")}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            <div style={{ color: C.text3, fontSize: "12px", fontFamily: "var(--font-geist-mono)" }}>MIT · 2026</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
