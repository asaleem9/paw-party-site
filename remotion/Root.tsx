import { Composition } from "remotion";
import { HERO } from "./config";
import { GAME_CLIP, GameClip, type GameClipProps } from "./GameClip";
import { Hero } from "./Hero";
import { TRAILER, Trailer } from "./Trailer";

export const Root = () => {
  return (
    <>
      <Composition id="Hero" component={Hero} {...HERO} />
      <Composition
        id="GameClip"
        component={GameClip}
        {...GAME_CLIP}
        defaultProps={{ id: "mouseHunt", tone: "teal" } satisfies GameClipProps}
      />
      <Composition id="TrailerWide" component={Trailer} width={1920} height={1080} {...TRAILER} />
      <Composition id="TrailerTall" component={Trailer} width={1080} height={1920} {...TRAILER} />
    </>
  );
};
