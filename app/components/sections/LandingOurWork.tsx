import FigmaHomeOurWork from "@/app/components/sections/FigmaHomeOurWork";
import { fetchLandingOurWorkItems } from "@/app/lib/landing-our-work";

type LandingOurWorkProps = {
  titleOverride?: string;
  sectionSubtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Server component that renders the home-style "Our Work" carousel on the
 * service/industry landing pages. Fetches featured portfolios and renders
 * nothing when none are available.
 */
export default async function LandingOurWork({
  titleOverride = "Our Work",
  ...props
}: LandingOurWorkProps) {
  const items = await fetchLandingOurWorkItems();
  if (!items.length) return null;

  return <FigmaHomeOurWork items={items} titleOverride={titleOverride} {...props} />;
}
