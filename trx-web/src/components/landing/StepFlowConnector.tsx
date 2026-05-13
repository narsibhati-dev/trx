"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { C } from "./tokens";
import { ease } from "./animations";

const STEP_BEAM_DURATION_S = 1.55;
const STEP_BEAM_DASH_PERIOD = 40;

export function StepFlowConnector({ phase = 0 }: { phase?: 0 | 1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const beamDelay = 0.42 + phase * (STEP_BEAM_DURATION_S / 2);

  return (
    <div
      ref={ref}
      style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.9 }}
      aria-hidden
    >
      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" aria-hidden>
        <line x1="4" y1="12" x2="44" y2="12" stroke={C.selection} strokeOpacity={0.22} strokeWidth="2" strokeLinecap="round" />
        <motion.line
          x1="4" y1="12" x2="44" y2="12"
          stroke={C.selection} strokeOpacity={0.42} strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.2 }}
        />
        <motion.line
          x1="4" y1="12" x2="44" y2="12"
          stroke={C.selection} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="12 28" vectorEffect="non-scaling-stroke"
          initial={{ strokeDashoffset: 0, opacity: 0 }}
          animate={inView ? { strokeDashoffset: -STEP_BEAM_DASH_PERIOD, opacity: 1 } : {}}
          transition={{
            opacity: { duration: 0.2, delay: beamDelay },
            strokeDashoffset: { duration: STEP_BEAM_DURATION_S, repeat: Infinity, ease: "linear", delay: beamDelay },
          }}
        />
      </svg>
    </div>
  );
}
