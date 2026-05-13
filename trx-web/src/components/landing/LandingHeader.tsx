"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { raisedGhostBtn } from "@/app/landing-material";
import { IconGithub } from "./icons";
import { NavLink } from "./NavLink";
import { TrxLogo } from "./TrxLogo";

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[100] bg-transparent">
      <div className="mx-auto box-border max-w-[1280px] px-4 pb-2 pt-2.5 sm:px-10">
        <div
          className={[
            "flex min-h-[52px] w-full items-center gap-2 sm:gap-3",
            "rounded-2xl border border-white/[0.05]",
            "bg-gradient-to-b from-[#202020] to-[#191919]",
            "shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_1px_#ffffff35_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060]",
            "px-2 py-1.5 sm:px-3",
          ].join(" ")}
        >
          <div className="shrink-0 rounded-xl bg-[#0c0c0c] p-1 shadow-[0_0.5px_0_#ffffff40,0_2px_6px_#00000090_inset]">
            <Link
              href="/"
              className="flex rounded-lg outline-none ring-offset-2 ring-offset-[#191919] focus-visible:ring-2 focus-visible:ring-[#555fbb]/45"
            >
              <TrxLogo size={26} />
            </Link>
          </div>

          <nav className="ml-3 flex min-w-0 flex-1 items-center gap-4 sm:ml-6 sm:gap-7">
            <NavLink href="/#features">Features</NavLink>
            <NavLink href="/#install">Install</NavLink>
            <NavLink href="/#platforms">Platforms</NavLink>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
            <div className="rounded-lg bg-[#0d0d0d] px-1 py-px shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset]">
              <a
                href="https://github.com/pie-314/trx"
                target="_blank"
                rel="noopener noreferrer"
                className={"no-underline gap-1.5 px-2.5 py-1.5 text-sm flex justify-center items-center"}
              >
                <IconGithub size={13} /> GitHub
              </a>
            </div>

            <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
              <Link
                href="/#install"
                className={[
                  "rounded-lg border border-white/[0.06]",
                  "bg-gradient-to-b from-[#202020] to-[#191919]",
                  "px-3.5 py-1.5 text-sm font-semibold text-[#ebebeb] no-underline outline-none transition-transform",
                  "shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_1px_#ffffff35_inset,0_12px_14px_-10px_#00000078,0_22px_28px_-14px_#00000062,0_2px_8px_0_#00000068]",
                  "hover:brightness-[1.06]",
                  "focus-visible:ring-2 focus-visible:ring-[#555fbb]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919]",
                  "[font-family:var(--font-geist-sans)]",
                ].join(" ")}
              >
                Install
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </header >
  );
}
