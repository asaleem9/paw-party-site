import type { ReactNode } from "react";

/** An iPad-shaped bezel. Children fill the screen area, which keeps the app's 720:1036 shape. */
export function DeviceFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[2.2rem] bg-[#16191e] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/15 ${className}`}
    >
      <div className="relative aspect-[720/1036] overflow-hidden rounded-[1.5rem] bg-black">{children}</div>
    </div>
  );
}
