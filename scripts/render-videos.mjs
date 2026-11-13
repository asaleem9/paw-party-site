// Renders the Remotion compositions to files under public/video.
//
//   node scripts/render-videos.mjs            everything
//   node scripts/render-videos.mjs hero       just the hero reel
//   node scripts/render-videos.mjs clips      just the per-game clips
//   node scripts/render-videos.mjs trailer    just the trailers

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const only = process.argv[2];
const outDir = path.resolve("public/video");
await mkdir(outDir, { recursive: true });

const games = [
  "mouseHunt",
  "fishPond",
  "birdGarden",
  "bugSafari",
  "critterPeek",
  "laserChase",
  "yarnString",
  "floatPop",
  "pawPaint",
  "catTV",
  "purrRoom",
];
const tones = ["teal", "sun", "cream"];

console.log("bundling…");
const serveUrl = await bundle({ entryPoint: path.resolve("remotion/index.ts"), publicDir: path.resolve("public") });

async function video(id, file, inputProps = {}, crf = 23) {
  const composition = await selectComposition({ serveUrl, id, inputProps });
  await renderMedia({
    composition,
    serveUrl,
    inputProps,
    codec: "h264",
    crf,
    pixelFormat: "yuv420p",
    muted: true,
    outputLocation: path.join(outDir, file),
  });
  console.log("rendered", file);
  return composition;
}

async function still(id, file, frame, inputProps = {}) {
  const composition = await selectComposition({ serveUrl, id, inputProps });
  await renderStill({
    composition,
    serveUrl,
    inputProps,
    frame,
    imageFormat: "jpeg",
    jpegQuality: 82,
    output: path.join(outDir, file),
  });
  console.log("rendered", file);
}

if (!only || only === "hero") {
  await video("Hero", "hero.mp4", {}, 21);
  // The poster doubles as the still shown when motion is reduced.
  await still("Hero", "hero-poster.jpg", 362);
}

if (!only || only === "clips") {
  for (const [index, id] of games.entries()) {
    const props = { id, tone: tones[index % tones.length] };
    await video("GameClip", `${id}.mp4`, props, 25);
    await still("GameClip", `${id}.jpg`, 60, props);
  }
}

if (!only || only === "trailer") {
  await video("TrailerWide", "trailer-wide.mp4");
  await video("TrailerTall", "trailer-tall.mp4");
  await still("TrailerWide", "share.jpg", 640);
}
