import { C } from "./tokens";

export function TrxLogo({ size = 32 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.3) + "px", textDecoration: "none" }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="7" fill={C.surface2} />
        <path d="M9 12L14 16L9 20" stroke={C.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16" y="19" width="7" height="1.8" rx="0.9" fill={C.text2} />
      </svg>
      <span style={{
        fontFamily: "var(--font-geist-sans)",
        fontSize: Math.round(size * 0.5) + "px",
        fontWeight: "600",
        color: C.text,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}>trx</span>
    </span>
  );
}
