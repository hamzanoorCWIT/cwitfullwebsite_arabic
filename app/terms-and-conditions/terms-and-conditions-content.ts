/**
 * Terms & Conditions content types.
 * CMS field group: termsAndConditions (wordpress/acf-json/group_terms_and_conditions.json)
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

export type TermsAndConditionsContent = {
  bannerTitle: string;
  glowImage: string;
  glowImageAlt: string;
  lastUpdated: string;
  introText: string;
  sections: PolicySection[];
};
