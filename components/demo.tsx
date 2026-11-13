"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copy } from "@/content/copy";
import { DeviceFrame } from "./device-frame";

/** The slice of the WebAssembly module's API that the page uses (see demo/src/web.rs). */
type DemoGame = {
  resize(width: number, height: number, devicePixelRatio: number): void;
  frame(seconds: number): void;
  tap(x: number, y: number): boolean;
  first_mouse(): Float32Array;
  readonly score: number;
  readonly catches: number;
  free(): void;
};

type DemoModule = {
  default(input?: string): Promise<unknown>;
  Demo: new (canvas: HTMLCanvasElement, floor: HTMLImageElement, mice: HTMLImageElement[], seed: number) => DemoGame;
};

declare global {
  interface Window {
    /** Exposed for end-to-end tests. */
    pawPartyDemo?: DemoGame;
  }
}

const MICE = ["mouse_house", "mouse_white", "mouse_field"];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`could not load ${src}`));
    image.src = src;
  });
}

type Status = "idle" | "loading" | "playing" | "failed";

/** "You be the cat": the mouse game from the app, written in Rust and running as WebAssembly. */
export function Demo() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<DemoGame | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);

  const start = useCallback(async () => {
    if (!canvas.current || game.current) return;
    setStatus("loading");
    try {
      // The module is a static file built from demo/, so it is loaded at run time, not bundled.
      const url = "/demo/demo.js";
      const [module, floor, ...mice] = await Promise.all([
        import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url) as Promise<DemoModule>,
        loadImage("/art/backdrops/bg_floor_wood.webp"),
        ...MICE.map((id) => loadImage(`/art/creatures/${id}.webp`)),
      ]);
      await module.default("/demo/demo_bg.wasm");
      const demo = new module.Demo(canvas.current, floor, mice, Date.now() % 1_000_000);
      game.current = demo;
      window.pawPartyDemo = demo;
      setStatus("playing");
    } catch {
      setStatus("failed");
    }
  }, []);

  // Start on its own once the demo is on screen, unless the visitor prefers reduced motion.
  useEffect(() => {
    const element = canvas.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          start();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [start]);

  // The animation loop: only runs while playing, on screen and in a visible tab.
  useEffect(() => {
    const element = canvas.current;
    const demo = game.current;
    if (status !== "playing" || !element || !demo) return;

    const fit = () => {
      const box = element.getBoundingClientRect();
      demo.resize(box.width, box.height, window.devicePixelRatio || 1);
    };
    fit();
    const sizes = new ResizeObserver(fit);
    sizes.observe(element);

    let visible = true;
    const sight = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    sight.observe(element);

    let last = performance.now();
    let request = 0;
    const tick = (now: number) => {
      const seconds = (now - last) / 1000;
      last = now;
      if (visible && !document.hidden) demo.frame(seconds);
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(request);
      sizes.disconnect();
      sight.disconnect();
    };
  }, [status]);

  useEffect(
    () => () => {
      game.current?.free();
      game.current = null;
      window.pawPartyDemo = undefined;
    },
    [],
  );

  const tap = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const demo = game.current;
    if (!demo) return;
    const box = event.currentTarget.getBoundingClientRect();
    demo.tap(event.clientX - box.left, event.clientY - box.top);
    setScore(demo.score);
    setCaught(demo.catches);
  };

  return (
    <section id="demo" className="on-dark bg-ink text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <p className="font-display text-lg font-bold text-sun">{copy.demo.eyebrow}</p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">
            {copy.demo.title}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80">{copy.demo.body}</p>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-white/80">{copy.demo.aside}</p>

          <dl className="mt-9 flex gap-10 font-display" aria-live="polite">
            <div>
              <dt className="text-sm font-bold uppercase tracking-wider text-white/60">{copy.demo.score}</dt>
              <dd className="text-5xl font-extrabold tabular-nums text-sun" data-testid="demo-score">
                {score}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold uppercase tracking-wider text-white/60">{copy.demo.caught}</dt>
              <dd className="text-5xl font-extrabold tabular-nums" data-testid="demo-caught">
                {caught}
              </dd>
            </div>
          </dl>
        </div>

        <DeviceFrame className="mx-auto w-full max-w-[26rem]">
          <canvas
            ref={canvas}
            onPointerDown={tap}
            aria-label={copy.demo.canvasLabel}
            data-testid="demo-canvas"
            data-status={status}
            className="absolute inset-0 h-full w-full cursor-pointer touch-none bg-[#b98a55]"
          />
          {status !== "playing" ? (
            <div className="absolute inset-0 grid place-items-center bg-ink/55 p-6 text-center">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={start}
                  className="rounded-full bg-sun px-8 py-3 font-display text-xl font-extrabold text-ink transition-transform hover:scale-105"
                >
                  {copy.demo.start}
                </button>
              ) : (
                <p className="font-display text-lg font-bold">
                  {status === "loading" ? copy.demo.loading : copy.demo.failed}
                </p>
              )}
            </div>
          ) : null}
        </DeviceFrame>
      </div>
    </section>
  );
}
