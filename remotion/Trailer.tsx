import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  interpolateColors,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TRAILER } from "./config";
import { Chip } from "./parts/Chip";
import { Tablet } from "./parts/Tablet";
import { brand } from "./theme";

/**
 * A 24-second trailer in two shapes (wide for the web and the App Store preview, tall for
 * social). Layout follows the composition's aspect ratio; the timeline is the same.
 */

export { TRAILER };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const INTRO = 66;
const CUT = 66;
const games = [
  { id: "mouseHunt", name: "Mouse Hunt", line: "Mice that dart, freeze and bolt." },
  { id: "fishPond", name: "Fish Pond", line: "Koi under rippling water." },
  { id: "birdGarden", name: "Bird Garden", line: "They leave if you miss." },
  { id: "bugSafari", name: "Bug Safari", line: "A spider on a thread." },
  { id: "critterPeek", name: "Critter Peek", line: "Pop up, look around, duck." },
  { id: "yarnString", name: "Yarn & String", line: "Bat it. It rolls." },
  { id: "floatPop", name: "Float & Pop", line: "The bubbles pop." },
  { id: "laserChase", name: "Laser Chase", line: "The dot, in green." },
] as const;
const GAMES_END = INTRO + CUT * games.length; // 594
const FREE_IN = GAMES_END + 6;

const Background = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: interpolateColors(frame, [0, FREE_IN - 8, FREE_IN + 8], [brand.teal, brand.teal, brand.sun]),
      }}
    />
  );
};

const Intro = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tall = height > width;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
      <div
        style={{
          position: "absolute",
          top: tall ? height * 0.24 : height * 0.16,
          fontFamily: brand.font,
          fontWeight: 800,
          fontSize: tall ? 190 : 220,
          letterSpacing: -7,
          color: brand.ink,
          opacity: interpolate(frame, [4, 14, INTRO - 12, INTRO - 2], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [4, 20], [0.8, 1], { ...clamp, easing: ease }),
        }}
      >
        Paw Party
      </div>
      <CanvasImage
        src={staticFile("mascot/peek.webp")}
        style={{
          width: tall ? 900 : 860,
          translate: interpolate(frame, [0, 22, INTRO - 16, INTRO], ["0px 560px", "0px 8px", "0px 8px", "0px 560px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      />
    </AbsoluteFill>
  );
};

const GameCaption = ({ name, line }: { name: string; line: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tall = height > width;
  return (
    <div
      style={{
        position: "absolute",
        left: tall ? 0 : width * 0.5,
        right: tall ? 0 : 90,
        top: tall ? 150 : 0,
        bottom: tall ? undefined : 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: tall ? "center" : "flex-start",
        textAlign: tall ? "center" : "left",
        gap: 22,
        opacity: interpolate(frame, [0, 8, CUT - 8, CUT], [0, 1, 1, 0], clamp),
        translate: interpolate(frame, [0, 14], ["0px 36px", "0px 0px"], { ...clamp, easing: ease }),
      }}
    >
      <div
        style={{
          fontFamily: brand.font,
          fontWeight: 800,
          fontSize: tall ? 120 : 150,
          letterSpacing: -4,
          lineHeight: 0.95,
          color: brand.ink,
        }}
      >
        {name}
      </div>
      <div
        style={{ fontFamily: brand.font, fontWeight: 700, fontSize: tall ? 50 : 58, color: brand.ink, opacity: 0.78 }}
      >
        {line}
      </div>
    </div>
  );
};

const Device = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const tall = height > width;
  const total = CUT * games.length;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: tall ? "center" : "flex-start",
        paddingLeft: tall ? 0 : width * 0.14,
        paddingTop: tall ? 420 : 0,
        translate: interpolate(
          frame,
          [0, 22, total - 4, total + 16],
          [`0px ${height}px`, "0px 0px", "0px 0px", `0px -${height}px`],
          {
            ...clamp,
            easing: ease,
          },
        ),
      }}
    >
      <Tablet height={tall ? 1180 : 900}>
        {games.map((game, index) => (
          <Sequence key={game.id} from={index * CUT} durationInFrames={CUT + 24} layout="none">
            <Video
              src={staticFile(`footage/${game.id}.mp4`)}
              trimBefore={3 * fps}
              muted
              objectFit="cover"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          </Sequence>
        ))}
      </Tablet>
    </AbsoluteFill>
  );
};

const Free = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tall = height > width;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
      <div
        style={{
          position: "absolute",
          top: tall ? height * 0.2 : height * 0.1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div
          style={{
            fontFamily: brand.font,
            fontWeight: 800,
            fontSize: tall ? 230 : 250,
            letterSpacing: -8,
            lineHeight: 0.92,
            textAlign: "center",
            color: brand.ink,
            scale: interpolate(frame, [0, 16], [0.75, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) }),
            opacity: interpolate(frame, [0, 8], [0, 1], clamp),
          }}
        >
          Free on iPad
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: tall ? "column" : "row",
            alignItems: "center",
            gap: 22,
            opacity: interpolate(frame, [14, 26], [0, 1], clamp),
          }}
        >
          <Chip label="No ads" size={56} />
          <Chip label="No in-app purchases" size={56} />
        </div>
      </div>
      <CanvasImage
        src={staticFile("mascot/wink.webp")}
        style={{
          width: tall ? 900 : 760,
          translate: interpolate(frame, [10, 34], ["0px 560px", "0px 8px"], { ...clamp, easing: ease }),
        }}
      />
    </AbsoluteFill>
  );
};

export const Trailer = () => {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />
      <Sequence durationInFrames={INTRO} layout="none">
        <Intro />
      </Sequence>
      <Sequence from={INTRO - 6} durationInFrames={CUT * games.length + 24} layout="none">
        <Device />
      </Sequence>
      {games.map((game, index) => (
        <Sequence key={game.id} from={INTRO + index * CUT} durationInFrames={CUT} layout="none">
          <GameCaption name={game.name} line={game.line} />
        </Sequence>
      ))}
      <Sequence from={FREE_IN} layout="none">
        <Free />
      </Sequence>
    </AbsoluteFill>
  );
};
