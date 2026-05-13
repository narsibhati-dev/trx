import { C } from "./tokens";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      color: C.text3,
      fontFamily: "var(--font-geist-mono)",
      fontSize: "11px",
      letterSpacing: "0.1em",
      marginBottom: "12px",
      textTransform: "uppercase",
      fontWeight: "500",
    }}>
      {children}
    </p>
  );
}
