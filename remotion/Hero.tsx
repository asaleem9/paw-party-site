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
} from "remotion";
import { HERO } from "./config";
import { Chip } from "./parts/Chip";
import { Tablet } from "./parts/Tablet";
import { brand } from "./theme";

/**
 * The hero reel: the mascot peeks in, four games play on an iPad while their animals pass
 * behind it, and it ends on "Free on iPad". The first and last frames are the same empty
 * teal, so it loops without a visible seam.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Timeline, in frames.
const TABLET_IN = 78;
const CUT = 60;
const TABLET_OUT = TABLET_IN + CUT * 4; // 318
const FREE_IN = 330;
const FREE_OUT = 400;

const cuts = [
  { id: "mouseHunt", name: "Mouse Hunt", animal: "mouse_house", size: 190 },
  { id: "fishPond", name: "Fish Pond", animal: "fish_koi_kohaku", size: 230 },
  { id: "birdGarden", name: "Bird Garden", animal: "bird_robin", size: 250 },
  { id: "bugSafari", name: "Bug Safari", animal: "bug_ladybug", size: 150 },
] as const;

const Background = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: interpolateColors(
          frame,
          [0, FREE_IN - 10, FREE_IN + 8, FREE_OUT, HERO.durationInFrames - 4],
          [brand.teal, brand.teal, brand.sun, brand.sun, brand.teal],
        ),
      }}
    />
  );
};

/** The cat rising over the bottom edge, holding, then ducking back down. */
const Peek = ({ image, holdFor }: { image: string; holdFor: number }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <CanvasImage
        src={staticFile(`mascot/${image}.webp`)}
        style={{
          width: 720,
          translate: interpolate(
            frame,
            [0, 22, holdFor, holdFor + 14],
            ["0px 440px", "0px 6px", "0px 6px", "0px 440px"],
            {
              ...clamp,
              easing: ease,
            },
          ),
        }}
      />
    </AbsoluteFill>
  );
};

const Wordmark = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 210 }}>
      <div
        style={{
          fontFamily: brand.font,
          fontWeight: 800,
          fontSize: 150,
          letterSpacing: -5,
          color: brand.ink,
          opacity: interpolate(frame, [0, 10, 46, 56], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 16], [0.8, 1], { ...clamp, easing: ease }),
        }}
      >
        Paw Party
      </div>
    </AbsoluteFill>
  );
};

/** One of the game's animals crossing the frame behind the iPad. */
const Passerby = ({ animal, size, row }: { animal: string; size: number; row: number }) => {
  const frame = useCurrentFrame();
  const leftToRight = row % 2 === 0;
  const y = [820, 250, 660, 330][row % 4];
  return (
    <CanvasImage
      src={staticFile(`art/creatures/${animal}.webp`)}
      style={{
        position: "absolute",
        left: 0,
        top: y,
        height: size,
        // Art faces up; turn it to face the way it is travelling.
        rotate: leftToRight ? "90deg" : "-90deg",
        translate: interpolate(
          frame,
          [0, CUT + 6],
          leftToRight ? ["-320px 0px", "1240px 0px"] : ["1240px 0px", "-320px 0px"],
          clamp,
        ),
      }}
    />
  );
};

const Label = ({ name }: { name: string }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 70,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(frame, [0, 6, CUT - 6, CUT], [0, 1, 1, 0], clamp),
        scale: interpolate(frame, [0, 10], [0.7, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) }),
      }}
    >
      <Chip label={name} size={46} />
    </div>
  );
};

/** The iPad sliding up, playing four cuts of real gameplay, and leaving. */
const Device = () => {
  const frame = useCurrentFrame();
  const total = TABLET_OUT - TABLET_IN;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 110,
        translate: interpolate(
          frame,
          [0, 20, total - 4, total + 14],
          ["0px 1100px", "0px 0px", "0px 0px", "0px -1150px"],
          {
            ...clamp,
            easing: ease,
          },
        ),
        rotate: interpolate(frame, [0, 20], ["-6deg", "0deg"], { ...clamp, easing: ease }),
      }}
    >
      <Tablet height={800}>
        {cuts.map((cut, index) => (
          <Sequence key={cut.id} from={index * CUT} durationInFrames={CUT + 20} layout="none">
            <Video
              src={staticFile(`footage/hero/${cut.id}.mp4`)}
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
  const length = FREE_OUT - FREE_IN;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
      <div
        style={{
          fontFamily: brand.font,
          fontWeight: 800,
          fontSize: 170,
          lineHeight: 0.95,
          letterSpacing: -6,
          textAlign: "center",
          color: brand.ink,
          opacity: interpolate(frame, [0, 8, length - 8, length], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 14], [0.75, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) }),
        }}
      >
        Free
        <br />
        on iPad
      </div>
      <div
        style={{
          display: "flex",
          gap: 18,
          marginTop: 44,
          opacity: interpolate(frame, [12, 22, length - 8, length], [0, 1, 1, 0], clamp),
          translate: interpolate(frame, [12, 26], ["0px 30px", "0px 0px"], { ...clamp, easing: ease }),
        }}
      >
        <Chip label="No ads" size={40} />
        <Chip label="No in-app purchases" size={40} />
      </div>
    </AbsoluteFill>
  );
};

export const Hero = () => {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background />

      <Sequence from={8} durationInFrames={76} layout="none">
        <Wordmark />
      </Sequence>
      <Sequence from={6} durationInFrames={84} layout="none">
        <Peek image="peek" holdFor={62} />
      </Sequence>

      {cuts.map((cut, index) => (
        <Sequence key={cut.id} from={TABLET_IN + index * CUT} durationInFrames={CUT + 6} layout="none">
          <Passerby animal={cut.animal} size={cut.size} row={index} />
        </Sequence>
      ))}

      <Sequence from={TABLET_IN} durationInFrames={TABLET_OUT - TABLET_IN + 16} layout="none">
        <Device />
      </Sequence>

      {cuts.map((cut, index) => (
        <Sequence key={cut.id} from={TABLET_IN + index * CUT + 4} durationInFrames={CUT} layout="none">
          <Label name={cut.name} />
        </Sequence>
      ))}

      <Sequence from={FREE_IN} durationInFrames={FREE_OUT - FREE_IN} layout="none">
        <Free />
      </Sequence>
      <Sequence from={FREE_IN + 6} durationInFrames={FREE_OUT - FREE_IN + 8} layout="none">
        <Peek image="wink" holdFor={52} />
      </Sequence>
    </AbsoluteFill>
  );
};
