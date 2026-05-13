import { MAX_W } from "./tokens";

export function Container({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "0 40px", ...style }}>
      {children}
    </div>
  );
}
