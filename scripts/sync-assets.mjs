// Copies finished art into public/ at web sizes.
//
//   ART_SOURCE=/path/to/art node scripts/sync-assets.mjs
//
// ART_SOURCE is the folder that holds the master images (`raw/`, `brand/`, `out/site/mascot/`).
// The generated files are committed, so the site builds without the masters.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = path.resolve(process.env.ART_SOURCE ?? "../cat-app/Tools/art");
const publicDir = path.resolve("public");

const mascots = ["blank", "look_left", "look_up", "wink", "surprised", "sleep", "paw", "sit", "loaf", "pounce", "tail"];

const creatures = [
  "mouse_house",
  "mouse_white",
  "mouse_field",
  "mouse_golden",
  "fish_koi_kohaku",
  "fish_goldfish",
  "fish_puffer_puff",
  "fish_betta",
  "bird_robin",
  "bird_bluejay",
  "bird_cardinal_fold",
  "bug_ladybug",
  "bug_butterfly",
  "bug_dragonfly",
  "peek_frog",
  "peek_hedgehog",
  "prop_yarn_blue",
  "prop_feather",
];

const backdrops = ["bg_floor_wood"];

const cards = [
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

async function out(folder) {
  const dir = path.join(publicDir, folder);
  await mkdir(dir, { recursive: true });
  return dir;
}

/** Trims transparent margins, limits the longest side and writes WebP. */
async function cutout(input, output, longest) {
  await sharp(input)
    .trim()
    .resize({ width: longest, height: longest, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(output);
}

/** Finds the two blank yellow eyes so the page can draw pupils in the right place. */
async function measureEyes(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const sides = [
    { sumX: 0, sumY: 0, count: 0 },
    { sumX: 0, sumY: 0, count: 0 },
  ];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const yellow = data[i] > 200 && data[i + 1] > 200 && data[i + 2] < 90 && data[i + 3] > 200;
      if (!yellow) continue;
      const side = sides[x < info.width / 2 ? 0 : 1];
      side.sumX += x;
      side.sumY += y;
      side.count += 1;
    }
  }
  return {
    aspect: info.width / info.height,
    eyes: sides.map((side) => ({
      x: side.sumX / side.count / info.width,
      y: side.sumY / side.count / info.height,
      // Radius as a fraction of the image width.
      r: Math.sqrt(side.count / Math.PI) / info.width,
    })),
  };
}

const mascotDir = await out("mascot");
for (const name of mascots) {
  await cutout(path.join(source, "out/site/mascot", `mascot_${name}.png`), path.join(mascotDir, `${name}.webp`), 1100);
}
await cutout(path.join(source, "brand/mascot_peek.png"), path.join(mascotDir, "peek.webp"), 1100);
await sharp(path.join(source, "brand/mascot_icon.png"))
  .resize(512, 512)
  .webp({ quality: 90 })
  .toFile(path.join(mascotDir, "icon.webp"));

const eyes = await measureEyes(path.join(mascotDir, "blank.webp"));
await mkdir("content", { recursive: true });
await writeFile("content/mascot-eyes.json", `${JSON.stringify(eyes, null, 2)}\n`);

const creatureDir = await out("art/creatures");
for (const id of creatures) {
  await cutout(path.join(source, "raw", `${id}.png`), path.join(creatureDir, `${id}.webp`), 560);
}

const backdropDir = await out("art/backdrops");
for (const id of backdrops) {
  await sharp(path.join(source, "raw", `${id}.png`))
    .resize({ width: 1536 })
    .webp({ quality: 80 })
    .toFile(path.join(backdropDir, `${id}.webp`));
}

const cardDir = await out("art/cards");
for (const id of cards) {
  await sharp(path.join(source, "raw", `card_${id}.png`))
    .resize(640, 640, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(path.join(cardDir, `${id}.webp`));
}

// Icons: favicon, touch icon and the square used in page metadata.
const icon = path.join(source, "brand/mascot_icon.png");
await sharp(icon).resize(180, 180).png().toFile(path.resolve("app/apple-icon.png"));
await sharp(icon).resize(512, 512).png().toFile(path.resolve("app/icon.png"));

console.log(`synced ${mascots.length + 2} mascot images, ${creatures.length} creatures, ${cards.length} cards`);
console.log("eyes", JSON.stringify(eyes));
