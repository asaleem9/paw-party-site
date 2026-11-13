"use client";

import type { PlayerRef } from "@remotion/player";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { copy } from "@/content/copy";
import { HERO } from "@/remotion/config";

const Player = dynamic(() => import("@remotion/player").then((module) => module.Player), { ssr: false });

/**
 * The hero's centrepiece: the Remotion composition playing live. The poster frame sits
 * underneath while it loads, and is all that shows when the visitor prefers reduced motion.
 */
export function HeroReel() {
  const [animate, setAnimate] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!query.matches);
    // Wait until the page has finished loading and the browser is idle, so the player
    // never competes with the first paint. The poster is on screen in the meantime.
    let idle = 0;
    const begin = () => {
      idle = window.setTimeout(update, 400);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    query.addEventListener("change", update);
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("load", begin);
      query.removeEventListener("change", update);
    };
  }, []);

  // Stop decoding video while the hero is off screen.
  useEffect(() => {
    if (!animate || !frame.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) player.current?.play();
      else player.current?.pause();
    });
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, [animate]);

  const lazyComponent = useCallback(() => import("@/remotion/Hero").then((module) => ({ default: module.Hero })), []);

  return (
    <div
      ref={frame}
      role="img"
      aria-label={copy.hero.reelLabel}
      data-testid="hero-reel"
      data-animated={animate}
      className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] border-[6px] border-ink bg-teal shadow-[0_30px_70px_rgba(0,0,0,0.3)]"
    >
      {/* The largest thing on the page at first paint, so it is fetched first. */}
      <Image
        src="/video/hero-poster.jpg"
        alt=""
        fill
        sizes="(min-width: 1024px) 560px, 92vw"
        className="object-cover"
        loading="eager"
        fetchPriority="high"
      />
      {animate ? (
        // The wrapper has a text description, so the moving picture itself is hidden from assistive tech.
        <div inert aria-hidden="true" className="absolute inset-0">
          <Player
            ref={player}
            lazyComponent={lazyComponent}
            durationInFrames={HERO.durationInFrames}
            compositionWidth={HERO.width}
            compositionHeight={HERO.height}
            fps={HERO.fps}
            autoPlay
            loop
            initiallyMuted
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            acknowledgeRemotionLicense
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </div>
      ) : null}
    </div>
  );
}
