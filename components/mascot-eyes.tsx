"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";
import geometry from "@/content/mascot-eyes.json";

gsap.registerPlugin(useGSAP);

/** How big the pupil is compared with the eye, and how far it may travel inside it. */
const PUPIL = 0.52;
const TRAVEL = 0.4;

/** The mascot's head with pupils that follow the pointer. Purely decorative. */
export function MascotEyes({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pupils = gsap.utils.toArray<HTMLElement>("[data-pupil]", root.current);
      if (pupils.length === 0) return;
      const movers = pupils.map((pupil) => ({
        pupil,
        x: gsap.quickTo(pupil, "x", { duration: 0.35, ease: "power3.out" }),
        y: gsap.quickTo(pupil, "y", { duration: 0.35, ease: "power3.out" }),
      }));

      const look = (clientX: number, clientY: number) => {
        for (const mover of movers) {
          const eye = mover.pupil.parentElement;
          if (!eye) continue;
          const box = eye.getBoundingClientRect();
          const dx = clientX - (box.left + box.width / 2);
          const dy = clientY - (box.top + box.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          const reach = Math.min(1, distance / 260) * box.width * 0.5 * TRAVEL;
          mover.x((dx / distance) * reach);
          mover.y((dy / distance) * reach);
        }
      };

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const onMove = (event: PointerEvent) => look(event.clientX, event.clientY);
        window.addEventListener("pointermove", onMove, { passive: true });
        // Start by glancing up at the page.
        look(window.innerWidth / 2, 0);
        return () => window.removeEventListener("pointermove", onMove);
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={`relative select-none ${className}`}
      style={{ aspectRatio: geometry.aspect }}
      aria-hidden="true"
    >
      <Image
        src="/mascot/blank.webp"
        alt=""
        fill
        sizes="(min-width: 1024px) 460px, 280px"
        className="object-contain"
        loading="eager"
      />
      {geometry.eyes.map((eye) => (
        <span
          key={eye.x}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${eye.x * 100}%`, top: `${eye.y * 100}%`, width: `${eye.r * 200}%`, aspectRatio: "1" }}
        >
          <span data-pupil className="absolute rounded-full bg-black" style={{ inset: `${((1 - PUPIL) / 2) * 100}%` }}>
            <span className="absolute right-[16%] top-[14%] h-[26%] w-[26%] rounded-full bg-white" />
          </span>
        </span>
      ))}
    </div>
  );
}
