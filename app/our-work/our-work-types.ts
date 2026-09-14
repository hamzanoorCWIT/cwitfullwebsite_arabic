import type { WorkItem } from "@/app/components/sections/OurWork";

/** Work item on Our Work page: includes optional link (e.g. portfolio URL). */
export type OurWorkPageItem = WorkItem & { link?: string };
