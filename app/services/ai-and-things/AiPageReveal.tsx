"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Page-wide entrance reveals.
 *
 * Nothing on this page is restructured to get them. The driver reads two
 * attributes off the markup — `data-reveal` for a single step and
 * `data-reveal-stagger` for a run of siblings — and animates whatever it finds,
 * section by section. That keeps the reveals additive: no wrapper elements are
 * introduced, so no layout can shift, and the sections that already own their
 * own scroll work (the stone reveal, the curved gallery, the lab showcase, the
 * phone marquee) simply carry no attributes and are never touched.
 *
 * The travel and the zoom ride on the `translate` and `scale` properties rather
 * than on `transform`, so a target that already owes its position to a transform
 * of its own — the lifted metric card, the tilted industry photographs — keeps
 * it untouched. See `[data-revealing]` in the stylesheet.
 *
 * `data-count` on an element counts its own number up from zero as the block
 * arrives.
 *
 * The hidden state is set from here rather than in CSS on purpose: if this
 * never runs — script blocked, hydration failed, reduced motion — every marked
 * element is simply left visible and the page reads normally. A CSS rule would
 * hide the copy with nothing left to bring it back.
 */

/** Where a section has to reach before its contents start arriving. */
const START = "top 82%";

const TRAVEL = 44;
const DURATION = 0.95;
const STAGGER = 0.11;
const EASE = "power3.out";

/*
 * Layout effect, not a plain one: the hidden state has to be written before the
 * browser paints the hydrated frame, or the copy shows at full opacity and then
 * snaps out to be animated in. `useEffect` on the server is the SSR-safe half —
 * this component renders null, so the pass is a no-op there.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function AiPageReveal({ root }: { root: string }) {
  useIsomorphicLayoutEffect(() => {
    const scope = document.querySelector<HTMLElement>(root);
    if (!scope) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Cleanups for the attribute the offset rule keys off — gsap.context reverts
       the inline styles it set, but not an attribute set by hand. */
    const settled: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const blocks = Array.from(
        scope.querySelectorAll<HTMLElement>("section, footer")
      );

      blocks.forEach((block) => {
        /*
         * Steps in document order. A `data-reveal-stagger` container is not a
         * step itself — it stands in for its children, so a grid of cards
         * arrives card by card rather than as one slab.
         */
        const marked = Array.from(
          block.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-stagger]")
        );
        const steps = marked.flatMap((el) =>
          el.hasAttribute("data-reveal-stagger")
            ? (Array.from(el.children) as HTMLElement[])
            : [el]
        );
        if (!steps.length) return;

        /*
         * Per-block tuning, read off the markup. A composed collage wants a
         * longer, slower assembly than a column of copy does, and saying so on
         * the container beats a second driver or a hardcoded exception here.
         */
        const tuned = marked.find((el) => el.hasAttribute("data-reveal-travel"));
        const travel = Number(tuned?.dataset.revealTravel) || TRAVEL;
        const step = Number(tuned?.dataset.revealStep) || STAGGER;
        const zoom = Number(tuned?.dataset.revealZoom) || 1;
        /* Degrees each piece settles through, alternating sides down the list so
           a collage lands as a scatter rather than as a rank. */
        const tilt = Number(tuned?.dataset.revealTilt) || 0;

        /*
         * The hero is already on screen when the page loads, so waiting for a
         * scroll would leave it sitting blank. It plays on arrival instead.
         */
        const onLoad = block.hasAttribute("data-reveal-onload");

        /*
         * Numbers that count up to themselves.
         *
         * The final value is read off the element's own text rather than passed
         * in, so the markup stays the source of truth and a copy change needs no
         * matching change here. Whatever is not a digit — a leading symbol, the
         * trailing "+" — is kept and put back around the running figure.
         */
        const counters = Array.from(
          block.querySelectorAll<HTMLElement>("[data-count]")
        ).flatMap((el) => {
          const parts = /^(\D*)([\d.,]+)(.*)$/.exec(el.textContent?.trim() ?? "");
          if (!parts) return [];
          const [, prefix, digits, suffix] = parts;
          const value = Number(digits.replace(/,/g, ""));
          if (!Number.isFinite(value)) return [];
          const decimals = digits.split(".")[1]?.length ?? 0;
          return [{ el, text: el.textContent ?? "", prefix, suffix, value, decimals }];
        });

        const settle = () => {
          steps.forEach((el) => {
            el.removeAttribute("data-revealing");
            el.style.removeProperty("--reveal-y");
            el.style.removeProperty("--reveal-scale");
            el.style.removeProperty("--reveal-rotate");
          });
          /* Land on the authored string, not on a re-formatted number: the
             tween's last frame can round to it without matching it exactly. */
          counters.forEach(({ el, text }) => {
            el.textContent = text;
          });
        };
        settled.push(settle);

        counters.forEach(({ el, prefix, suffix, decimals }) => {
          el.textContent = prefix + (0).toFixed(decimals) + suffix;
        });

        steps.forEach((el) => el.setAttribute("data-revealing", ""));
        gsap.set(steps, {
          opacity: 0,
          "--reveal-y": travel + "px",
          "--reveal-scale": zoom,
          "--reveal-rotate": (i: number) =>
            (i % 2 ? -tilt : tilt).toFixed(2) + "deg",
        });
        const timeline = gsap.timeline({
          delay: onLoad ? 0.15 : 0,
          ...(onLoad
            ? {}
            : {
                scrollTrigger: {
                  trigger: block,
                  start: START,
                  once: true,
                },
              }),
        });

        timeline.to(steps, {
          opacity: 1,
          "--reveal-y": "0px",
          "--reveal-scale": 1,
          "--reveal-rotate": "0deg",
          duration: DURATION,
          ease: EASE,
          stagger: step,
        });

        /*
         * Each figure runs while its own card is arriving — placed on the same
         * stagger as the steps — and takes longer than the card does, so it is
         * still climbing once the card has settled rather than finishing under
         * it. Started from the top of the timeline, so it counts as the section
         * appears rather than after it.
         */
        counters.forEach(({ el, prefix, suffix, value, decimals }, i) => {
          const running = { at: 0 };
          timeline.to(
            running,
            {
              at: value,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = prefix + running.at.toFixed(decimals) + suffix;
              },
            },
            i * step
          );
        });

        /* Drops the offset properties the moment they are no longer doing
           anything, handing the elements back to the stylesheet. */
        timeline.eventCallback("onComplete", settle);
      });
    }, scope);

    return () => {
      settled.forEach((settle) => settle());
      ctx.revert();
    };
  }, [root]);

  return null;
}
