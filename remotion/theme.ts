import { loadFont } from "@remotion/google-fonts/BricolageGrotesque";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin"] });

/** Brand values shared by every composition. They match the site's CSS tokens. */
export const brand = {
  teal: "#00F4D1",
  lagoon: "#00CDB7",
  ink: "#0B0D10",
  sun: "#FFF303",
  cream: "#FBFAF4",
  font: fontFamily,
} as const;

export const FPS = 30;

/** Footage is recorded at 720×1036; clips skip the first seconds while the scene settles. */
export const FOOTAGE_ASPECT = 720 / 1036;
