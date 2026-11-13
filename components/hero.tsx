import Image from "next/image";
import type { CSSProperties } from "react";
import { copy } from "@/content/copy";
import { AppStoreBadge } from "./app-store-badge";
import { HeroReel } from "./hero-reel";
import { MascotEyes } from "./mascot-eyes";

const delay = (seconds: number) => ({ "--delay": `${seconds}s` }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal to-lagoon">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight">
          <Image
            src="/mascot/icon.webp"
            alt=""
            width={44}
            height={44}
            className="rounded-[0.7rem] ring-2 ring-ink"
            loading="eager"
          />
          Paw Party
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-7 text-[0.95rem] font-semibold md:flex">
          {copy.nav.map((item) => (
            <a key={item.href} href={item.href} className="underline-offset-4 hover:underline">
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-56 pt-8 sm:pb-64 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-80 lg:pt-14">
        <div>
          <h1 className="enter font-display text-[clamp(2.9rem,7vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            {copy.hero.title}
          </h1>
          <p style={delay(0.09)} className="enter mt-6 max-w-xl text-xl leading-relaxed text-ink/85">
            {copy.hero.body}
          </p>
          <div style={delay(0.18)} className="enter mt-8">
            <AppStoreBadge />
          </div>
          <ul style={delay(0.27)} className="enter mt-7 flex flex-wrap gap-2.5" data-testid="hero-promises">
            {copy.hero.promises.map((promise) => (
              <li key={promise} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[34rem] lg:rotate-2">
          <div className="enter-reel">
            <HeroReel />
          </div>
        </div>
      </div>

      {/* The outer box places the cat; the inner one animates, so the two don't fight over `translate`. */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-72 -translate-x-1/2 sm:w-80 lg:left-[8%] lg:w-[26rem] lg:translate-x-0">
        <div className="enter-cat">
          <MascotEyes />
        </div>
      </div>
    </section>
  );
}
