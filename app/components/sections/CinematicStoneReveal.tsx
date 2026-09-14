"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CinematicStoneReveal.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  /* Mobile browsers fire a resize every time the address bar slides away. Left
     alone, each one is a full refresh — every pin remeasured and the scroll
     position restored — in the middle of the scroll that caused it. */
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const DEFAULT_STONE = "/figma-assets/ai-things/before-logo-scratch-removebg-preview.png";
const DEFAULT_SLAB = "/figma-assets/ai-things/logo-scratch.png";
/* The cut-out edit, not before-logo-scratch.png itself: that one is fully
   opaque, so over the storm it read as a solid dark box behind the slab. */
const DEFAULT_BEFORE_SLAB =
  "/figma-assets/ai-things/before-logo-scratch-removebg-preview.png";
const DEFAULT_HEADLINE = ["A.I.", "DESIGN", "DEVELOPMENT", "BRANDING"];

/** The sky, replacing the drawn storm. Comes up as the ground turns black. */
const SKY_VIDEO = "/figma-assets/ai-things/videos/transforming-ai.mp4";

/**
 * The hand-drawn storm — cloud bank, light shafts, lightning. Off: the video
 * above is the sky now. Flip to true to bring the whole lot back over it.
 */
const DRAWN_STORM = false;

/**
 * The frame-wide haze: a plume thrown from the centre of the stage as the stone
 * lands, and again as the slab comes apart. Off — the only thing in the air is
 * what the cut throws off, and that comes from the chisel's own position. Flip
 * to true to put the plumes back.
 */
const AMBIENT_DUST = false;

/*
 * The engraved W, in `logo-scratch.png`'s own 453x424 pixel space.
 *
 * `CARVE_MASK` is the cut's real shape, lifted from the plate itself: the carve
 * is the darkest thing on the stone, so it can be thresholded straight out and
 * the mask is then the true form, ragged edges and all. Hand-traced strokes are
 * no substitute — at the width needed to cover the cut they merged into a blob.
 *
 * `CARVE_PATHS` no longer draw the mark. They are only the chisel's route, used
 * to decide how much of that shape has been opened; the shape mask clips them,
 * so they can be far wider than the groove without spilling.
 */
const CARVE_W = 453;
const CARVE_H = 424;
const CARVE_VIEWBOX = `0 0 ${CARVE_W} ${CARVE_H}`;
const CARVE_MASK = "/figma-assets/ai-things/logo-scratch-carve-mask.png";
const CARVE_PATHS = ["M120 140L178 245", "M222 140L285 238", "M330 150L308 205"];

/*
 * Beat map for the pinned sequence. The timeline runs on 100 abstract units and
 * scrubs against the scroll runway, so these read as percentages of the section.
 */
const BEAT = {
  /* The section opens light, with dark type on white. The boulder drops into
   * that white frame first and the ground turns underneath it as it falls — the
   * stone brings the dark with it rather than arriving after the lights go out. */
  copyIn: 2,
  approach: 12,
  invert: 26,
  shatter: 54,
  impact: 60,
  squash: 60,
  slab: 64,
  /*
   * The slab opening toward camera runs from `slab + 1` to here — thirty-five
   * beats, so the stone becomes the plate as a turn you can follow rather than
   * a flip.
   */
  engrave: 100,
  /*
   * The cut and the cards own forty-five beats between them.
   *
   * The runway grows by at least as many beats as this map gains, so widening a
   * window here only ever adds scroll to that window — it never speeds up what
   * comes before it.
   */
  hold: 145,
  dissolve: 148,
  end: 157,
} as const;


/*
 * The plates this bank is built from, matched to the hero clouds on the
 * real-estate banner (`HeroClouds`): the same three images, the same design
 * proportions, the same per-image edge fade and opacity. Each plate is cropped
 * hard on one or both sides, and the fade is what keeps that crop from reading
 * as a ruled cut once the drift blows the layer up.
 */
const CLOUD_PLATES = {
  one: {
    src: "/figma-assets/Cloud%201.png",
    ratio: "760 / 450",
    /* The same proportion as a plain number: `aspect-ratio` needs the pair,
       the centring maths needs something it can divide by. */
    ratioValue: "1.6889",
    peak: "0.9",
    mask: "linear-gradient(to right, #000 0%, #000 82%, transparent 100%)",
    maskY: "linear-gradient(#000, #000)",
  },
  two: {
    src: "/figma-assets/Cloud%202.png",
    ratio: "940 / 340",
    /* The same proportion as a plain number: `aspect-ratio` needs the pair,
       the centring maths needs something it can divide by. */
    ratioValue: "2.7647",
    peak: "0.8",
    mask: "linear-gradient(to right, transparent 0%, #000 16%, #000 100%)",
    maskY: "linear-gradient(#000, #000)",
  },
  three: {
    src: "/figma-assets/Cloud%203.png",
    ratio: "2280 / 520",
    /* The same proportion as a plain number: `aspect-ratio` needs the pair,
       the centring maths needs something it can divide by. */
    ratioValue: "4.3846",
    peak: "0.92",
    mask: "linear-gradient(to right, transparent 0%, #000 14%, #000 58%, transparent 100%)",
    /* Cloud 3 is the one plate cropped through its own base — the bottom row of
       pixels still carries alpha 215 — so it needs the fade on that edge too.
       The other two are clean top and bottom and pass through untouched. */
    maskY: "linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%)",
  },
} as const;

/*
 * The cloud bank.
 *
 * Two plates to a side — a pair down the left, a pair down the right, a pair
 * across the top and a pair across the bottom — rather than piled into the
 * corners. Each one sets out from its own edge and runs outward off it, so the
 * bank is always opening away from the middle and the centre of the frame is
 * left to the light.
 *
 * Each layer is paired with the strike nearest it and carries that strike's
 * period and offset in `flashDur`/`flashDelay`. A cloud rests a little under
 * its plate's real-estate opacity — plainly there, but holding something back —
 * and its own strike takes it all the way to full.
 *
 * `at` is the layer's centre; `from`/`to` are the translate endpoints of its
 * drift, and every layer also scales up along the way, which is what reads as
 * coming toward the camera. Negative delays start the cycle already in progress
 * so the bank is full on the first frame instead of building up from empty.
 */
const CLOUD_LAYERS = [
  /* left */
  { plate: CLOUD_PLATES.one, at: "6% 32%", from: "2vw, -1vh", to: "-22vw, -7vh", width: "32vw", duration: "34s", delay: "-2s", flashDur: "17s", flashDelay: "-3s" },
  { plate: CLOUD_PLATES.two, at: "8% 66%", from: "2vw, 1vh", to: "-21vw, 8vh", width: "30vw", duration: "46s", delay: "-9s", flashDur: "19s", flashDelay: "-6s" },
  /* right */
  { plate: CLOUD_PLATES.two, at: "94% 30%", from: "-2vw, -1vh", to: "22vw, -8vh", width: "31vw", duration: "37s", delay: "-14s", flashDur: "11s", flashDelay: "-8s" },
  { plate: CLOUD_PLATES.one, at: "92% 68%", from: "-2vw, 1vh", to: "21vw, 9vh", width: "29vw", duration: "52s", delay: "-33s", flashDur: "15s", flashDelay: "-11s" },
  /* top */
  { plate: CLOUD_PLATES.three, at: "32% 8%", from: "-1vw, 2vh", to: "-6vw, -19vh", width: "42vw", duration: "41s", delay: "-27s", flashDur: "9s", flashDelay: "-1s" },
  { plate: CLOUD_PLATES.three, at: "68% 10%", from: "1vw, 2vh", to: "7vw, -18vh", width: "40vw", duration: "39s", delay: "-6s", flashDur: "13s", flashDelay: "-5s" },
  /* bottom */
  { plate: CLOUD_PLATES.three, at: "30% 92%", from: "-1vw, -2vh", to: "-7vw, 20vh", width: "44vw", duration: "44s", delay: "-20s", flashDur: "23s", flashDelay: "-14s" },
  { plate: CLOUD_PLATES.one, at: "70% 90%", from: "1vw, -2vh", to: "8vw, 19vh", width: "38vw", duration: "49s", delay: "-38s", flashDur: "21s", flashDelay: "-17s" },
];

/*
 * The cards that arrive around the cut.
 *
 * One to each corner of the frame, ringing the slab rather than crowding it —
 * the stone keeps the middle at the size it has always been drawn. Each card
 * flies in out of the corner it settles into, in the order the sequence calls
 * them: top right, bottom right, top left, bottom left.
 *
 * The right-hand pair are anchored from the right edge and the left-hand pair
 * from the left, so the ring holds its shape on any width instead of drifting
 * in toward the stone on a narrow frame.
 */
const CARD_MARK = "/figma-assets/web-banner-card-icon.svg";

type StoneCard = { title: string; body: string };

const DEFAULT_CARDS: StoneCard[] = [
  {
    title: "AI agents & automation",
    body: "We build agents that answer customers, reach into your systems and take the routine work off the team.",
  },
  {
    title: "Conversational AI",
    body: "Assistants that hold a natural conversation across your site, your inbox and the tools you already run.",
  },
  {
    title: "AI strategy & consulting",
    body: "We find where AI actually pays for itself, and scope it, before a line of it gets built.",
  },
  {
    title: "Workflow intelligence",
    body: "Approvals, reporting and handoffs — the work that quietly eats the week — handled end to end.",
  },
];

const CARD_SLOTS: {
  left?: string;
  right?: string;
  top: string;
  from: string;
}[] = [
  { right: "5%", top: "13%", from: "48vw, -32vh" },
  { right: "6%", top: "70%", from: "46vw, 34vh" },
  { left: "6%", top: "13%", from: "-48vw, -32vh" },
  { left: "2%", top: "72%", from: "-46vw, 36vh" },
];

/*
 * Where the lightning fires from. Eight origins ringing the frame rather than
 * one or two fixed spots, each on its own odd-numbered loop so strikes never
 * fall into step: something is nearly always firing, but with real gaps between
 * bursts rather than a metronome. Size and peak double as distance — the small
 * dim ones read as far off, the wide bright ones as overhead.
 */
const STORM_STRIKES = [
  { at: "18% 16%", size: "52% 38%", peak: "0.56", duration: "9s", delay: "-1s" },
  { at: "50% 10%", size: "64% 42%", peak: "0.48", duration: "13s", delay: "-5s" },
  { at: "84% 18%", size: "48% 34%", peak: "0.59", duration: "11s", delay: "-8s" },
  { at: "8% 48%", size: "44% 46%", peak: "0.41", duration: "17s", delay: "-3s" },
  { at: "92% 52%", size: "46% 48%", peak: "0.44", duration: "15s", delay: "-11s" },
  { at: "20% 86%", size: "56% 40%", peak: "0.33", duration: "19s", delay: "-6s" },
  { at: "52% 92%", size: "62% 38%", peak: "0.30", duration: "23s", delay: "-14s" },
  { at: "82% 84%", size: "50% 36%", peak: "0.37", duration: "21s", delay: "-17s" },
];

/*
 * Lightning geometry.
 *
 * A real channel is a midpoint-displaced line, not a regular zig-zag: each
 * subdivision pushes the middle of a span sideways by a fraction of that span
 * and the fraction shrinks on the way down, which is what gives a bolt its long
 * smooth sweeps broken by sharp kinks. Branches fork off the channel partway and
 * die out well before the ground. The whole thing is generated from a seeded
 * PRNG at module scope, so the server and the browser draw the same bolt and
 * hydration matches — `Math.random` here would not.
 */
const BOLT_W = 120;
const BOLT_H = 400;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type BoltPoint = [number, number];

function displace(
  rand: () => number,
  a: BoltPoint,
  b: BoltPoint,
  depth: number,
  offset: number
): BoltPoint[] {
  if (depth === 0) return [a, b];
  const mid: BoltPoint = [
    (a[0] + b[0]) / 2 + (rand() - 0.5) * offset,
    // Barely any displacement along the fall: a channel wanders sideways, it
    // does not double back on itself vertically.
    (a[1] + b[1]) / 2 + (rand() - 0.5) * offset * 0.2,
  ];
  const head = displace(rand, a, mid, depth - 1, offset * 0.58);
  const tail = displace(rand, mid, b, depth - 1, offset * 0.58);
  return [...head.slice(0, -1), ...tail];
}

function boltPath(points: BoltPoint[]) {
  return points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
}

function buildBolt(seed: number) {
  const rand = mulberry32(seed);
  const start: BoltPoint = [BOLT_W / 2 + (rand() - 0.5) * 16, 0];
  const end: BoltPoint = [BOLT_W / 2 + (rand() - 0.5) * 56, BOLT_H];
  const channel = displace(rand, start, end, 6, BOLT_W * 0.44);

  const branches: string[] = [];
  const forks = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < forks; i += 1) {
    const from = channel[Math.floor(channel.length * (0.2 + rand() * 0.5))];
    const away = rand() < 0.5 ? -1 : 1;
    const to: BoltPoint = [
      from[0] + away * (16 + rand() * 32),
      Math.min(BOLT_H, from[1] + (0.14 + rand() * 0.2) * BOLT_H),
    ];
    branches.push(boltPath(displace(rand, from, to, 4, BOLT_W * 0.26)));
  }

  return { channel: boltPath(channel), branches };
}

/*
 * Four channels, each paired with one of the sky blooms above — same period and
 * same offset, so the bolt and the light it throws fire together instead of
 * reading as two unrelated effects. `flip` mirrors a couple of them so the set
 * does not lean the same way.
 */
const STORM_BOLTS = [
  { seed: 0x51ed2f, at: "18%", top: "-9%", height: "74%", flip: 1, duration: "9s", delay: "-1s" },
  { seed: 0x2a7cb1, at: "50%", top: "-12%", height: "88%", flip: -1, duration: "13s", delay: "-5s" },
  { seed: 0x9f3d40, at: "84%", top: "-8%", height: "68%", flip: 1, duration: "11s", delay: "-8s" },
  { seed: 0xc10b93, at: "92%", top: "-6%", height: "58%", flip: -1, duration: "15s", delay: "-11s" },
].map((bolt) => ({ ...bolt, geometry: buildBolt(bolt.seed) }));

/** Dust budget per breakpoint — the canvas never allocates past this. */
const MOTE_BUDGET = { desktop: 210, tablet: 130, mobile: 64 };
/*
 * The dust loop is driven by the scrub's progress, which is a 0-1 fraction of
 * the whole timeline, while everything else in this file is written in beats.
 * Every window in that loop is converted through here, so re-timing the beat
 * map above moves the emission windows with it rather than leaving them behind
 * on fractions that used to line up.
 */
const beatPhase = (beat: number) => beat / BEAT.end;

/*
 * The cut tween, as numbers rather than inline expressions: the debris needs to
 * know when each stroke finishes as precisely as the timeline does.
 */
const CUT_DURATION = (BEAT.hold - BEAT.engrave) * 0.46;
const CUT_STAGGER = (BEAT.hold - BEAT.engrave) * 0.27;

/*
 * Grain tuning, all in path units — the same units the chisel's head is
 * measured in, which is what makes the whole spray a function of the head and
 * nothing else. `REACH` is how far the tool travels on past a grain before that
 * grain is done: dust hangs around longer than chips do.
 */
const GRAIN_STEP = { desktop: 2.2, tablet: 3.2, mobile: 4.6 };
const CHIP_REACH = 26;
const DUST_REACH = 46;
/* Once a stroke is finished its head stops moving, so it is carried on past the
   end of the path at this many path units per unit of timeline progress —
   enough to clear the longest reach in about four hundredths of the scroll. */
const GRAIN_OVERRUN = DUST_REACH / beatPhase(4.5);

/*
 * One piece of material coming off the cut — a chip of stone or a puff of the
 * dust it powders into.
 *
 * Nothing here is a simulation state. A grain is a fixed recipe pinned to a
 * point on the chisel's route: where it sits (`px`/`py` and the route's tangent
 * there, both in the plate's own 453x424 space), which way it is thrown, how
 * far, and how hard it drops. Its whole flight is read from one number at draw
 * time — how far the tool has moved on past it — so the same scroll position
 * always produces the same frame, forwards or backwards.
 */
type Grain = {
  s: number;
  px: number;
  py: number;
  tx: number;
  ty: number;
  fanCos: number;
  fanSin: number;
  /** Throw and drop, as fractions of the stage height. */
  travel: number;
  fall: number;
  size: number;
  angle: number;
  spin: number;
  alpha: number;
  warm: boolean;
};

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  life: number;
  max: number;
  warm: boolean;
};

/**
 * A pre-rendered turntable of the boulder, laid out as one sprite sheet.
 *
 * This is what makes the rock read as a solid rather than a rotating photo: a
 * flat image can only foreshorten its one silhouette, where a turntable gives a
 * genuinely different outline and different lit faces at every step.
 *
 * Asset spec: one full revolution, frames left to right then top to bottom,
 * every cell the same size with the rock framed identically and centred, on a
 * transparent background. 36 frames (10 degree steps) is plenty; WebP keeps a
 * 6x6 sheet under a megabyte where PNG will not.
 */
export type StoneTurntable = {
  src: string;
  columns: number;
  rows: number;
  /** Defaults to columns * rows. Set it when trailing cells are padding. */
  frames?: number;
  /** Revolutions across the fall. Defaults to one. */
  turns?: number;
};

export type CinematicStoneRevealProps = {
  /** Rough stone used for the floating boulder. Its texture carries the morph. */
  stoneSrc?: string;
  /**
   * Turntable sheet. When set it replaces `stoneSrc` for the falling boulder.
   * Hoist it to a module constant rather than passing an object literal — it is
   * an effect dependency, so a fresh object each render rebuilds the trigger.
   */
  stoneTurntable?: StoneTurntable;
  /** Carved slab. Only ever shown inside the W strokes, as the cut opens. */
  slabSrc?: string;
  /** The same slab before it was cut. This is the plate you actually see. */
  beforeSlabSrc?: string;
  /** Small label above the stage. Off unless set. */
  eyebrow?: string;
  /** Lines that shatter when the boulder passes through. Pass [] to omit. */
  headline?: string[];
  /** Standfirst in the lower corner. Off unless set. */
  caption?: string;
  /** Scroll distance the pinned sequence spans, in vh, on top of the 100vh stage. */
  scrollRunway?: number;
  /** Copy for the four cards that fly in around the cut. Four entries expected. */
  cards?: StoneCard[];
  className?: string;
};

/**
 * Cinematic bridge between the hero and the gallery: a boulder falls toward the
 * camera, flattens into a slab, the engraved mark is chiselled out of it by a
 * raking light, then the whole thing disintegrates and the camera pulls back.
 *
 * Self-contained — it owns its own stage, fog, dust canvas and scroll trigger,
 * and touches nothing above or below it on the page.
 */
export default function CinematicStoneReveal({
  stoneSrc = DEFAULT_STONE,
  stoneTurntable,
  slabSrc = DEFAULT_SLAB,
  beforeSlabSrc = DEFAULT_BEFORE_SLAB,
  eyebrow = "",
  headline = DEFAULT_HEADLINE,
  caption = "",
  scrollRunway = 816,
  cards = DEFAULT_CARDS,
  className,
}: CinematicStoneRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skyVideoRef = useRef<HTMLVideoElement>(null);

  /* Keyed on the joined lines, not the array, so an inline `headline` prop does
   * not tear down and rebuild the ScrollTrigger on every render. */
  const headlineKey = headline.join(" ");

  /* Stable per-instance ids for the SVG mask and filter. useId embeds colons,
     which are legal in an id but awkward inside url(#...), so they are dropped. */
  const uid = useId().replace(/:/g, "");
  const maskId = "cs-cut-" + uid;
  const shapeId = "cs-shape-" + uid;

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const pick = (name: string) =>
      stage.querySelector<HTMLElement>('[data-cs="' + name + '"]');

    const world = pick("world");
    const stone = pick("stone");
    const slab = pick("slab");
    const headlineEl = pick("headline");
    const captionEl = pick("caption");
    const eyebrowEl = pick("eyebrow");
    if (!world || !stone || !slab) return;

    const letters = gsap.utils.toArray<HTMLElement>("[data-cs-letter]", stage);
    const cutStrokes = gsap.utils.toArray<SVGPathElement>("[data-cs-scratch]", stage);
    const cardEls = gsap.utils.toArray<HTMLElement>("[data-cs-card]", stage);

    /*
     * Every soft-edged effect is a CSS custom property on the stage rather than
     * a per-element tween: one write pass per frame drives the ground, the fog
     * and the dissolve together, and the stylesheet decides what each means.
     */
    const fx = {
      dark: 0,
      fog: 0,
      flash: 0,
      erode: 0,
      bloom: 0,
    };

    /*
     * The sky video is started by the inversion, not on mount: it runs at its
     * own rate rather than being scrubbed, so starting it early would mean the
     * ground turns black onto whatever frame it happened to have reached. Held
     * at its first frame until `--dark` moves, and parked back there if the
     * section is scrolled off the top.
     */
    const skyVideo = skyVideoRef.current;
    const syncSkyVideo = () => {
      if (!skyVideo) return;
      if (fx.dark > 0.01) {
        if (skyVideo.paused) {
          /* Autoplay is only allowed because it is muted; if a browser refuses
             anyway the layer just holds its poster frame. */
          void skyVideo.play().catch(() => {});
        }
        return;
      }
      if (!skyVideo.paused) skyVideo.pause();
      skyVideo.currentTime = 0;
    };

    const applyFx = () => {
      for (const [key, value] of Object.entries(fx)) {
        stage.style.setProperty("--" + key, String(Math.round(value * 1000) / 1000));
      }
      syncSkyVideo();
    };
    applyFx();


    /* ---------------------------------------------------------------- dust */

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;
    const motes: Mote[] = [];
    const view = { w: 0, h: 0, dpr: 1 };
    let budget = MOTE_BUDGET.desktop;
    let grainStep = GRAIN_STEP.desktop;
    let dustPhase = 0;
    let inView = false;
    let sprites: HTMLCanvasElement[] = [];

    const makeSprite = (inner: string, outer: string) => {
      const sprite = document.createElement("canvas");
      sprite.width = 64;
      sprite.height = 64;
      const sctx = sprite.getContext("2d");
      if (sctx) {
        const gradient = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, inner);
        gradient.addColorStop(0.45, outer);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        sctx.fillStyle = gradient;
        sctx.fillRect(0, 0, 64, 64);
      }
      return sprite;
    };

    const resizeCanvas = () => {
      if (!canvas || !ctx) return;
      const rect = stage.getBoundingClientRect();
      view.dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.w = rect.width;
      view.h = rect.height;
      canvas.width = Math.max(1, Math.round(view.w * view.dpr));
      canvas.height = Math.max(1, Math.round(view.h * view.dpr));
      canvas.style.width = view.w + "px";
      canvas.style.height = view.h + "px";
      ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    };

    const spawn = (count: number, spread: number, speed: number, lift: number) => {
      const cx = view.w / 2;
      const cy = view.h / 2;
      for (let i = 0; i < count && motes.length < budget; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const reach = Math.pow(Math.random(), 0.6) * spread;
        motes.push({
          x: cx + Math.cos(angle) * reach,
          y: cy + Math.sin(angle) * reach * 0.62,
          vx: Math.cos(angle) * speed * (0.4 + Math.random()),
          vy: Math.sin(angle) * speed * 0.5 - lift * (0.4 + Math.random()),
          r: 3 + Math.random() * 16,
          alpha: 0.05 + Math.random() * 0.16,
          life: 0,
          max: 900 + Math.random() * 1600,
          warm: Math.random() > 0.42,
        });
      }
    };

    /*
     * Debris off the cut.
     *
     * The haze above is atmosphere. This is the stone itself coming away: chips
     * thrown backwards out of the groove and the dust they powder into, hanging
     * off the cut and sinking. Matte, never additive for the chips — the moment
     * debris lights up it stops reading as rock.
     *
     * The whole spray is a pure function of the chisel's position. Grains are
     * pinned to fixed points along the route and their flight is read from
     * `head - s`, how far the tool has moved on past them, so scrubbing back up
     * the page walks every grain back down its own arc and into the groove it
     * came out of. A stepped particle sim cannot do that: it only knows the
     * direction it was last advanced in, so reversing it sprays forwards again.
     */
    const grains = new Map<SVGPathElement, { chips: Grain[]; dust: Grain[] }>();

    const buildGrains = (path: SVGPathElement, total: number) => {
      const cached = grains.get(path);
      if (cached) return cached;

      /* Seeded off the path's own geometry: the same stroke always sheds the
         same spray, on the server, on reload and after a resize. */
      const rand = mulberry32(Math.round(total * 997) ^ 0x9e3779b9);
      const chips: Grain[] = [];
      const dust: Grain[] = [];

      for (let s = 0; s <= total; s += grainStep) {
        const at = path.getPointAtLength(s);
        const behind = path.getPointAtLength(Math.max(0, s - 4));
        const tx = at.x - behind.x;
        const ty = at.y - behind.y;

        const seat = (fan: number) => ({
          s,
          px: at.x,
          py: at.y,
          tx,
          ty,
          fanCos: Math.cos(fan),
          fanSin: Math.sin(fan),
        });

        /* Chips: thrown hard, fanned across most of a half circle, and heavy. */
        const shards = 2 + Math.floor(rand() * 3);
        for (let i = 0; i < shards; i += 1) {
          chips.push({
            ...seat((rand() - 0.5) * 2.3),
            travel: 0.035 + rand() * 0.08,
            fall: 0.11 + rand() * 0.14,
            size: 0.0016 + rand() * 0.0034,
            angle: rand() * Math.PI,
            spin: (rand() - 0.5) * 6,
            alpha: 0.5 + rand() * 0.45,
            warm: rand() > 0.4,
          });
        }

        /* Dust: barely thrown at all. It lifts off the groove, spreads, and
           sinks — a powder falling, not a cloud billowing up. */
        const puffs = 1 + Math.floor(rand() * 2);
        for (let i = 0; i < puffs; i += 1) {
          dust.push({
            ...seat((rand() - 0.5) * 3),
            travel: 0.012 + rand() * 0.05,
            fall: 0.03 + rand() * 0.07,
            size: 0.006 + rand() * 0.018,
            angle: 0,
            spin: 0,
            alpha: 0.05 + rand() * 0.11,
            warm: rand() > 0.35,
          });
        }
      }

      const built = { chips, dust };
      grains.set(path, built);
      return built;
    };

    const drawCutDebris = (phase: number) => {
      if (!ctx) return;
      const scratchSvg = stage.querySelector<SVGSVGElement>(
        "[data-cs-scratch-svg]"
      );
      if (!scratchSvg || !cutStrokes.length) return;

      const svgRect = scratchSvg.getBoundingClientRect();
      if (svgRect.width < 1 || svgRect.height < 1) return;
      const stageRect = stage.getBoundingClientRect();
      /* preserveAspectRatio is none, so the viewBox maps onto the box as a plain
         stretch — no CTM needed, and unlike getScreenCTM this survives the CSS
         transforms the slab is carried on. */
      const sx = svgRect.width / CARVE_W;
      const sy = svgRect.height / CARVE_H;
      const ox = svgRect.left - stageRect.left;
      const oy = svgRect.top - stageRect.top;
      /* Grain sizes and throws are fractions of the plate's own height, so the
         spray stays in proportion to the stone whatever size it is drawn at. */
      const plateScale = svgRect.height * 2.1;

      const paint = (
        grain: Grain,
        head: number,
        reach: number,
        chip: boolean
      ) => {
        const age = head - grain.s;
        if (age <= 0 || age >= reach) return;
        const u = age / reach;

        /* Straight back down the groove, turned by the grain's own fan. */
        let bx = -grain.tx * sx;
        let by = -grain.ty * sy;
        const run = Math.hypot(bx, by) || 1;
        bx /= run;
        by /= run;
        const dx = bx * grain.fanCos - by * grain.fanSin;
        const dy = bx * grain.fanSin + by * grain.fanCos;

        const throwBy = grain.travel * plateScale * u;
        const x = ox + grain.px * sx + dx * throwBy;
        /* Linear out, quadratic down: the arc is the fall, not an eased tween. */
        const y =
          oy + grain.py * sy + dy * throwBy + grain.fall * plateScale * u * u;
        if (y - 40 > view.h) return;

        const fade = u < 0.55 ? Math.min(1, u / 0.06) : 1 - (u - 0.55) / 0.45;
        ctx.globalAlpha = grain.alpha * fade * fx.dark;

        if (!chip) {
          const size = grain.size * plateScale * (1 + u * 1.7);
          ctx.drawImage(
            sprites[grain.warm ? 0 : 1],
            x - size,
            y - size,
            size * 2,
            size * 2
          );
          return;
        }

        const size = grain.size * plateScale;
        ctx.fillStyle = grain.warm ? "rgb(214, 196, 166)" : "rgb(166, 179, 199)";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(grain.angle + grain.spin * u);
        /* Oblong rather than square, so a tumbling chip catches the eye as it
           turns edge-on and back. */
        ctx.fillRect(-size / 2, -size * 0.28, size, size * 0.56);
        ctx.restore();
      };

      cutStrokes.forEach((path, index) => {
        const total = path.getTotalLength();
        const offset = Number.parseFloat(
          path.style.strokeDashoffset ||
            window.getComputedStyle(path).strokeDashoffset
        );
        if (!Number.isFinite(offset)) return;

        /*
         * The dash exposes the path from its start up to `total - offset`, so
         * that is where the tool has reached — and it stops dead there once the
         * stroke completes. A spray keyed to a number that has stopped moving
         * would freeze in mid-air, so past the end of its own tween the head is
         * carried on off the end of the path and the last grains finish their
         * arcs (and, scrubbed back, un-finish them).
         */
        const done = beatPhase(
          BEAT.engrave + index * CUT_STAGGER + CUT_DURATION
        );
        const head =
          total - offset + Math.max(0, phase - done) * GRAIN_OVERRUN;
        if (head <= 0) return;

        const { chips, dust } = buildGrains(path, total);

        /* Dust is light in the air and adds; chips are rock and occlude. */
        ctx.globalCompositeOperation = "lighter";
        for (const grain of dust) paint(grain, head, DUST_REACH, false);
        ctx.globalCompositeOperation = "source-over";
        for (const grain of chips) paint(grain, head, CHIP_REACH, true);
      });

      ctx.globalAlpha = 1;
    };

    let lastFrame = 0;
    const drawDust = (time: number) => {
      if (!canvas || !ctx) return;
      const now = time * 1000;
      const dt = lastFrame ? Math.min(now - lastFrame, 48) : 16;
      lastFrame = now;
      if (!inView) return;

      /*
       * Emission is read off the scrub position rather than fired from timeline
       * callbacks, so scrubbing backwards produces the same plume as scrubbing
       * forwards instead of double-firing a burst.
       */
      const phase = dustPhase;

      /*
       * Only ever thrown by something happening: the boulder landing, the cut
       * being worked, and the slab coming apart. There is deliberately no idle
       * emission — a floor rate kept topping the frame up with drifting specks
       * whatever the sequence was doing, and additive motes hanging in an empty
       * sky read as glinting stars rather than as anything the stone did.
       */
      /*
       * This emitter throws from the centre of the stage with a spread most of
       * the frame wide — right for a boulder hitting the ground, wrong for
       * anything that has a position of its own. Nothing in the sequence wants
       * it now: the cut's chips and its dust are both thrown from the chisel,
       * so the powder and the shards come off together and in the same place.
       */
      if (AMBIENT_DUST) {
        const plumeIn = beatPhase(BEAT.shatter + 1);
        const plumeOut = beatPhase(BEAT.engrave - 2);
        const plumePeak = (plumeIn + plumeOut) / 2;

        let rate = 0;
        if (phase > plumeIn && phase < plumeOut) {
          rate = 9 * (1 - Math.abs(phase - plumePeak) / (plumePeak - plumeIn));
        } else if (phase >= beatPhase(BEAT.dissolve)) {
          rate =
            7 * Math.min(1, (phase - beatPhase(BEAT.dissolve)) / beatPhase(5));
        }

        if (rate > 0) {
          const impact = phase < beatPhase(BEAT.engrave - 1);
          spawn(
            Math.round(rate * (dt / 16)),
            impact ? view.h * 0.2 : view.h * 0.26,
            impact ? 0.09 : 0.035,
            impact ? 0.02 : 0.055
          );
        }
      }

      ctx.clearRect(0, 0, view.w, view.h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = motes.length - 1; i >= 0; i -= 1) {
        const mote = motes[i];
        mote.life += dt;
        if (mote.life >= mote.max) {
          motes.splice(i, 1);
          continue;
        }
        mote.x += mote.vx * dt;
        mote.y += mote.vy * dt;
        mote.vy -= 0.000012 * dt;
        mote.vx *= 0.999;
        const t = mote.life / mote.max;
        const size = mote.r * (1 + t * 1.5);
        /* Scaled by --dark as well as the fog, so no dust hangs in the frame
           while the section is still on its white ground. */
        ctx.globalAlpha =
          mote.alpha * Math.sin(Math.PI * t) * (0.35 + fx.fog * 0.65) * fx.dark;
        ctx.drawImage(
          sprites[mote.warm ? 0 : 1],
          mote.x - size,
          mote.y - size,
          size * 2,
          size * 2
        );
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      /* Everything the cut throws off, drawn from the chisel's position rather
         than stepped — see `drawCutDebris`. Kept to the cut's own window so the
         two layout reads it needs are not paid for on every frame of the fall. */
      if (
        phase > beatPhase(BEAT.engrave - 2) &&
        phase < beatPhase(BEAT.hold + 8)
      ) {
        drawCutDebris(phase);
      }
      ctx.globalAlpha = 1;
    };

    /* ------------------------------------------------------------ sequence */

    const mm = gsap.matchMedia();
    let resizeObserver: ResizeObserver | null = null;
    let tickerAdded = false;

    mm.add(
      {
        isMobile: "(max-width: 767.98px)",
        isTablet: "(min-width: 768px) and (max-width: 1023.98px)",
        isDesktop: "(min-width: 1024px)",
        isReduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const conditions = context.conditions as Record<string, boolean>;
        const { isMobile, isTablet, isReduced } = conditions;

        grainStep = isMobile
          ? GRAIN_STEP.mobile
          : isTablet
            ? GRAIN_STEP.tablet
            : GRAIN_STEP.desktop;
        /* Recipes are built against the step, so a breakpoint change throws the
           old ones away rather than leaving a denser spray behind. */
        grains.clear();
        budget = isMobile
          ? MOTE_BUDGET.mobile
          : isTablet
            ? MOTE_BUDGET.tablet
            : MOTE_BUDGET.desktop;

        /*
         * Reduced motion still gets the picture, just not the ride: the slab
         * sits in its settled, fully engraved state and nothing scrubs.
         */
        if (isReduced) {
          Object.assign(fx, {
            dark: 1,
            fog: 0.7,
            flash: 0,
            erode: 0,
            bloom: 0.3,
          });
          applyFx();
          /* Held on its first frame — the picture, not the ride. */
          if (skyVideo) skyVideo.pause();
          gsap.set([stone, headlineEl].filter(Boolean), { autoAlpha: 0 });
          /* The settled pose the sequence ends on: slab as it always sat, with
             the cards already in their slots around it. */
          gsap.set(slab, { autoAlpha: 1, scale: 1, x: 0, y: 0, rotate: 0 });
          gsap.set(cutStrokes, { strokeDashoffset: 0 });
          gsap.set(cardEls, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0 });
          return;
        }

        const runway = isMobile
          ? Math.min(scrollRunway, 566)
          : isTablet
            ? Math.min(scrollRunway, 674)
            : scrollRunway;

        /*
         * The full turn goes in the plane of the screen (rotate/Z), where a
         * billboard can spin freely. The tip-and-turn on X and Y is bounded by
         * `SWING` below, and the highlight sweeping across the surface is what
         * sells the whole thing as depth rather than a rotating cut-out.
         */
        const SPIN = 360;
        /*
         * X and Y only rock; they do not revolve.
         *
         * A full turn on either reads as a flat card flipping, because it is
         * one: the asset is a photograph of a single face, so tipping it can
         * only foreshorten the same silhouette down to a sliver and back. The
         * reference gets away with a true tumble because it is a 3D model whose
         * outline genuinely changes with every degree. Until there is a
         * turntable sequence or a mesh to work from, the honest maximum is a
         * ~30 degree rock, where the stone still reads as a solid.
         */
        const SWING = isMobile ? 0.6 : 1;
        const swingX = [-20, 26, -22, 12, 0].map((v) => v * SWING);
        const swingY = [24, -12, 30, -18, 0].map((v) => v * SWING);

        /*
         * The boulder falls, it does not dolly in: no z travel, so it reads as
         * dropping through the frame from above rather than flying at the
         * camera out of the distance. The growth on the way down is scale alone.
         *
         * It starts wholly outside the stage — the stage clips, so it is hidden
         * without needing an opacity fade. Fading it up inside the frame is what
         * made it read as materialising in place instead of arriving from above.
         */
        /*
         * yPercent is relative to the rock's own height, and that height ranges
         * from ~180px on a phone to ~320px at 1920 — so no single percentage
         * clears the top edge everywhere. Derive it from the stage instead, as a
         * function value: `invalidateOnRefresh` re-evaluates it on resize.
         */
        const START_SCALE = 0.7;
        const startYPercent = () => {
          const h = stone.offsetHeight || 1;
          const stageH = stage.offsetHeight || window.innerHeight;
          return -((stageH / 2 + (h * START_SCALE) / 2 + 40) / h) * 100;
        };

        gsap.set(stone, {
          autoAlpha: 1,
          scale: START_SCALE,
          rotate: -SPIN,
          /* A turntable already contains the tumble; tipping the sprite on top
             of it would double up and foreshorten frames that are already correct. */
          rotationX: stoneTurntable ? 0 : swingX[0],
          rotationY: stoneTurntable ? 0 : swingY[0],
          /* Sharp for the whole fall. The explicit 0 is kept rather than left
             unset so the squash later has a numeric filter to tween from. */
          filter: "blur(0px)",
          transformOrigin: "50% 50%",
        });
        /*
         * The pose both objects meet in. Tipped steeply away from camera and
         * turned in plane, this is where the rock hands over to the slab: both
         * are the same foreshortened wedge, so the swap has no silhouette to
         * give it away.
         *
         * 74, not 84. The reference holds a wedge roughly 30% of its height at
         * this point — a real slab has thickness. Pushing it nearer 90 collapses
         * a flat PNG to a needle, which is thinner than any stone would be.
         */
        const EDGE_POSE = { rotationX: 74, rotate: 42, scale: 1.3 };

        gsap.set(slab, {
          autoAlpha: 0,
          ...EDGE_POSE,
          y: 0,
          filter: "blur(0px)",
          transformOrigin: "50% 50%",
        });
        gsap.set(letters, { filter: "blur(0px)" });
        cutStrokes.forEach((path) => {
          /*
           * The offset has to clear the dash boundary, not just sit on it.
           *
           * With offset exactly equal to dasharray, path position zero lands on
           * the seam between the on and off segments, and a round cap still
           * paints the tail of the invisible dash right there — which left three
           * nicks already cut into the slab before any stroke had moved. Pushing
           * the offset a cap-radius further puts that seam off the path entirely.
           */
          /*
           * Two values, not one. A single-value dasharray is a repeating
           * pattern of period 2L, so offsetting the path out of the first dash
           * only walks it into the next one: the tail of the stroke landed back
           * inside an "on" segment and its round cap painted a blob at the far
           * end of every cut, visible long before the chisel got there.
           *
           * An explicit gap this much longer than the path means the pattern
           * cannot wrap back onto it at any offset we animate through.
           */
          const length = path.getTotalLength();
          const CAP = 70;
          gsap.set(path, {
            strokeDasharray: length + " " + (length * 4 + 400),
            strokeDashoffset: length + CAP,
          });
        });

        /*
         * Sprite stepping, not canvas: setting background-position on a grid
         * whose background-size is a multiple of the box is GPU-composited and
         * costs nothing per frame, and one sheet is one request with no chance
         * of a half-loaded sequence popping mid-fall.
         */
        const sprite = pick("stone-sprite");
        const applyTurntable = () => {
          if (!sprite || !stoneTurntable) return;
          const { columns, rows } = stoneTurntable;
          const total = stoneTurntable.frames ?? columns * rows;
          const span = BEAT.impact - BEAT.approach;
          const fall = gsap.utils.clamp(
            0,
            1,
            (timeline.time() - BEAT.approach) / span
          );
          const step = Math.floor(fall * (stoneTurntable.turns ?? 1) * total);
          const frame = ((step % total) + total) % total;
          const col = frame % columns;
          const row = Math.floor(frame / columns);
          sprite.style.backgroundPosition =
            (columns > 1 ? (col / (columns - 1)) * 100 : 0) +
            "% " +
            (rows > 1 ? (row / (rows - 1)) * 100 : 0) +
            "%";
        };

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => {
            applyFx();
            applyTurntable();
            dustPhase = timeline.progress();
          },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + window.innerHeight * (runway / 100),
            pin: stage,
            pinSpacing: true,
            /*
             * Seconds the timeline takes to catch up to the scroll.
             *
             * Kept modest on purpose. Lenis already eases the scroll position
             * itself over about 1.2s, so this is the second stage of smoothing
             * rather than the only one, and the two compound. A long scrub on
             * top left the sequence trailing seconds behind the page and still
             * moving well after the wheel had stopped, which reads as drift
             * rather than as smoothness.
             */
            scrub: isMobile ? 0.8 : 1.2,
            /*
             * Refreshes before the lab showcase further down the page, which
             * pins too. Pinned triggers have to be measured in document order:
             * this one inserts several viewports of pin spacing, and anything
             * measured before that spacing exists lands on a start and end that
             * are wrong the moment it appears.
             */
            refreshPriority: 2,
            /*
             * No `anticipatePin`. It pins ahead of the real scroll position
             * based on velocity, which earns its keep when the browser scrolls
             * in raw jumps and is exactly the wrong thing on top of Lenis,
             * whose position is already eased and continuous: the pin engages
             * somewhere the scroll has not reached yet, and the page snaps to
             * meet it.
             */
            invalidateOnRefresh: true,
            onToggle: (self) => {
              inView = self.isActive;
              if (!inView && ctx) ctx.clearRect(0, 0, view.w, view.h);
            },
          },
        });

        /* 1 — on white: the copy settles first, dark type on a light ground. */
        if (headlineEl) {
          timeline.fromTo(
            headlineEl,
            { autoAlpha: 0, y: 46, filter: "blur(18px)" },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 13,
              ease: "power2.out",
            },
            BEAT.copyIn
          );
        }
        const legend = [eyebrowEl, captionEl].filter(Boolean) as HTMLElement[];
        if (legend.length) {
          timeline.fromTo(
            legend,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 11, ease: "power2.out" },
            BEAT.copyIn
          );
        }

        /*
         * 2 — the boulder drops into the white frame, tumbling.
         *
         * Linear, deliberately. An eased-in fall starts from rest, which spends
         * most of its travel still above the top edge and never shows the
         * entrance; this rock is already falling when it reaches us, so it
         * crosses into shot in proportion to the scroll. The scale and spin
         * carry the drama instead.
         */
        const fallSpan = BEAT.impact - BEAT.approach;
        /* The rock holds its entry pose for the first tenth of the drop, so it
         * arrives as a settled object before the tumble starts, rather than
         * already spinning the instant it clears the top edge. */
        const HOLD = 0.1;

        timeline.fromTo(
          stone,
          { yPercent: startYPercent },
          {
            yPercent: 0,
            scale: 1.35,
            duration: fallSpan,
            ease: "none",
            immediateRender: true,
          },
          BEAT.approach
        );
        timeline.to(
          stone,
          {
            rotate: 0,
            duration: fallSpan * (1 - HOLD),
            ease: "none",
          },
          BEAT.approach + fallSpan * HOLD
        );

        /* Both tips rock underneath the in-plane turn rather than revolving, and
           wait out the same hold so nothing moves during the entry. */
        if (!stoneTurntable) {
          timeline.to(
            stone,
            {
              keyframes: {
                rotationX: swingX,
                rotationY: swingY,
                easeEach: "sine.inOut",
              },
              duration: fallSpan * (1 - HOLD),
            },
            BEAT.approach + fallSpan * HOLD
          );
        }
        /*
         * 3 — the inversion, keyed to the fall rather than preceding it. The
         * white ground burns off while the fog comes up underneath it, so the
         * frame passes through a flat grey before it resolves to stone, with the
         * boulder already in shot. `--dark` carries the type from ink to light.
         */
        timeline.to(fx, { dark: 1, duration: 20, ease: "power2.inOut" }, BEAT.invert);
        timeline.to(fx, { fog: 1, duration: 24, ease: "power1.out" }, BEAT.invert - 2);

        timeline.fromTo(
          world,
          { scale: 1.08 },
          {
            scale: 1,
            duration: BEAT.hold - BEAT.approach,
            ease: "power1.out",
          },
          BEAT.approach
        );

        /* 4 — impact: the wordmark shatters and the storm fires. */
        if (letters.length) {
          timeline.to(
            letters,
            {
              x: () => gsap.utils.random(-640, 640),
              y: () => gsap.utils.random(-360, 560),
              rotate: () => gsap.utils.random(-220, 220),
              scale: () => gsap.utils.random(0.5, 1.9),
              autoAlpha: 0,
              filter: isMobile ? "blur(0px)" : "blur(7px)",
              duration: 12,
              /*
               * `amount` rather than `each`, so the shatter always spans the
               * same slice of the timeline no matter how many letters the
               * headline has — with `each`, longer copy pushed stray letters
               * out past the engraving.
               */
              stagger: { amount: 5, from: "center" },
              ease: "power2.in",
            },
            BEAT.shatter
          );
        }
        timeline
          .to(fx, { flash: 1, duration: 2, ease: "power3.out" }, BEAT.impact - 2)
          .to(fx, { flash: 0, duration: 7, ease: "power2.in" }, BEAT.impact);

        /*
         * 5 — the morph, taken from the reference frame by frame.
         *
         * The rock does not squash flat and dissolve. It turns until it is
         * edge-on, the slab takes over in that same edge-on pose, and then the
         * slab rotates *open* toward camera — which is why the reference reads
         * as one solid object turning rather than two images crossfading. The
         * "wedge with a lit top" a third of the way through is simply the slab
         * seen almost side-on, catching light along its edge.
         */
        timeline.to(
          stone,
          { ...EDGE_POSE, rotationY: 0, duration: 4, ease: "power2.inOut" },
          BEAT.squash
        );
        timeline.to(stone, { autoAlpha: 0, duration: 3, ease: "none" }, BEAT.slab);
        timeline.to(slab, { autoAlpha: 1, duration: 3, ease: "none" }, BEAT.slab);

        /* The face opens toward camera and the slab settles to its final size. */
        timeline.to(
          slab,
          {
            rotationX: 0,
            rotate: 0,
            scale: 1,
            /* Lands face-on exactly as the engraving beat opens, so the mark is
               never cut into a slab that is still tilting. */
            duration: BEAT.engrave - (BEAT.slab + 1),
            ease: "power2.out",
          },
          BEAT.slab + 1
        );

        /*
         * 6 — the cut. Each stroke of the mask is drawn along its own path, so
         * the groove opens the way a chisel would travel it, one stroke after
         * the next. No light flare and no billowing dust: the mark has to read
         * as stone being removed, and anything glowing on top of it turns that
         * back into an effect laid over a picture. What the cut does throw is
         * chips and dust — see `drawCutDebris`, which reads the tool's position
         * off these same strokes, so the spray scrubs in both directions.
         */
        if (cutStrokes.length) {
          timeline.fromTo(
            cutStrokes,
            /*
             * The tween starts where the chisel touches down, not at the
             * parked pose.
             *
             * The dash only exposes the path once the offset drops below the
             * path's own length, so running from `length + CAP` — the parked
             * value — spent the first 41% of the first stroke's duration, over
             * four beats, moving an offset that could not show anything yet.
             * The cut beat opened and nothing happened, no groove and no
             * debris, which is exactly the first scratch going missing.
             *
             * `immediateRender: false` is what keeps the parked pose doing its
             * job: the `gsap.set` above still holds the offset a cap-radius
             * clear of the seam until this tween actually starts, so no nick is
             * painted into the slab before the chisel arrives.
             */
            { strokeDashoffset: (_i, target: SVGPathElement) => target.getTotalLength() },
            {
              strokeDashoffset: 0,
              immediateRender: false,
              /* Mostly sequential. Overlapping the strokes had all three
                 opening at once, which reads as a shape fading up rather than
                 as a tool working one cut and moving to the next. */
              duration: CUT_DURATION,
              /* The gentlest in-out curve: `power1` still pulls away and pulls
                 up hard enough at these durations to read as the tool
                 stuttering between strokes. */
              ease: "sine.inOut",
              stagger: CUT_STAGGER,
            },
            BEAT.engrave
          );
        }

        /*
         * 6b — the slab clears the frame and the cards arrive.
         *
         * As the first stroke is cut the cards come in around the slab, one to
         * each corner of the frame. They land and stop: nothing moves them
         * again until the dissolve.
         */
        /*
         * The slab used to settle to half size and slide right to clear the
         * left of the frame for the cards. The cards ring it instead now, so it
         * stays exactly where and what size it always was. Kept here rather than
         * deleted — it may be wanted back.
         *
         * timeline.to(
         *   slab,
         *   {
         *     scale: 0.5,
         *     x: () => stage.clientWidth * 0.24,
         *     duration: 7,
         *     ease: "power2.inOut",
         *   },
         *   BEAT.engrave
         * );
         */

        /*
         * Each card comes in on an arc, not a straight line. The arc is the two
         * axes running the same distance on different curves — the horizontal
         * eased at both ends, the vertical arriving late — so the path bows
         * instead of tracking the diagonal. A little counter-rotation on the
         * way in finishes the swing.
         *
         * Both curves are kept shallow. A steeper pair draws a prettier bow but
         * spends most of the card's travel nearly stationary and then rushes
         * the last of it, which under a scrub reads as the card snapping into
         * place rather than settling.
         */
        cardEls.forEach((card, index) => {
          const slot = CARD_SLOTS[index];
          if (!slot) return;
          const [fromX, fromY] = slot.from.split(",").map((v) => v.trim());
          const at = BEAT.engrave + index * 7.8;
          const spin = fromX.startsWith("-") ? -9 : 9;

          timeline
            .fromTo(
              card,
              { x: fromX },
              { x: 0, duration: 19, ease: "sine.inOut" },
              at
            )
            .fromTo(
              card,
              { y: fromY },
              { y: 0, duration: 19, ease: "power2.out" },
              at
            )
            .fromTo(
              card,
              { autoAlpha: 0, scale: 0.82, rotate: spin },
              {
                autoAlpha: 1,
                scale: 1,
                rotate: 0,
                duration: 18,
                ease: "sine.out",
              },
              at
            );
        });

        /* 7 — a beat of stillness so the mark is actually readable. */
        timeline.to(slab, { y: -8, duration: BEAT.dissolve - BEAT.hold }, BEAT.hold);

        /* 8 — the slab disintegrates and the camera pulls back to the gallery. */
        timeline
          .to(fx, { erode: 1, bloom: 1, duration: 9, ease: "power2.in" }, BEAT.dissolve)
          .to(fx, { fog: 0.25, duration: 9, ease: "power2.in" }, BEAT.dissolve)
          .to(
            slab,
            { scale: 0.84, y: -70, autoAlpha: 0, duration: 9, ease: "power2.in" },
            BEAT.dissolve
          )
          .to(
            world,
            { scale: 0.88, duration: BEAT.end - BEAT.dissolve, ease: "power2.in" },
            BEAT.dissolve
          );
        if (cardEls.length) {
          timeline.to(
            cardEls,
            { autoAlpha: 0, y: -46, duration: 8, ease: "power2.in" },
            BEAT.dissolve
          );
        }
        if (captionEl) {
          timeline.to(captionEl, { autoAlpha: 0, duration: 8 }, BEAT.dissolve);
        }


        /* ------------------------------------------------------- dust loop */
        if (ctx && canvas) {
          sprites = [
            makeSprite("rgba(226,209,182,0.9)", "rgba(168,150,124,0.34)"),
            makeSprite("rgba(196,208,224,0.75)", "rgba(126,142,164,0.28)"),
          ];
          resizeCanvas();
          resizeObserver = new ResizeObserver(resizeCanvas);
          resizeObserver.observe(stage);
          gsap.ticker.add(drawDust);
          tickerAdded = true;
        }

        return () => {
          motes.length = 0;
          grains.clear();
          if (tickerAdded) {
            gsap.ticker.remove(drawDust);
            tickerAdded = false;
          }
          if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
          }
          lastFrame = 0;
          inView = false;
          if (skyVideo) skyVideo.pause();
        };
      }
    );

    return () => {
      mm.revert();
    };
  }, [scrollRunway, headlineKey, stoneTurntable]);

  const maskStyle = (src: string) => ({
    WebkitMaskImage: "url(" + src + ")",
    maskImage: "url(" + src + ")",
  });

  return (
    <section
      ref={sectionRef}
      className={[styles.section, className].filter(Boolean).join(" ")}
      data-section-theme="dark"
      aria-label="Our mark, cut in stone"
    >
      <div className={styles.stage} ref={stageRef}>
        {/* ------------------------------------------------- atmosphere */}
        <div className={styles.sky} aria-hidden="true" />
        {/*
         * The sky itself. It sits under the white ground and comes up on
         * `--dark`, so it is uncovered by the same inversion that used to
         * uncover the storm — and it is started playing on that beat rather
         * than on mount, so the first thing you see is its first frame.
         */}
        <video
          ref={skyVideoRef}
          className={styles.skyVideo}
          src={SKY_VIDEO}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* The white ground the section opens on. It burns off as --dark runs,
            uncovering the stone sky underneath. */}
        <div className={styles.skyLight} aria-hidden="true" />
        <div className={styles.fog} aria-hidden="true">
          <span className={styles.fogBank} data-bank="1" />
          <span className={styles.fogBank} data-bank="2" />
          <span className={styles.fogBank} data-bank="3" />
        </div>

        {/*
         * The drawn storm — clouds, light shafts, lightning — is replaced by
         * the sky video above. It is all still wired to `--dark`/`--fog`, so
         * turning DRAWN_STORM back on puts every layer back over the video
         * exactly as it was. Held behind a flag rather than block-commented
         * because these layers carry comments of their own, and a JSX comment
         * cannot nest.
         */}
        {DRAWN_STORM ? (
          <>
            {/* Storm clouds. Each one runs from small and far to large and past the
              camera, so the bank builds depth rather than sliding as a flat plane;
              the six drift on different headings and are offset in time so there
              is never a moment with nothing crossing the frame. */}
            <div className={styles.clouds} aria-hidden="true">
              {CLOUD_LAYERS.map((cloud, index) => (
                    <span
                      className={styles.cloud}
                      key={cloud.plate.src + index}
                      style={
                        {
                          /* The paint lives on the pseudo-element, which carries the
                          lightning-keyed opacity; the element itself only drifts. */
                          "--img": "url(" + cloud.plate.src + ")",
                          "--from": cloud.from,
                          "--to": cloud.to,
                          /* The plate's real-estate opacity is what full brightness
                          means for this cloud; the resting level is a fraction of it
                          and the drift envelope only fades the loop seam. */
                          "--dim": cloud.plate.peak,
                          "--mask": cloud.plate.mask,
                          "--mask-y": cloud.plate.maskY,
                          "--w": cloud.width,
                          "--ar": cloud.plate.ratio,
                          "--arv": cloud.plate.ratioValue,
                          "--x": cloud.at.split(" ")[0],
                          "--y": cloud.at.split(" ")[1],
                          "--dur": cloud.duration,
                          "--delay": cloud.delay,
                          "--flash-dur": cloud.flashDur,
                          "--flash-delay": cloud.flashDelay,
                        } as React.CSSProperties
                    }
                  />
                ))}
            </div>
            <div className={styles.rays} aria-hidden="true">
              <span className={styles.ray} data-ray="1" />
              <span className={styles.ray} data-ray="2" />
            </div>
            {/* Strikes ring the frame and run on unrelated loops, so the storm keeps
              working without ever settling into a rhythm. */}
            <div className={styles.storm} aria-hidden="true">
              {STORM_STRIKES.map((strike, index) => (
                    <span
                      className={styles.strike}
                      key={strike.at + index}
                      style={
                        {
                          "--at": strike.at,
                          "--size": strike.size,
                          "--peak": strike.peak,
                          "--dur": strike.duration,
                          "--delay": strike.delay,
                        } as React.CSSProperties
                    }
                  />
                ))}
            {/* The channels themselves, over the blooms they are paired with. */}
            {STORM_BOLTS.map((bolt) => (
                  <svg
                    className={styles.bolt}
                    key={bolt.seed}
                    viewBox={`0 0 ${BOLT_W} ${BOLT_H}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    style={
                      {
                        "--x": bolt.at,
                        "--t": bolt.top,
                        "--h": bolt.height,
                        "--flip": String(bolt.flip),
                        "--dur": bolt.duration,
                        "--delay": bolt.delay,
                      } as React.CSSProperties
                  }
              >
              {/*
                * Three passes of the same geometry — a wide dim halo, a mid
                * sheath, then a near-white core — is what gives the channel its
                * hot centre. The strokes do not scale with the box, so a bolt
                * stays the same weight on any screen.
                */}
              <g
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              >
              <path
                className={styles.boltHalo}
                d={bolt.geometry.channel}
                vectorEffect="non-scaling-stroke"
                />
                {bolt.geometry.branches.map((branch) => (
                      <path
                        className={styles.boltHalo}
                        d={branch}
                        key={branch}
                        vectorEffect="non-scaling-stroke"
                        />
                      ))}
                <path
                  className={styles.boltSheath}
                  d={bolt.geometry.channel}
                  vectorEffect="non-scaling-stroke"
                  />
                  {bolt.geometry.branches.map((branch) => (
                        <path
                          className={styles.boltBranch}
                          d={branch}
                          key={branch}
                          vectorEffect="non-scaling-stroke"
                          />
                        ))}
                  <path
                    className={styles.boltCore}
                    d={bolt.geometry.channel}
                    vectorEffect="non-scaling-stroke"
                    />
                  </g>
                </svg>
              ))}
            </div>
          </>
        ) : null}

        <div className={styles.flash} aria-hidden="true" />

        {/* ------------------------------------------------------ world */}
        <div className={styles.world} data-cs="world">
          {headline.length > 0 && (
            <div
              className={styles.headline}
              data-cs="headline"
              aria-label={headline.join(" ")}
            >
              {headline.map((line) => (
                <span className={styles.headlineLine} key={line} aria-hidden="true">
                  {Array.from(line).map((char, index) => (
                    <span
                      className={styles.letter}
                      data-cs-letter=""
                      key={line + "-" + index}
                    >
                      {char === " " ? " " : char}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          )}

          {/* The boulder. A masked highlight rides over it so the surface
              catches light as it turns, which reads as depth on a billboard. */}
          <div className={styles.stone} data-cs="stone" aria-hidden="true">
            {stoneTurntable ? (
              /* The sheet carries its own lighting per frame, so the faked
                 highlight sweep is dropped here — it would fight the render. */
              <span
                className={styles.stoneSprite}
                data-cs="stone-sprite"
                style={{
                  backgroundImage: "url(" + stoneTurntable.src + ")",
                  backgroundSize:
                    stoneTurntable.columns * 100 +
                    "% " +
                    stoneTurntable.rows * 100 +
                    "%",
                }}
              />
            ) : (
              <>
                <img
                  src={stoneSrc}
                  alt=""
                  className={styles.stoneImg}
                  decoding="async"
                />
                <span className={styles.stoneLight} style={maskStyle(stoneSrc)} />
              </>
            )}
          </div>

          {/* The slab, carved. Every engraving layer is masked by the asset
              itself, so light only ever falls on real stone. */}
          <div className={styles.slab} data-cs="slab">
            {/*
             * The uncut plate is the base and it never goes anywhere. The carved
             * plate sits behind a mask that is nothing but the W strokes, so the
             * only pixels ever revealed are the cut itself — the surrounding
             * stone is always the same image. That is what stops this reading as
             * one picture being taken off another: nothing is removed, the groove
             * is opened along its own path.
             *
             * It also sidesteps the fact that the two plates are different sizes
             * and their slab edges do not line up. Outside the strokes they are
             * never both visible, so the mismatch has nowhere to show.
             */}
            <img
              src={beforeSlabSrc}
              alt="A blank slab of stone"
              className={styles.slabBase}
              decoding="async"
            />

            <svg
              className={styles.scratch}
              data-cs-scratch-svg=""
              viewBox={CARVE_VIEWBOX}
              preserveAspectRatio="none"
              role="img"
              aria-label="The cwit W, carved into the stone"
            >
              <defs>
                {/* The cut's true outline, thresholded out of the plate. */}
                <mask
                  id={shapeId}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="453"
                  height="424"
                >
                  <image
                    href={CARVE_MASK}
                    x="0"
                    y="0"
                    width="453"
                    height="424"
                    preserveAspectRatio="none"
                  />
                </mask>

                {/* How far along the mark the chisel has travelled. */}
                <mask
                  id={maskId}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="453"
                  height="424"
                >
                  {/*
                   * The black ground is load-bearing, not boilerplate.
                   *
                   * Without it the mask's content is empty whenever every stroke
                   * is dashed fully out, and the browser then drops the mask
                   * rather than treating it as "hide everything" — so the whole
                   * mark appeared before the chisel had touched it. Painting an
                   * explicit black field means "nothing drawn" reads as nothing
                   * shown, which is what an empty route should mean.
                   */}
                  <rect x="0" y="0" width="453" height="424" fill="#000" />
                  <g>
                    {CARVE_PATHS.map((d) => (
                      <path
                        d={d}
                        key={"cut-" + d}
                        data-cs-scratch=""
                        fill="none"
                        stroke="#fff"
                        strokeWidth="96"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </g>
                </mask>
              </defs>
              {/*
               * Two masks, applied at two levels rather than one nested inside
               * the other. The group carries the route, the image carries the
               * shape, and the browser composes them. Referencing a mask from
               * *inside* another mask's definition is where this went wrong
               * before: the shape leaked through the route and the mark showed
               * before the chisel had reached it.
               */}
              <g mask={"url(#" + maskId + ")"}>
                <image
                  href={slabSrc}
                  x="0"
                  y="0"
                  width="453"
                  height="424"
                  preserveAspectRatio="none"
                  mask={"url(#" + shapeId + ")"}
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Flown in one at a time as the cut is worked — see the card beat in
            the timeline. Positioned against the stage rather than inside the
            world, which is under a 3D transform the arcs would be read
            through. */}
        <div className={styles.cards}>
          {cards.slice(0, CARD_SLOTS.length).map((card, index) => (
            <article
              className={styles.card}
              data-cs-card=""
              key={card.title}
              style={{
                left: CARD_SLOTS[index].left,
                right: CARD_SLOTS[index].right,
                top: CARD_SLOTS[index].top,
              }}
            >
              <div className={styles.cardInner}>
                <span className={styles.cardMark} aria-hidden="true">
                  <img src={CARD_MARK} alt="" />
                </span>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardText}>{card.body}</p>
              </div>
            </article>
          ))}
        </div>

        <canvas className={styles.dust} ref={canvasRef} aria-hidden="true" />

        {/* Kept clear of the site's fixed menu pill and chat button, which own
            the bottom-centre and bottom-right of every viewport. */}
        {eyebrow && (
          <span className={styles.eyebrow} data-cs="eyebrow">
            {eyebrow}
          </span>
        )}
        {caption && (
          <p className={styles.caption} data-cs="caption">
            {caption}
          </p>
        )}

        <div className={styles.bloom} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
    </section>
  );
}
