/**
 * Privacy Policy content types.
 * CMS field group: privacyPolicy (wordpress/acf-json/group_privacy_policy.json)
 */

export type PolicySubsection = {
  title: string;
  intro?: string;
  bullets?: string[];
};

export type PolicySection = {
  title: string;
  body?: string;
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
  outro?: string;
  children?: PolicySubsection[];
};

export type PrivacyPolicyContent = {
  bannerTitle: string;
  glowImage: string;
  glowImageAlt: string;
  maskImage: string;
  maskImageAlt: string;
  lastUpdated: string;
  introText: string;
  sections: PolicySection[];
};
