import type { OfferCard } from "./FigmaHomeOffersCarousel";
import type { OfferModalContent } from "@/app/lib/home-offers-types";

export function getOfferModalContent(
  card: OfferCard
): OfferModalContent | null {
  return card.modalContent ?? null;
}

/*
 * Legacy static Home offer content retained for design reference only.
 * Runtime cards and popup data now come from WordPress.
 *
 * Home offer carousel — 2 cards per studio (visuals from services page).
export const offerColumns: OfferCard[][] = [
  // Digital Experience Studio
  [
    {
      kind: "web",
      studio: "digital",
      title: "Website Design & Development",
      description: "Every great business deserves a website that people remember.",
      background: "/imgs/digital-card-bg.png",
      art: "/imgs/digital-card-1.svg",
    },
  ],
  [
    {
      kind: "ecommerce",
      studio: "digital",
      title: "Ecommerce Solutions",
      description: "Shopping online should feel effortless from the first product to the final payment.",
      background: "/imgs/digital-card-2-bg.png",
      art: "/imgs/digital-card-2.png",
      mini: true,
    },
    {
      kind: "chatbots",
      studio: "ai",
      title: "Conversational AI",
      description: "Natural conversations create stronger customer relationships.",
      background: "/imgs/ai-card-bg-2.png",
      art: "/imgs/ai-card-2.png",
      mini: true,
    },
  ],
  // Application Development Studio
  [
    {
      kind: "app",
      studio: "application",
      title: "Web Application Development",
      description: "The best software doesn't just solve problems. It makes work feel simpler.",
      background: "/imgs/application-card-bg.jpg",
      art: "/imgs/application-card-1.png",
    },
  ],
  [
    {
      kind: "mobile",
      studio: "application",
      title: "Mobile Application Development",
      description: "The most valuable digital experiences are the ones your customers carry every day.",
      background: "/imgs/application-card-bg-2.jpg",
      art: "/imgs/application-card-2.png",
    },
  ],
  // Growth & Branding Studio
  [
    {
      kind: "seo",
      studio: "growth",
      title: "Search Engine Optimisation",
      description: "The best website in the world means very little if the right people never discover it.",
      background: "/imgs/growth-card-bg.png",
      art: "/imgs/growth-card-1.png",
      mini: true,
    },
    {
      kind: "brand",
      studio: "growth",
      title: "Content Strategy",
      description: "Every successful brand has a story worth sharing.",
      background: "/imgs/growth-card-bg-2.png",
      art: "/imgs/digital-card-3-new.png",
      mini: true,
    },
  ],
  // AI & Intelligent Systems
  [
    {
      kind: "ai",
      studio: "ai",
      title: "AI Agents",
      description: "Tomorrow's businesses won't work harder. They'll work smarter with intelligent systems.",
      background: "/imgs/ai-card-bg.png",
      art: "/imgs/ai-card-1.png",
    },
  ],
];
*/
