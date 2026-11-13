import { Video } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { GAME_CLIP } from "./config";
import { Tablet } from "./parts/Tablet";
import { brand } from "./theme";

export { GAME_CLIP };

export type GameClipProps = { id: string; tone: "teal" | "sun" | "cream" };

const tones = { teal: brand.teal, sun: brand.sun, cream: brand.cream } as const;

/** Six seconds of real gameplay from one mode, shown on an iPad. */
export const GameClip = ({ id, tone }: GameClipProps) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: tones[tone], justifyContent: "center", alignItems: "center" }}>
      <Tablet height={724}>
        <Video
          src={staticFile(`footage/${id}.mp4`)}
          trimBefore={1.5 * fps}
          muted
          objectFit="cover"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      </Tablet>
    </AbsoluteFill>
  );
};
