import type { ReactNode } from "react";
import { brand, FOOTAGE_ASPECT } from "../theme";

/** An iPad-shaped frame. `height` is the outer height in pixels; children fill the screen area. */
export const Tablet = ({ height, children }: { height: number; children: ReactNode }) => {
  const bezel = height * 0.028;
  const screenHeight = height - bezel * 2;
  const screenWidth = screenHeight * FOOTAGE_ASPECT;
  return (
    <div
      style={{
        width: screenWidth + bezel * 2,
        height,
        padding: bezel,
        borderRadius: height * 0.06,
        background: brand.ink,
        boxShadow: "0 40px 80px rgba(0, 0, 0, 0.35), inset 0 0 0 2px rgba(255, 255, 255, 0.08)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: screenWidth,
          height: screenHeight,
          borderRadius: height * 0.036,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {children}
      </div>
    </div>
  );
};
