# Paw Party site

The marketing site for Paw Party, an iPad app with eleven games for cats. It's free, with no ads and no in-app purchases.

## What's in here

- **Next.js** (App Router) with Turbopack, **Tailwind CSS 4** and **Biome**.
- **GSAP** for scroll and pointer motion: the entrance, the mascot's eyes following the cursor, and the game shelf that moves sideways as you scroll.
- **Remotion** for video. The hero is a Remotion composition playing live in the page through `@remotion/player`. The per-game clips and the trailers are rendered from the same code.
- **Rust**, compiled to WebAssembly, for the playable "you be the cat" demo.

All motion is switched off for visitors who ask for reduced motion: the hero shows a still, clips don't autoplay, and the demo waits for a click.

## Running it

```sh
npm install
npm run dev
```

The built demo, the rendered videos and the web-sized art are committed, so that's all you need to work on the page.

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | Biome lint and format check |
| `npm run test:e2e` | Playwright tests against the production build (run `npm run build` first) |
| `npm run test:demo` | Rust unit tests for the demo's game rules |
| `npm run build:demo` | Rebuild the demo to `public/demo` (needs Rust with the `wasm32-unknown-unknown` target) |
| `npm run studio` | Open the Remotion compositions in Remotion Studio |
| `npm run render` | Re-render the videos to `public/video` (add `hero`, `clips` or `trailer` to render one group) |
| `npm run sync:assets` | Re-export art from the master images (set `ART_SOURCE` to their folder) |

## Where things are

```
app/            pages, layout, styles, metadata
components/     hero, demo, games shelf and the other sections
content/        copy.ts holds every word on the site; config.ts holds the App Store link and contact email
remotion/       Hero, GameClip and Trailer compositions
demo/           the Rust crate behind the playable demo
scripts/        asset export and video rendering
tests/          Playwright end-to-end tests
public/         art, mascot images, footage, rendered video, the built demo
```

### Changing the words

Everything the site says is in `content/copy.ts`. The App Store link, the support email and the "legal text reviewed" switch are in `content/config.ts`. While the App Store link is empty, the badge points at the "free" section and a short line says the app is on its way.

### The demo

`demo/src/game.rs` has the rules (how a mouse darts, rests and flees; what counts as a catch; scoring) and no browser code, so it runs under `cargo test`. `demo/src/web.rs` draws it on a canvas. The page loads the built module from `public/demo` at run time.

### The videos

`remotion/Hero.tsx` is the hero reel. Its first and last frames match, so it loops without a seam. The same file drives both the live player in the page and `public/video/hero.mp4`. Gameplay footage in `public/footage` is real screen recordings of the app.

Remotion is free for individuals and small teams; larger companies need a licence. See remotion.dev/license.
