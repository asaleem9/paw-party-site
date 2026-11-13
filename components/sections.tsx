import Image from "next/image";
import Link from "next/link";
import { config } from "@/content/config";
import { copy } from "@/content/copy";
import { AppStoreBadge } from "./app-store-badge";
import { DeviceFrame } from "./device-frame";
import { Reveal } from "./reveal";

const heading = "font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.03em]";

/** How the app is built around a cat's way of playing. */
export function ForPaws() {
  return (
    <section id="paws" className="bg-gradient-to-b from-teal to-lagoon">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <p className="font-display text-lg font-bold">{copy.paws.eyebrow}</p>
        <h2 className={`mt-2 max-w-3xl ${heading}`}>{copy.paws.title}</h2>
        <Reveal stagger={0.1} className="mt-14 grid gap-6 sm:grid-cols-2">
          {copy.paws.items.map((item) => (
            <article
              key={item.title}
              className="relative overflow-hidden rounded-[2rem] bg-cream p-8 pb-36 shadow-[0_10px_0_rgba(11,13,16,0.9)] ring-2 ring-ink sm:pb-40"
            >
              <h3 className="font-display text-3xl font-extrabold tracking-tight">{item.title}</h3>
              <p className="mt-3 max-w-md text-lg leading-relaxed text-ink/80">{item.body}</p>
              <Image
                src={`/mascot/${item.art}.webp`}
                alt=""
                width={360}
                height={300}
                className={`pointer-events-none absolute object-contain ${
                  item.art === "paw" || item.art === "surprised"
                    ? "bottom-0 right-6 h-32 w-auto sm:h-36"
                    : "bottom-5 right-6 h-24 w-auto sm:h-28"
                }`}
              />
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** The human-facing side of the app, with real screenshots. */
export function ForHumans() {
  return (
    <section id="humans" className="on-dark bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <p className="font-display text-lg font-bold text-sun">{copy.humans.eyebrow}</p>
        <h2 className={`mt-2 max-w-3xl ${heading}`}>{copy.humans.title}</h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{copy.humans.body}</p>

        <Reveal stagger={0.12} className="mt-14 grid gap-6 sm:grid-cols-3">
          {copy.humans.screens.map((screen, index) => (
            <DeviceFrame key={screen.id} className={index === 1 ? "sm:translate-y-8" : ""}>
              <Image
                src={`/screens/${screen.id}.webp`}
                alt={screen.alt}
                fill
                sizes="(min-width: 640px) 30vw, 90vw"
                className="object-cover object-top"
              />
            </DeviceFrame>
          ))}
        </Reveal>

        <Reveal stagger={0.06} className="mt-20 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {copy.humans.items.map((item) => (
            <div key={item.title} className="border-t-2 border-white/15 pt-5">
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-sun">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-white/80">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** The price, which is nothing. */
export function Free() {
  return (
    <section id="free" className="relative overflow-hidden bg-sun">
      <div className="mx-auto max-w-6xl px-6 pb-56 pt-24 text-center sm:pb-64 lg:pt-32">
        <h2 className="font-display text-[clamp(4rem,14vw,11rem)] font-extrabold leading-[0.9] tracking-[-0.05em]">
          {copy.free.title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-ink/85">{copy.free.body}</p>
        <div className="mt-9 flex justify-center">
          <AppStoreBadge />
        </div>
      </div>
      <Image
        src="/mascot/wink.webp"
        alt=""
        width={520}
        height={292}
        className="pointer-events-none absolute bottom-0 left-1/2 w-72 -translate-x-1/2 sm:w-96"
      />
    </section>
  );
}

export function Questions() {
  return (
    <section id="questions" className="bg-cream">
      <div className="mx-auto max-w-3xl px-6 py-24 lg:py-32">
        <p className="font-display text-lg font-bold text-deep">{copy.questions.eyebrow}</p>
        <h2 className={`mt-2 ${heading}`}>{copy.questions.title}</h2>
        <div className="mt-10 divide-y-2 divide-ink/10 border-y-2 border-ink/10">
          {copy.questions.items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl font-extrabold tracking-tight [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-xl text-sun transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink/80">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-40 pt-14 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight">
            <Image src="/mascot/icon.webp" alt="" width={40} height={40} className="rounded-[0.65rem]" />
            {config.name}
          </Link>
          <p className="mt-3 text-white/70">{copy.footer.line}</p>
        </div>
        <nav aria-label="Footer" className="flex gap-8 font-semibold">
          {copy.footer.links.map((link) => (
            <Link key={link.href} href={link.href} className="underline-offset-4 hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="relative z-10 mx-auto max-w-6xl px-6 pb-6 text-sm text-white/50">{copy.footer.appleNote}</p>
      <Image
        src="/mascot/sleep.webp"
        alt=""
        width={420}
        height={236}
        // Black cat on a black footer: only the closed eyes show, which is the idea.
        className="pointer-events-none absolute bottom-0 right-[8%] w-56 sm:w-64"
      />
    </footer>
  );
}

/** Shared frame for the two small text pages. */
export function TextPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <header className="bg-gradient-to-b from-teal to-lagoon">
        <div className="mx-auto max-w-3xl px-6 pb-14 pt-5">
          <Link href="/" className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight">
            <Image
              src="/mascot/icon.webp"
              alt=""
              width={44}
              height={44}
              className="rounded-[0.7rem] ring-2 ring-ink"
              loading="eager"
            />
            {config.name}
          </Link>
          <h1 className={`mt-14 ${heading}`}>{title}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-14 text-lg leading-relaxed text-ink/85">{children}</main>
      <SiteFooter />
    </>
  );
}
