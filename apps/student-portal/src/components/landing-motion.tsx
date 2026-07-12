"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      if (reduced) return;

      gsap.from("[data-hero]", {
        opacity: 0,
        y: 36,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>("[data-scale-media]").forEach((media) => {
        gsap.fromTo(
          media,
          { scale: 0.82, opacity: 0.35 },
          {
            keyframes: [
              { scale: 1, opacity: 1, duration: 0.55 },
              { scale: 1.04, opacity: 0.25, duration: 0.45 },
            ],
            ease: "none",
            scrollTrigger: {
              trigger: media,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      if (!desktop) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
      const last = cards.at(-1);
      if (!last) return;

      cards.slice(0, -1).forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top top+=104",
          endTrigger: last,
          end: "top top+=104",
          pin: true,
          pinSpacing: false,
        });

        gsap.to(card, {
          scale: 0.9 + index * 0.02,
          opacity: 0.28,
          ease: "none",
          scrollTrigger: {
            trigger: cards[index + 1],
            start: "top bottom",
            end: "top top+=104",
            scrub: true,
          },
        });
      });
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
