import { brand } from "../theme";

/** A rounded label. */
export const Chip = ({ label, size = 34, dark = true }: { label: string; size?: number; dark?: boolean }) => (
  <div
    style={{
      display: "inline-block",
      padding: `${size * 0.36}px ${size * 0.78}px`,
      borderRadius: size * 2,
      background: dark ? brand.ink : brand.cream,
      color: dark ? "#fff" : brand.ink,
      fontFamily: brand.font,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);
