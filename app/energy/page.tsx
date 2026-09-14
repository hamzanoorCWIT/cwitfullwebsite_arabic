import type { Metadata } from "next";

import LeadingServiceLandingPage, {
  generateLeadingServiceLandingMetadata,
} from "@/app/components/sections/LeadingServiceLandingPage";
import { LEADING_SERVICE_LANDINGS } from "@/app/lib/leading-service-landings";

export const revalidate = 3600;

const config = LEADING_SERVICE_LANDINGS["energy"];

export async function generateMetadata(): Promise<Metadata> {
  return generateLeadingServiceLandingMetadata(config);
}

export default async function EnergyPage() {
  return <LeadingServiceLandingPage config={config} />;
}
