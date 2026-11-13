"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { copy } from "@/content/copy";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** A looping gameplay clip that only plays while it is on screen. */
function Clip({ id, name }: { id: string; name: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) element.play().catch(() => {});
        else element.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] bg-ink/10">
      {/* The still loads lazily and stays underneath; the video covers it once it plays. */}
      <Image
        src={`/video/${id}.jpg`}
        alt=""
        fill
        sizes="(min-width: 1024px) 304px, 78vw"
        loading="lazy"
        className="object-cover"
      />
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        data-game={id}
        aria-label={`${name} gameplay`}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={`/video/${id}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}

/** All eleven games. A swipeable shelf on small screens; on wide ones the page scroll drives it sideways. */
export function Games() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const shelf = track.current;
        if (!shelf) return;
        const distance = () => shelf.scrollWidth - window.innerWidth + 48;
        gsap.to(shelf, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-games-pin]",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="games" className="overflow-hidden bg-cream">
      <div data-games-pin className="flex min-h-screen flex-col justify-center py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="font-display text-lg font-bold text-deep">{copy.games.eyebrow}</p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">
            {copy.games.title}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/80">{copy.games.body}</p>
        </div>

        <ul
          ref={track}
          data-testid="games-shelf"
          className="shelf mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:w-max lg:snap-none lg:overflow-visible lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] lg:pr-6"
        >
          {copy.games.items.map((game, index) => (
            <li key={game.id} className="w-[min(78vw,19rem)] shrink-0 snap-center" data-testid="game-card">
              <Clip id={game.id} name={game.name} />
              <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
                <span className="mr-2 text-deep tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                {game.name}
              </h3>
              <p className="mt-1.5 leading-relaxed text-ink/75">{game.line}</p>
            </li>
          ))}
          <li className="flex w-[min(78vw,19rem)] shrink-0 snap-center flex-col justify-center rounded-[1.75rem] bg-ink p-8 text-white">
            <h3 className="font-display text-3xl font-extrabold leading-tight text-sun">{copy.games.partyMix.title}</h3>
            <p className="mt-3 leading-relaxed text-white/80">{copy.games.partyMix.body}</p>
          </li>
        </ul>
      </div>
    </section>
  );
}
