/**
 * WordPress WPGraphQL API for Home (Front) page.
 * Uses same getWordPressGraphqlEndpoint() as our-work-api.
 *
 * ACF groups (see wordpress/acf-json/README.md):
 * - homePage: Hero, Intro, Showcase, Studios, GenAI, featurePortfolioHome, Clients, Blogs Section (title + Selected Blogs), Accordion
 *
 * Optional ACF **URL** fields (direct video file URLs — WordPress uploads, CDN, or Cloudflare Stream e.g. …/downloads/default.mp4):
 * - homeHeroSection: heroVideoUrl, heroVideoMobileUrl (use instead of or alongside Media heroVideo / heroVideoMobile)
 * - homeStudios row: videoUrl (alongside Media video), buttonText (CTA label), link (CTA URL)
 * - homeGenaiSection: genaiVideoUrl (alongside Media video)
 * - homePagePortfolioListing: Portfolio listing (page-level, optional)
 * Selected Blogs: Home Page > Blogs Section. Empty → blogs section hidden on the front-end.
 */

import { BLOG_POST_LISTING_CARD_GQL, type BlogPostNode } from "@/app/lib/blog-api";
import {
  getWordPressGraphqlEndpoint,
  getWordpressGraphqlHeaders,
  WORDPRESS_REVALIDATE_SECONDS,
  type GraphQLResponse,
} from "@/app/lib/wordpress-graphql";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";
import { resolveHomePageId } from "@/app/lib/wpml-page";

const HOME_SELECTED_BLOG_POST_FIELDS = `
              databaseId
              title
              slug
              uri
              excerpt
              date
              language {
                code
              }
              translations {
                databaseId
                language {
                  code
                }
              }
              categories {
                nodes {
                  name
                  slug
                }
              }
              featuredImage {
                node {
                  sourceUrl
                  mediaItemUrl
                  altText
                }
              }
              ${BLOG_POST_LISTING_CARD_GQL.trim()}
`;

const DEBUG_HOME_DATA = process.env.WORDPRESS_DEBUG_HOME_DATA === "true";

function logHomeDebug(message: string, meta?: Record<string, unknown>) {
  if (!DEBUG_HOME_DATA) return;
  if (meta) {
    console.log(`[home-api] ${message}`, meta);
    return;
  }
  console.log(`[home-api] ${message}`);
}

// -----------------------------------------------------------------------------
// Home Page (Front page) – by URI or ID
// -----------------------------------------------------------------------------
// ACF: Set field group "GraphQL Field Name" to "home_page" (→ homePage) or
// "home_page_fields" (→ homePageFields). Then use the matching query below.

const HOME_PAGE_FIELDS_FRAGMENT = `
  homeHeroSection {
    heroVideo {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    heroVideoUrl
    heroTitle
    heroSubtitle
    heroimage {
      node {
        sourceUrl
        altText
        mediaItemUrl
      }
    }
    heroVideoMobile {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    heroVideoMobileUrl
    heroImageMobile {
      node {
        sourceUrl
        altText
        mediaItemUrl
      }
    }
  }
  homeIntroSection {
    introParagraph
    introBackgroundImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  showcaseBeforeImage {
    node {
      sourceUrl
      altText
    }
  }
  showcaseLogoImage {
    node {
      sourceUrl
      altText
    }
  }
  showcaseHeadline
  showcaseDescription
  showcaseCards {
    cardType
    title
    subtitle
    description
    image {
      node {
        sourceUrl
        altText
      }
    }
    backgroundClass
    textColorClass
  }
  homeStudios {
    title
    description
    video {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    videoUrl
    link
    buttonText
  }
  homeGenaiSection {
    heading
    paragraph
    video {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    genaiVideoUrl
    ctaText
    ctaLink
  }
  ourWorkTitle
  featurePortfolioHome(first: 100) {
    nodes {
      ... on Portfolio {
        databaseId
        slug
        title
        uri
        excerpt
        homePortfolioListing {
          portfolioListingSubtitle
          portfolioListingTitle
          portfolioListingDescription
          portfolioListingCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
        portfolioDetails {
          listingCard {
            portfolioSubtitle
            portfolioTitle
            portfolioDescription
            portfolioImage {
              node {
                sourceUrl
                mediaItemUrl
                altText
              }
            }
          }
          portfolioDetails {
            backgroundImage {
              node {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
      }
    }
  }
  clientLogos {
    logoName
    logoImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  homeTestimonials {
    testimonialQuote
    testimonialAuthor
    testimonialRole
    testimonialCompany
    highlightCompany
    testimonialImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  homeOffersHeading
  homeOffersDescription
  homeOffersCtaText
  homeOffersCtaLink
  homeOffersSource
  homeServiceOfferColumns {
    columnLabel
    offerCards {
      serviceCard
      cardKind
      isMini
    }
  }
  homeOfferColumns {
    columnLabel
    offerCards {
      cardKind
      isMini
      customTitle
      customDescription
      customArt {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      customBackground {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      customPopupEnabled
      popupTitle
      popupDescription
      popupImage {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      popupBackground {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      popupCtaText
      popupCtaLink
      popupImagePosition
    }
  }
  blogsSectionTitle
  homeFeaturedBlogPosts(first: 100) {
    nodes {
      ... on Post {
        ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
      }
    }
  }
  accordionTitle
  accordionItems {
    faqTitle
    faqContent
  }
`;

/** Legacy-safe fragment (without new blogs override group). */
const HOME_PAGE_FIELDS_FRAGMENT_LEGACY = `
  homeHeroSection {
    heroVideo {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    heroVideoUrl
    heroTitle
    heroSubtitle
    heroimage {
      node {
        sourceUrl
        altText
        mediaItemUrl
      }
    }
    heroVideoMobile {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    heroVideoMobileUrl
    heroImageMobile {
      node {
        sourceUrl
        altText
        mediaItemUrl
      }
    }
  }
  homeIntroSection {
    introParagraph
    introBackgroundImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  showcaseBeforeImage {
    node {
      sourceUrl
      altText
    }
  }
  showcaseLogoImage {
    node {
      sourceUrl
      altText
    }
  }
  showcaseHeadline
  showcaseDescription
  showcaseCards {
    cardType
    title
    subtitle
    description
    image {
      node {
        sourceUrl
        altText
      }
    }
    backgroundClass
    textColorClass
  }
  homeStudios {
    title
    description
    video {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    videoUrl
    link
    buttonText
  }
  homeGenaiSection {
    heading
    paragraph
    video {
      node {
        sourceUrl
        mediaItemUrl
      }
    }
    genaiVideoUrl
    ctaText
    ctaLink
  }
  ourWorkTitle
  featurePortfolioHome(first: 100) {
    nodes {
      ... on Portfolio {
        databaseId
        slug
        title
        uri
        excerpt
        homePortfolioListing {
          portfolioListingSubtitle
          portfolioListingTitle
          portfolioListingDescription
          portfolioListingCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
        portfolioDetails {
          listingCard {
            portfolioSubtitle
            portfolioTitle
            portfolioDescription
            portfolioImage {
              node {
                sourceUrl
                mediaItemUrl
                altText
              }
            }
          }
          portfolioDetails {
            backgroundImage {
              node {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
      }
    }
  }
  clientLogos {
    logoName
    logoImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  homeTestimonials {
    testimonialQuote
    testimonialAuthor
    testimonialRole
    testimonialCompany
    highlightCompany
    testimonialImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  blogsSectionTitle
  accordionTitle
  accordionItems {
    faqTitle
    faqContent
  }
`;

// -----------------------------------------------------------------------------
// GetHomePageByUri – Home page query; Selected Blogs inside homePage (ACF Home Page > Blogs Section).
// Variables: { "uri": "home" }
// -----------------------------------------------------------------------------
export const GET_HOME_PAGE_BY_URI = `
  query GetHomePageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        homeHeroSection {
          heroVideo {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          heroVideoUrl
          heroTitle
          heroSubtitle
          heroimage {
            node {
              sourceUrl
              altText
              mediaItemUrl
            }
          }
          heroVideoMobile {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          heroVideoMobileUrl
          heroImageMobile {
            node {
              sourceUrl
              altText
              mediaItemUrl
            }
          }
        }
        homeIntroSection {
          introParagraph
          introBackgroundImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        showcaseBeforeImage {
          node {
            sourceUrl
            altText
          }
        }
        showcaseLogoImage {
          node {
            sourceUrl
            altText
          }
        }
        showcaseHeadline
        showcaseDescription
        showcaseCards {
          cardType
          title
          subtitle
          description
          image {
            node {
              sourceUrl
              altText
            }
          }
          backgroundClass
          textColorClass
        }
        homeStudios {
          title
          description
          video {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          videoUrl
          link
          buttonText
        }
        homeGenaiSection {
          heading
          paragraph
          video {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          genaiVideoUrl
          ctaText
          ctaLink
        }
        ourWorkTitle
        featurePortfolioHome(first: 100) {
          nodes {
            ... on Portfolio {
              databaseId
              slug
              title
              uri
              excerpt
              homePortfolioListing {
                portfolioListingSubtitle
                portfolioListingTitle
                portfolioListingDescription
                portfolioListingCards {
                  cardSubtitle
                  cardTitle
                  cardDescription
                  cardImage {
                    node {
                      ... on MediaItem {
                        sourceUrl
                        mediaItemUrl
                      }
                    }
                  }
                }
              }
              portfolioDetails {
                listingCard {
                  portfolioSubtitle
                  portfolioTitle
                  portfolioDescription
                  portfolioImage {
                    node {
                      sourceUrl
                      mediaItemUrl
                      altText
                    }
                  }
                },
                portfolioDetails {
                  backgroundImage {
                    node {
                      sourceUrl
                      mediaItemUrl
                    }
                  }
                }
              }
            }
          }
        }
        clientLogos {
          logoName
          logoImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        homeTestimonials {
          testimonialQuote
          testimonialAuthor
          testimonialRole
          testimonialCompany
          highlightCompany
          testimonialImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        blogsSectionTitle
        homeFeaturedBlogPosts(first: 100) {
          nodes {
            ... on Post {
              ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
            }
          }
        }
        accordionTitle
        accordionItems {
          faqTitle
          faqContent
        }
      }
    }
  }
`;

const GET_HOME_PAGE_BY_URI_WITH_LEGACY_BLOG_FIELD = GET_HOME_PAGE_BY_URI.replace(
  "homeFeaturedBlogPosts(first: 100)",
  "homeBlogsSelectedPosts(first: 100)"
);

// Same as GetHomePageByUri but WITHOUT homeBlogsSelectedPosts – use when field not in schema yet (e.g. before ACF sync).
const GET_HOME_PAGE_BY_URI_LEGACY = `
  query GetHomePageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      id title slug uri
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        homeHeroSection {
          heroVideo {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          heroVideoUrl
          heroTitle
          heroSubtitle
          heroimage {
            node {
              sourceUrl
              altText
              mediaItemUrl
            }
          }
          heroVideoMobile {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          heroVideoMobileUrl
          heroImageMobile {
            node {
              sourceUrl
              altText
              mediaItemUrl
            }
          }
        }
        homeIntroSection { introParagraph introBackgroundImage { node { sourceUrl altText } } }
        showcaseBeforeImage { node { sourceUrl altText } }
        showcaseLogoImage { node { sourceUrl altText } }
        showcaseHeadline
        showcaseDescription
        showcaseCards { cardType title subtitle description image { node { sourceUrl altText } } backgroundClass textColorClass }
        homeStudios { title description video { node { sourceUrl mediaItemUrl } } videoUrl link buttonText }
        homeGenaiSection { heading paragraph video { node { sourceUrl mediaItemUrl } } genaiVideoUrl ctaText ctaLink }
        ourWorkTitle
        featurePortfolioHome(first: 100) {
          nodes {
            ... on Portfolio {
              databaseId
              slug
              title
              uri
              excerpt
              homePortfolioListing {
                portfolioListingSubtitle
                portfolioListingTitle
                portfolioListingDescription
                portfolioListingCards {
                  cardSubtitle
                  cardTitle
                  cardDescription
                  cardImage {
                    node {
                      ... on MediaItem {
                        sourceUrl
                        mediaItemUrl
                      }
                    }
                  }
                }
              }
              portfolioDetails {
                listingCard {
                  portfolioSubtitle
                  portfolioTitle
                  portfolioDescription
                  portfolioImage {
                    node {
                      sourceUrl
                      mediaItemUrl
                      altText
                    }
                  }
                },
                portfolioDetails {
                  backgroundImage {
                    node {
                      sourceUrl
                      mediaItemUrl
                    }
                  }
                }
              }
            }
          }
        }
        clientLogos { logoName logoImage { node { sourceUrl altText } } }
        homeTestimonials { testimonialQuote testimonialAuthor testimonialRole testimonialCompany highlightCompany testimonialImage { node { sourceUrl altText } } }
        blogsSectionTitle
        accordionTitle accordionItems { faqTitle faqContent }
      }
    }
  }
`;

// Legacy: page-level homeBlogsSectionOverrides (separate ACF group). Trash that group and use homePage.homeBlogsSelectedPosts instead.
const GET_HOME_PAGE_BY_URI_WITH_SELECTED_BLOGS = `
  query GetHomePageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      homeBlogsSectionOverrides {
        homeBlogsSectionSubtitle
        homeBlogsSectionTitle
        homeBlogsSectionDescription
        homeBlogsSelectedPosts {
          nodes {
            ... on Post {
              ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
            }
          }
        }
      }
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        homeHeroSection {
          heroVideo {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          heroVideoUrl
          heroTitle
          heroSubtitle
          heroimage {
            node {
              sourceUrl
              altText
              mediaItemUrl
            }
          }
          heroVideoMobile {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          heroVideoMobileUrl
          heroImageMobile {
            node {
              sourceUrl
              altText
              mediaItemUrl
            }
          }
        }
        homeIntroSection {
          introParagraph
          introBackgroundImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        showcaseBeforeImage {
          node {
            sourceUrl
            altText
          }
        }
        showcaseLogoImage {
          node {
            sourceUrl
            altText
          }
        }
        showcaseHeadline
        showcaseDescription
        showcaseCards {
          cardType
          title
          subtitle
          description
          image {
            node {
              sourceUrl
              altText
            }
          }
          backgroundClass
          textColorClass
        }
        homeStudios {
          title
          description
          video {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          videoUrl
          link
          buttonText
        }
        homeGenaiSection {
          heading
          paragraph
          video {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          genaiVideoUrl
          ctaText
          ctaLink
        }
        ourWorkTitle
        featurePortfolioHome(first: 100) {
          nodes {
            ... on Portfolio {
              databaseId
              slug
              title
              uri
              excerpt
              homePortfolioListing {
                portfolioListingSubtitle
                portfolioListingTitle
                portfolioListingDescription
                portfolioListingCards {
                  cardSubtitle
                  cardTitle
                  cardDescription
                  cardImage {
                    node {
                      ... on MediaItem {
                        sourceUrl
                        mediaItemUrl
                      }
                    }
                  }
                }
              }
              portfolioDetails {
                listingCard {
                  portfolioSubtitle
                  portfolioTitle
                  portfolioDescription
                  portfolioImage {
                    node {
                      sourceUrl
                      mediaItemUrl
                      altText
                    }
                  }
                },
                portfolioDetails {
                  backgroundImage {
                    node {
                      sourceUrl
                      mediaItemUrl
                    }
                  }
                }
              }
            }
          }
        }
        clientLogos {
          logoName
          logoImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        homeTestimonials {
          testimonialQuote
          testimonialAuthor
          testimonialRole
          testimonialCompany
          highlightCompany
          testimonialImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        blogsSectionTitle
        accordionTitle
        accordionItems {
          faqTitle
          faqContent
        }
      }
    }
  }
`;

// -----------------------------------------------------------------------------
// CWIT schema (jo aapke GraphQL IDE mein sahi chalti hai)
// heroSection, aboutSection, servicesSection, ourWorkSection, blogsSection, homeBlogsSectionOverrides
// -----------------------------------------------------------------------------
const GET_HOME_PAGE_CWIT = `
  query GetHomePageCwit($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      homePage {
        title
        description
        buttons {
          buttonText
          buttonLink
        }
        heroSection {
          fieldGroupName
          heading
          subHeading
          heroImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        aboutSection {
          fieldGroupName
          title
          description
          image {
            node {
              sourceUrl
              altText
            }
          }
        }
        servicesSection {
          fieldGroupName
          title
          services {
            serviceTitle
            serviceDescription
            serviceIcon {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
        ourWorkSection {
          fieldGroupName
          title
          description
          portfolios {
            nodes {
              ... on Portfolio {
                databaseId
                title
                slug
                uri
                excerpt
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }
                portfolioDetails {
                  listingCard {
                    portfolioSubtitle
                    portfolioTitle
                    portfolioDescription
                    portfolioImage {
                      node {
                        sourceUrl
                        mediaItemUrl
                        altText
                      }
                    }
                  },
                  portfolioDetails {
                    backgroundImage {
                      node {
                        sourceUrl
                      }
                    }
                  }
                }
              }
            }
          }
        }
        testimonialsSection {
          fieldGroupName
          title
          description
          testimonials {
            testimonialAuthor
            testimonialText
          }
        }
        blogsSection {
          fieldGroupName
          title
          description
          blogs {
            nodes {
              ... on Post {
                databaseId
                title
                slug
                uri
                excerpt
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/** Primary Home page query. */
export const GET_HOME_PAGE = `
  query GetHomePage($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      homeBlogsSectionOverridesRoot: homeBlogsSectionOverrides {
        homeBlogsSectionSubtitle
        homeBlogsSectionTitle
        homeBlogsSectionDescription
        homeBlogsSelectedPosts {
          nodes {
            ... on Post {
              ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
            }
          }
        }
        perBlogCardOverrides {
          blogPost {
            databaseId
            title
            slug
          }
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            sourceUrl
          }
        }
      }
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        ${HOME_PAGE_FIELDS_FRAGMENT}
      }
    }
  }
`;

export const GET_HOME_PAGE_LEGACY = `
  query GetHomePageLegacy($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      homeBlogsSectionOverridesRoot: homeBlogsSectionOverrides {
        homeBlogsSectionSubtitle
        homeBlogsSectionTitle
        homeBlogsSectionDescription
        homeBlogsSelectedPosts {
          nodes {
            ... on Post {
              ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
            }
          }
        }
      }
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        ${HOME_PAGE_FIELDS_FRAGMENT_LEGACY}
      }
    }
  }
`;

/** Alternate URI query variant (kept for compatibility). */
export const GET_HOME_PAGE_AS_FIELDS = `
  query GetHomePageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      slug
      uri
      homeBlogsSectionOverridesRoot: homeBlogsSectionOverrides {
        homeBlogsSectionSubtitle
        homeBlogsSectionTitle
        homeBlogsSectionDescription
        homeBlogsSelectedPosts {
          nodes {
            ... on Post {
              ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
            }
          }
        }
        perBlogCardOverrides {
          blogPost {
            databaseId
            title
            slug
          }
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            sourceUrl
          }
        }
      }
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        ${HOME_PAGE_FIELDS_FRAGMENT}
      }
    }
  }
`;

/** Home page by database ID (e.g. front page ID from Settings → Reading) */
export const GET_HOME_PAGE_BY_ID = `
  query GetHomePageById($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      title
      slug
      uri
      homeBlogsSectionOverridesRoot: homeBlogsSectionOverrides {
        homeBlogsSectionSubtitle
        homeBlogsSectionTitle
        homeBlogsSectionDescription
        homeBlogsSelectedPosts {
          nodes {
            ... on Post {
              ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
            }
          }
        }
        perBlogCardOverrides {
          blogPost {
            databaseId
            title
            slug
          }
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            sourceUrl
          }
        }
      }
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        ${HOME_PAGE_FIELDS_FRAGMENT}
      }
    }
  }
`;

export const GET_HOME_PAGE_BY_ID_LEGACY = `
  query GetHomePageByIdLegacy($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      title
      slug
      uri
      homeBlogsSectionOverridesRoot: homeBlogsSectionOverrides {
        homeBlogsSectionSubtitle
        homeBlogsSectionTitle
        homeBlogsSectionDescription
        homeBlogsSelectedPosts {
          nodes {
            ... on Post {
              ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
            }
          }
        }
      }
      homePagePortfolioListingRoot: homePagePortfolioListing {
        homePortfolioListingSubtitle
        homePortfolioListingTitle
        homePortfolioListingDescription
        homePortfolioListingCards {
          cardSubtitle
          cardTitle
          cardDescription
          cardImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
        }
        homePortfolioPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      homePage {
        ${HOME_PAGE_FIELDS_FRAGMENT_LEGACY}
      }
    }
  }
`;

/** Front page URI – change if your home slug is different */
export const HOME_PAGE_URI = "/";

/** When set (e.g. "226"), home is fetched by database ID first so ACF data is correct. */
const HOME_PAGE_ID = process.env.NEXT_PUBLIC_HOME_PAGE_ID;

// -----------------------------------------------------------------------------
// Types (match GraphQL / ACF structure)
// -----------------------------------------------------------------------------

export type HomeHeroSection = {
  heroVideo?: { node?: { sourceUrl?: string; mediaItemUrl?: string | null } } | null;
  /** Plain URL from ACF (e.g. external MP4/WebM) — preferred over Media `heroVideo` when set */
  heroVideoUrl?: string | null;
  /** Optional mobile-only hero video — connection in WPGraphQL, or string URL if ACF return format is “URL” */
  heroVideoMobile?:
    | string
    | { node?: { sourceUrl?: string; mediaItemUrl?: string | null } }
    | null;
  /** Plain mobile hero video URL — preferred over Media `heroVideoMobile` when set */
  heroVideoMobileUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  /** When ACF GraphQL exposes the image as `heroImage` */
  heroImage?: { node?: { sourceUrl?: string; altText?: string | null; mediaItemUrl?: string | null } } | null;
  /** ACF field name `heroimage` — common WPGraphQL shape for the Home hero image */
  heroimage?: { node?: { sourceUrl?: string; altText?: string | null; mediaItemUrl?: string | null } } | null;
  /** Optional mobile-only poster — Media connection or string URL if ACF return format is “URL” */
  heroImageMobile?:
    | string
    | { node?: { sourceUrl?: string; altText?: string | null; mediaItemUrl?: string | null } }
    | null;
};

export type HomeIntroSection = {
  introParagraph?: string | null;
  introBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
};

export type ShowcaseCard = {
  cardType?: string | string[] | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
  backgroundClass?: string | null;
  textColorClass?: string | null;
};

export type HomeStudio = {
  title?: string | null;
  description?: string | null;
  video?: { node?: { sourceUrl?: string; mediaItemUrl?: string | null } } | null;
  /** Plain video URL — preferred over Media `video` when set */
  videoUrl?: string | null;
  link?: string | null;
  /** CTA label for the studio card button */
  buttonText?: string | null;
};

export type HomeGenaiSection = {
  heading?: string | null;
  paragraph?: string | null;
  video?: { node?: { sourceUrl?: string; mediaItemUrl?: string } } | null;
  /** Plain video URL — preferred over Media `video` when set */
  genaiVideoUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
};

export type HomeBlog = {
  category?: string | null;
  title?: string | null;
  description?: string | null;
  image?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
  link?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
};

export type AccordionItem = {
  faqTitle?: string | null;
  faqContent?: string | null;
};

export type HomeFeaturedPortfolio = {
  databaseId?: number | null;
  slug?: string | null;
  title?: string | null;
  uri?: string | null;
  excerpt?: string | null;
  homePortfolioListing?: {
    portfolioListingSubtitle?: string | null;
    portfolioListingTitle?: string | null;
    portfolioListingDescription?: string | null;
    portfolioListingCards?: Array<HomePortfolioListingCard | null> | null;
  } | null;
  portfolioDetails?: {
    listingCard?: {
      portfolioSubtitle?: string | null;
      portfolioTitle?: string | null;
      portfolioDescription?: string | null;
      portfolioImage?: {
        node?: {
          sourceUrl?: string | null;
          mediaItemUrl?: string | null;
          altText?: string | null;
        } | null;
      } | null;
    } | null;
    portfolioDetails?: {
      backgroundImage?: {
        node?: { sourceUrl?: string; mediaItemUrl?: string } | null;
      } | null;
      industryTitle?: string | null;
    } | null;
    backgroundImage?: { node?: { sourceUrl?: string } } | null;
    heroBackgroundImage?: { node?: { sourceUrl?: string } } | null;
  } | null;
};

export type HomePortfolioListingCard = {
  cardSubtitle?: string | null;
  cardTitle?: string | null;
  cardDescription?: string | null;
  cardImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
    } | null;
  } | null;
};

type HomePortfolioPostConnection = {
  nodes?: Array<{
    databaseId?: number | null;
    slug?: string | null;
    title?: string | null;
  } | null> | null;
} | null;

type HomeOfferImage = {
  node?: {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    altText?: string | null;
  } | null;
};

export type HomeOfferCardConfig = {
  cardKind?: string | string[] | null;
  isMini?: boolean | null;
  customTitle?: string | null;
  customDescription?: string | null;
  customArt?: HomeOfferImage | null;
  customBackground?: HomeOfferImage | null;
  customPopupEnabled?: boolean | null;
  popupTitle?: string | null;
  popupDescription?: string | null;
  popupImage?: HomeOfferImage | null;
  popupBackground?: HomeOfferImage | null;
  popupCtaText?: string | null;
  popupCtaLink?: string | null;
  popupImagePosition?: string | string[] | null;
};

export type HomeServiceOfferCardConfig = {
  serviceCard?: string | string[] | null;
  cardKind?: string | string[] | null;
  isMini?: boolean | null;
};

export type HomeServiceOfferColumnConfig = {
  columnLabel?: string | null;
  offerCards?: Array<HomeServiceOfferCardConfig | null> | null;
};

export type HomeOfferColumnConfig = {
  columnLabel?: string | null;
  offerCards?: Array<HomeOfferCardConfig | null> | null;
};

export type HomePageFields = {
  homeHeroSection?: HomeHeroSection | null;
  homeIntroSection?: HomeIntroSection | null;
  showcaseBeforeImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
  showcaseLogoImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
  showcaseHeadline?: string | null;
  showcaseDescription?: string | null;
  showcaseCards?: ShowcaseCard[] | null;
  homeStudios?: HomeStudio[] | null;
  homeGenaiSection?: HomeGenaiSection | null;
  ourWorkTitle?: string | null;
  // Backward-compatible optional placement if a schema nests this under homePage.
  homePagePortfolioListing?: {
    homePortfolioListingSubtitle?: string | null;
    homePortfolioListingTitle?: string | null;
    homePortfolioListingDescription?: string | null;
    homePortfolioListingCards?: Array<HomePortfolioListingCard | null> | null;
    homePortfolioPerPortfolioItems?: Array<{
      portfolioPost?: number | string | HomePortfolioPostConnection | null;
      sectionSubtitle?: string | null;
      sectionTitle?: string | null;
      sectionDescription?: string | null;
      portfolioSubtitle?: string | null;
      portfolioTitle?: string | null;
      portfolioDescription?: string | null;
      portfolioImage?: {
        node?: {
          sourceUrl?: string | null;
          mediaItemUrl?: string | null;
        } | null;
      } | null;
      portfolioCards?: Array<HomePortfolioListingCard | null> | null;
    } | null> | null;
  } | null;
  homeFeaturedPortfolios?: { nodes?: (HomeFeaturedPortfolio | null)[] } | null;
  featurePortfolioHome?: { nodes?: (HomeFeaturedPortfolio | null)[] } | null;
  clientLogos?: Array<{
    logoName?: string | null;
    logoImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
  } | null> | null;
  /** @deprecated Legacy single composite clients image */
  clientsLogo?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
  homeTestimonials?: Array<{
    testimonialQuote?: string | null;
    testimonialAuthor?: string | null;
    testimonialRole?: string | null;
    testimonialCompany?: string | null;
    highlightCompany?: boolean | null;
    testimonialImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
  } | null> | null;
  homeOffersHeading?: string | null;
  homeOffersDescription?: string | null;
  homeOffersCtaText?: string | null;
  homeOffersCtaLink?: string | null;
  homeOffersSource?: string | string[] | null;
  homeServiceOfferColumns?: Array<HomeServiceOfferColumnConfig | null> | null;
  homeOfferColumns?: Array<HomeOfferColumnConfig | null> | null;
  blogsSectionTitle?: string | null;
  /** Selected blogs from Home Page > Blogs Section (relationship, unlimited). */
  homeFeaturedBlogPosts?: {
    nodes?: Array<BlogPostNode | null> | null;
  } | null;
  /** @deprecated Legacy field name — use homeFeaturedBlogPosts after ACF sync. */
  homeBlogsSelectedPosts?: {
    nodes?: Array<BlogPostNode | null> | null;
  } | null;
  homeBlogsSectionOverrides?: {
    homeBlogsSectionSubtitle?: string | null;
    homeBlogsSectionTitle?: string | null;
    homeBlogsSectionDescription?: string | null;
    perBlogCardOverrides?: Array<{
      blogPost?: {
        databaseId?: number | null;
        title?: string | null;
        slug?: string | null;
      } | null;
      cardSubtitle?: string | null;
      cardTitle?: string | null;
      cardDescription?: string | null;
      cardImage?: {
        sourceUrl?: string | null;
      } | null;
    } | null> | null;
    homeBlogsSelectedPosts?:
      | Array<{
          databaseId?: number | null;
          title?: string | null;
          slug?: string | null;
          uri?: string | null;
          excerpt?: string | null;
          date?: string | null;
          categories?: { nodes?: Array<{ name?: string | null; slug?: string | null } | null> | null } | null;
          featuredImage?: {
            node?: {
              sourceUrl?: string | null;
              mediaItemUrl?: string | null;
              altText?: string | null;
            } | null;
          } | null;
        } | null>
      | {
          nodes?: Array<{
            databaseId?: number | null;
            title?: string | null;
            slug?: string | null;
            uri?: string | null;
            excerpt?: string | null;
            date?: string | null;
            categories?: { nodes?: Array<{ name?: string | null; slug?: string | null } | null> | null } | null;
            featuredImage?: {
              node?: {
                sourceUrl?: string | null;
                mediaItemUrl?: string | null;
                altText?: string | null;
              } | null;
            } | null;
          } | null> | null;
        }
      | {
          edges?: Array<{
            node?: {
              databaseId?: number | null;
              title?: string | null;
              slug?: string | null;
              uri?: string | null;
              excerpt?: string | null;
              date?: string | null;
              categories?: { nodes?: Array<{ name?: string | null; slug?: string | null } | null> | null } | null;
              featuredImage?: {
                node?: {
                  sourceUrl?: string | null;
                  mediaItemUrl?: string | null;
                  altText?: string | null;
                } | null;
              } | null;
            } | null;
          } | null> | null;
        }
      | null;
  } | null;
  homeBlogs?: HomeBlog[] | null;
  accordionTitle?: string | null;
  accordionItems?: AccordionItem[] | null;
};

export type HomePageData = {
  page?: {
    id?: string | null;
    title?: string | null;
    slug?: string | null;
    uri?: string | null;
    homeBlogsSectionOverridesRoot?: HomePageFields["homeBlogsSectionOverrides"] | null;
    homeBlogsSectionOverrides?: HomePageFields["homeBlogsSectionOverrides"] | null;
    homePagePortfolioListingRoot?: {
      homePortfolioListingSubtitle?: string | null;
      homePortfolioListingTitle?: string | null;
      homePortfolioListingDescription?: string | null;
      homePortfolioListingCards?: Array<HomePortfolioListingCard | null> | null;
      homePortfolioPerPortfolioItems?: Array<{
        portfolioPost?: number | string | HomePortfolioPostConnection | null;
        sectionSubtitle?: string | null;
        sectionTitle?: string | null;
        sectionDescription?: string | null;
        portfolioSubtitle?: string | null;
        portfolioTitle?: string | null;
        portfolioDescription?: string | null;
        portfolioImage?: {
          node?: {
            sourceUrl?: string | null;
            mediaItemUrl?: string | null;
          } | null;
        } | null;
        portfolioCards?: Array<HomePortfolioListingCard | null> | null;
      } | null> | null;
    } | null;
    homePagePortfolioListing?: {
      homePortfolioListingSubtitle?: string | null;
      homePortfolioListingTitle?: string | null;
      homePortfolioListingDescription?: string | null;
      homePortfolioListingCards?: Array<HomePortfolioListingCard | null> | null;
      homePortfolioPerPortfolioItems?: Array<{
        portfolioPost?: number | string | HomePortfolioPostConnection | null;
        sectionSubtitle?: string | null;
        sectionTitle?: string | null;
        sectionDescription?: string | null;
        portfolioSubtitle?: string | null;
        portfolioTitle?: string | null;
        portfolioDescription?: string | null;
        portfolioImage?: {
          node?: {
            sourceUrl?: string | null;
            mediaItemUrl?: string | null;
          } | null;
        } | null;
        portfolioCards?: Array<HomePortfolioListingCard | null> | null;
      } | null> | null;
    } | null;
    homePage?: HomePageFields | null;
    homePageFields?: HomePageFields | null;
  } | null;
};

/** Helper: get ACF data from page (works for both homePage and homePageFields) */
export function getHomePageFields(data: HomePageData): HomePageFields | null {
  const page = data?.page;
  const homePage = page?.homePage;
  const homePageFields = page?.homePageFields;
  const hasHomePage = !!homePage && typeof homePage === "object" && Object.keys(homePage).length > 0;
  const hasHomePageFields =
    !!homePageFields && typeof homePageFields === "object" && Object.keys(homePageFields).length > 0;
  const base = (
    hasHomePage ? homePage : hasHomePageFields ? homePageFields : homePage ?? homePageFields ?? null
  ) as HomePageFields | null;
  const pageLevelListing = page?.homePagePortfolioListingRoot ?? page?.homePagePortfolioListing ?? null;
  const pageLevelBlogsOverrides =
    page?.homeBlogsSectionOverridesRoot ?? page?.homeBlogsSectionOverrides ?? null;
  if (!base && !pageLevelListing && !pageLevelBlogsOverrides) return null;
  if (!base) {
    return {
      ...(pageLevelListing ? { homePagePortfolioListing: pageLevelListing } : {}),
      ...(pageLevelBlogsOverrides ? { homeBlogsSectionOverrides: pageLevelBlogsOverrides } : {}),
    };
  }
  return {
    ...base,
    homePagePortfolioListing: base.homePagePortfolioListing ?? pageLevelListing,
    homeBlogsSectionOverrides: base.homeBlogsSectionOverrides ?? pageLevelBlogsOverrides,
  };
}

// -----------------------------------------------------------------------------
// CWIT schema types (aapke WordPress GraphQL response ke hisaab se)
// -----------------------------------------------------------------------------
type CwitHeroSection = {
  heading?: string | null;
  subHeading?: string | null;
  heroImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
};
type CwitAboutSection = {
  title?: string | null;
  description?: string | null;
  image?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
};
type CwitService = {
  serviceTitle?: string | null;
  serviceDescription?: string | null;
  serviceIcon?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
};
type CwitOurWorkSection = {
  title?: string | null;
  description?: string | null;
  portfolios?: {
    nodes?: Array<{
      databaseId?: number | null;
      title?: string | null;
      slug?: string | null;
      uri?: string | null;
      excerpt?: string | null;
      featuredImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
      portfolioDetails?: { backgroundImage?: { node?: { sourceUrl?: string } } | null } | null;
    } | null>;
  } | null;
};
type CwitBlogsSection = {
  title?: string | null;
  description?: string | null;
  blogs?: {
    nodes?: Array<{
      databaseId?: number | null;
      title?: string | null;
      slug?: string | null;
      uri?: string | null;
      excerpt?: string | null;
      featuredImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
    } | null>;
  } | null;
};
type CwitBlogsSectionOverrides = {
  homeBlogsSelectedPosts?: {
    nodes?: Array<{
      databaseId?: number | null;
      id?: string | null;
      title?: string | null;
      slug?: string | null;
      uri?: string | null;
      excerpt?: string | null;
      featuredImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
    } | null>;
  } | null;
};
type CwitHomePage = {
  title?: string | null;
  description?: string | null;
  heroSection?: CwitHeroSection | null;
  aboutSection?: CwitAboutSection | null;
  servicesSection?: { title?: string | null; services?: (CwitService | null)[] | null } | null;
  ourWorkSection?: CwitOurWorkSection | null;
  blogsSection?: CwitBlogsSection | null;
  homeBlogsSectionOverrides?: CwitBlogsSectionOverrides | null;
};

function getCwitMediaUrl(node: { node?: { sourceUrl?: string } } | null | undefined): string | undefined {
  const url = node?.node?.sourceUrl?.trim();
  return url || undefined;
}

/** CWIT schema response ko frontend ke HomePageFields shape mein map karta hai */
function mapCwitHomePageToHomePageFields(cwit: CwitHomePage | null | undefined): HomePageFields | null {
  if (!cwit || typeof cwit !== "object") return null;

  const hero = cwit.heroSection;
  const about = cwit.aboutSection;
  const services = cwit.servicesSection;
  const ourWork = cwit.ourWorkSection;
  const blogsSection = cwit.blogsSection;
  const overrides = cwit.homeBlogsSectionOverrides;

  const mapped: HomePageFields = {};

  if (hero) {
    mapped.homeHeroSection = {
      heroTitle: hero.heading?.trim() ?? null,
      heroSubtitle: hero.subHeading?.trim() ?? null,
      heroVideo: undefined,
      heroImage: hero.heroImage ?? undefined,
    };
  }

  if (about) {
    const desc = about.description?.trim() || about.title?.trim();
    mapped.homeIntroSection = {
      introParagraph: desc ?? null,
      introBackgroundImage: about.image
        ? { node: { sourceUrl: about.image.node?.sourceUrl ?? undefined, altText: about.image.node?.altText ?? null } }
        : undefined,
    };
  }

  if (services?.services?.length) {
    mapped.showcaseHeadline = services.title?.trim() ?? undefined;
    mapped.showcaseCards = services.services.filter(Boolean).map((s) => {
      const svc = s as CwitService;
      return {
        cardType: "text" as const,
        title: svc.serviceTitle?.trim() ?? null,
        subtitle: null,
        description: svc.serviceDescription?.trim() ?? null,
        image: svc.serviceIcon
          ? { node: { sourceUrl: svc.serviceIcon.node?.sourceUrl ?? undefined, altText: svc.serviceIcon.node?.altText ?? null } }
          : undefined,
        backgroundClass: null,
        textColorClass: null,
      };
    });
  }

  if (ourWork?.portfolios?.nodes?.length) {
    const nodes = ourWork.portfolios.nodes.filter((p): p is NonNullable<typeof p> => p != null);
    mapped.ourWorkTitle = ourWork.title?.trim() ?? undefined;
    mapped.featurePortfolioHome = {
      nodes: nodes.map((n) => ({
        databaseId: n.databaseId ?? null,
        slug: n.slug?.trim() ?? null,
        title: n.title?.trim() ?? null,
        uri: n.uri?.trim() ?? null,
        excerpt: n.excerpt?.trim() ?? null,
        portfolioDetails: {
          backgroundImage: n.featuredImage?.node?.sourceUrl
            ? { node: { sourceUrl: n.featuredImage.node.sourceUrl } }
            : n.portfolioDetails?.backgroundImage ?? undefined,
        },
      })),
    };
  }

  if (blogsSection) {
    mapped.blogsSectionTitle = blogsSection.title?.trim() ?? undefined;
  }

  return Object.keys(mapped).length ? mapped : null;
}

export type GraphQLHomeResponse = {
  data?: HomePageData;
  errors?: Array<{ message: string }>;
};

function hasUsableHomeFields(data: HomePageData | undefined): boolean {
  const homePage = data?.page?.homePage;
  const homePageFields = data?.page?.homePageFields;
  const hasHomePage = !!homePage && typeof homePage === "object" && Object.keys(homePage).length > 0;
  const hasHomePageFields =
    !!homePageFields && typeof homePageFields === "object" && Object.keys(homePageFields).length > 0;
  return hasHomePage || hasHomePageFields;
}

// -----------------------------------------------------------------------------
// Fetch
// -----------------------------------------------------------------------------

/**
 * Fetches the Home (front) page with ACF fields.
 * When NEXT_PUBLIC_HOME_PAGE_ID is set (e.g. 226), fetches by database ID first so
 * featurePortfolioHome and other ACF data match the correct page.
 */
export async function fetchHomePage(
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLHomeResponse> {
  const id = await resolveHomePageId(locale);
  if (id) {
    logHomeDebug("Trying home fetch by database ID", { id });
    const byId = await fetchHomePageById(id, locale);
    if (byId.data?.page) {
      const fields = getHomePageFields(byId.data);
      const usable = hasUsableHomeFields(byId.data);
      logHomeDebug("Home fetch by ID resolved", {
        id,
        hasPage: true,
        hasUsableFields: usable,
        featurePortfolioHomeCount: fields?.featurePortfolioHome?.nodes?.filter(Boolean).length ?? 0,
      });
      if (usable) return byId;
    }
    logHomeDebug("Home fetch by ID returned no page", { id });
  }
  logHomeDebug("Falling back to home fetch by URI", { uri: HOME_PAGE_URI });
  return fetchHomePageByUri(HOME_PAGE_URI, false, locale);
}

/**
 * Fetches home page by URI. Use uri "/" for front page, or your home page slug.
 * Pehle GetHomePageByUri try karti hai (jo aapke GraphQL IDE mein sahi chalti hai); phir CWIT, phir legacy.
 */
export async function fetchHomePageByUri(
  uri: string = HOME_PAGE_URI,
  useHomePageFields: boolean = false,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLHomeResponse> {
  const urisToTry = [uri, "home", "/home/", uri.replace(/^\/+|\/+$/g, "") || uri];

  // 1) Primary: homePage with homeFeaturedBlogPosts (ACF Home Page > Blogs Section > Selected Blogs)
  for (const u of urisToTry) {
    const normalizedUri = u === "/" ? "/" : (u.startsWith("/") ? u : `/${u}`).replace(/^\/+|\/+$/g, "") || u;
    logHomeDebug("Trying GetHomePageByUri (with homeFeaturedBlogPosts)", { requestedUri: u, normalizedUri });
    const res = await fetch(getWordPressGraphqlEndpoint(locale), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: getWordpressGraphqlHeaders(locale),
      body: JSON.stringify({
        query: GET_HOME_PAGE_BY_URI,
        variables: { uri: normalizedUri },
      }),
    });
    const json = (await res.json()) as GraphQLHomeResponse;
    if (!json.errors?.length && json.data?.page?.homePage && hasUsableHomeFields(json.data)) {
      logHomeDebug("Home fetch via GetHomePageByUri succeeded", {
        normalizedUri,
        hasHero: !!json.data?.page?.homePage?.homeHeroSection,
        hasSelectedBlogs:
          !!json.data?.page?.homePage?.homeFeaturedBlogPosts?.nodes?.length ||
          !!json.data?.page?.homePage?.homeBlogsSelectedPosts?.nodes?.length,
      });
      return json;
    }
    const needsLegacyBlogField = json.errors?.some((e) => {
      const m = String(e.message || "").toLowerCase();
      return m.includes("homefeaturedblogposts") || m.includes("home_featured_blog_posts");
    });
    if (needsLegacyBlogField) {
      logHomeDebug("Retrying GetHomePageByUri with legacy homeBlogsSelectedPosts field", { normalizedUri });
      const legacyBlogRes = await fetch(getWordPressGraphqlEndpoint(locale), {
        method: "POST",
        next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
        headers: getWordpressGraphqlHeaders(locale),
        body: JSON.stringify({
          query: GET_HOME_PAGE_BY_URI_WITH_LEGACY_BLOG_FIELD,
          variables: { uri: normalizedUri },
        }),
      });
      const legacyBlogJson = (await legacyBlogRes.json()) as GraphQLHomeResponse;
      if (!legacyBlogJson.errors?.length && legacyBlogJson.data?.page?.homePage && hasUsableHomeFields(legacyBlogJson.data)) {
        return legacyBlogJson;
      }
    }
  }

  // 2) Fallback: same query without selected blogs field (when field not in schema yet)
  for (const u of urisToTry) {
    const normalizedUri = u === "/" ? "/" : (u.startsWith("/") ? u : `/${u}`).replace(/^\/+|\/+$/g, "") || u;
    logHomeDebug("Trying GetHomePageByUri (legacy, no selected blogs field)", { requestedUri: u, normalizedUri });
    const resLegacy = await fetch(getWordPressGraphqlEndpoint(locale), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: getWordpressGraphqlHeaders(locale),
      body: JSON.stringify({
        query: GET_HOME_PAGE_BY_URI_LEGACY,
        variables: { uri: normalizedUri },
      }),
    });
    const jsonLegacy = (await resLegacy.json()) as GraphQLHomeResponse;
    if (!jsonLegacy.errors?.length && jsonLegacy.data?.page?.homePage && hasUsableHomeFields(jsonLegacy.data)) {
      logHomeDebug("Home fetch via GetHomePageByUri (legacy) succeeded", { normalizedUri });
      return jsonLegacy;
    }
  }

  // 3) Legacy: page-level homeBlogsSectionOverrides (if that ACF group still exists)
  for (const u of urisToTry) {
    const normalizedUri = u === "/" ? "/" : (u.startsWith("/") ? u : `/${u}`).replace(/^\/+|\/+$/g, "") || u;
    logHomeDebug("Trying GetHomePageByUri (with page-level homeBlogsSectionOverrides)", { requestedUri: u, normalizedUri });
    const resWithBlogs = await fetch(getWordPressGraphqlEndpoint(locale), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: getWordpressGraphqlHeaders(locale),
      body: JSON.stringify({
        query: GET_HOME_PAGE_BY_URI_WITH_SELECTED_BLOGS,
        variables: { uri: normalizedUri },
      }),
    });
    const jsonWithBlogs = (await resWithBlogs.json()) as GraphQLHomeResponse;
    if (!jsonWithBlogs.errors?.length && jsonWithBlogs.data?.page?.homePage && hasUsableHomeFields(jsonWithBlogs.data)) {
      logHomeDebug("Home fetch via GetHomePageByUri (with overrides) succeeded", { normalizedUri });
      return jsonWithBlogs;
    }
  }

  // 3) CWIT schema fallback
  for (const u of urisToTry) {
    const normalizedUri = u === "/" ? "/" : (u.startsWith("/") ? u : `/${u}`).replace(/^\/+|\/+$/g, "") || u;
    logHomeDebug("Trying CWIT home fetch by URI", { requestedUri: u, normalizedUri });
    const cwitRes = await fetch(getWordPressGraphqlEndpoint(locale), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: getWordpressGraphqlHeaders(locale),
      body: JSON.stringify({
        query: GET_HOME_PAGE_CWIT,
        variables: { uri: normalizedUri },
      }),
    });
    const cwitJson = (await cwitRes.json()) as GraphQLHomeResponse & { data?: { page?: { homePage?: CwitHomePage } } };
    if (!cwitJson.errors?.length && cwitJson.data?.page?.homePage) {
      const cwitHome = cwitJson.data.page.homePage;
      const mapped = mapCwitHomePageToHomePageFields(cwitHome);
      if (mapped) {
        logHomeDebug("Home fetch via CWIT schema succeeded", {
          normalizedUri,
          hasHero: !!mapped.homeHeroSection,
          hasAbout: !!mapped.homeIntroSection,
          hasOurWork: !!mapped.featurePortfolioHome?.nodes?.length,
        });
        return {
          data: {
            page: {
              id: cwitJson.data.page.id,
              title: cwitJson.data.page.title,
              slug: cwitJson.data.page.slug,
              uri: cwitJson.data.page.uri,
              homePage: mapped,
            },
          },
        };
      }
    }
  }

  let lastRes: GraphQLHomeResponse = { data: undefined, errors: undefined };
  let firstPageMatch: GraphQLHomeResponse | null = null;
  const query = useHomePageFields ? GET_HOME_PAGE_AS_FIELDS : GET_HOME_PAGE;

  for (const u of urisToTry) {
    const normalizedUri = u.startsWith("/") ? u : `/${u}`;
    logHomeDebug("Trying home fetch by URI (legacy)", {
      requestedUri: u,
      normalizedUri,
      useHomePageFields,
    });
    const res = await fetch(getWordPressGraphqlEndpoint(locale), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: getWordpressGraphqlHeaders(locale),
      body: JSON.stringify({
        query,
        variables: { uri: normalizedUri === "/" ? "/" : normalizedUri.replace(/^\/+|\/+$/g, "") },
      }),
    });
    const json = (await res.json()) as GraphQLHomeResponse;
    lastRes = json;
    if (json.errors?.length) {
      const shouldRetryLegacy = json.errors.some((e) => {
        const m = String(e.message || "");
        return (
          m.includes('homeBlogsSectionOverrides') ||
          m.includes('homeFeaturedBlogPosts') ||
          m.includes('homeBlogsSelectedPosts') ||
          m.includes('perBlogCardOverrides') ||
          m.includes('showcaseBeforeImage') ||
          m.includes('showcaseLogoImage') ||
          m.includes('showcaseDescription') ||
          m.includes('clientLogos') ||
          m.includes('homeTestimonials') ||
          m.includes('homeOffers') ||
          m.includes('homeOfferColumns') ||
          m.includes('featuredImage') ||
          m.includes('categories')
        );
      });
      if (shouldRetryLegacy) {
        const legacyRes = await fetch(getWordPressGraphqlEndpoint(locale), {
          method: "POST",
          next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
          headers: getWordpressGraphqlHeaders(locale),
          body: JSON.stringify({
            query: GET_HOME_PAGE_LEGACY,
            variables: { uri: normalizedUri === "/" ? "/" : normalizedUri.replace(/^\/+|\/+$/g, "") },
          }),
        });
        const legacyJson = (await legacyRes.json()) as GraphQLHomeResponse;
        if (!legacyJson.errors?.length && legacyJson.data?.page) {
          return legacyJson;
        }
      }
      logHomeDebug("Home URI fetch GraphQL errors", {
        normalizedUri,
        errors: json.errors.map((e) => e.message),
      });
      continue;
    }
    if (json.data?.page && !firstPageMatch) firstPageMatch = json;
    const fields = json.data ? getHomePageFields(json.data) : null;
    logHomeDebug("Home URI fetch result", {
      normalizedUri,
      hasPage: !!json.data?.page,
      hasUsableFields: hasUsableHomeFields(json.data),
      featurePortfolioHomeCount: fields?.featurePortfolioHome?.nodes?.filter(Boolean).length ?? 0,
    });
    if (hasUsableHomeFields(json.data)) return json;
  }

  logHomeDebug("No usable home fields found by URI trials; returning first page match or last response");
  return firstPageMatch ?? lastRes;
}

/**
 * Fetches home page by WordPress database ID (e.g. Settings → Reading → Homepage = 42).
 */
export async function fetchHomePageById(
  id: number | string,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLHomeResponse> {
  const res = await fetch(getWordPressGraphqlEndpoint(locale), {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: getWordpressGraphqlHeaders(locale),
    body: JSON.stringify({
      query: GET_HOME_PAGE_BY_ID,
      variables: { id: String(id) },
    }),
  });
  const json = (await res.json()) as GraphQLHomeResponse;
  if (json.errors?.length) {
    const shouldRetryLegacy = json.errors.some((e) => {
      const m = String(e.message || "");
      return (
        m.includes('homeBlogsSectionOverrides') ||
        m.includes('homeFeaturedBlogPosts') ||
        m.includes('homeBlogsSelectedPosts') ||
        m.includes('perBlogCardOverrides') ||
        m.includes('showcaseBeforeImage') ||
        m.includes('showcaseLogoImage') ||
        m.includes('featuredImage') ||
        m.includes('categories')
      );
    });
    if (shouldRetryLegacy) {
      const legacyRes = await fetch(getWordPressGraphqlEndpoint(locale), {
        method: "POST",
        next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
        headers: getWordpressGraphqlHeaders(locale),
        body: JSON.stringify({
          query: GET_HOME_PAGE_BY_ID_LEGACY,
          variables: { id: String(id) },
        }),
      });
      const legacyJson = (await legacyRes.json()) as GraphQLHomeResponse;
      if (!legacyJson.errors?.length && legacyJson.data?.page) {
        return legacyJson;
      }
    }
    logHomeDebug("Home ID fetch GraphQL errors", {
      id: String(id),
      errors: json.errors.map((e) => e.message),
    });
  }
  const fields = json.data ? getHomePageFields(json.data) : null;
  logHomeDebug("Home ID fetch result", {
    id: String(id),
    hasPage: !!json.data?.page,
    hasUsableFields: hasUsableHomeFields(json.data),
    featurePortfolioHomeCount: fields?.featurePortfolioHome?.nodes?.filter(Boolean).length ?? 0,
  });
  return json;
}

type HomeFeaturedBlogsQueryData = {
  page?: {
    homePage?: {
      homeFeaturedBlogPosts?: { nodes?: Array<BlogPostNode | null> | null } | null;
    } | null;
  } | null;
};

/**
 * Live Selected Blogs from a home page (no-store).
 * Pass "en" for the shared selection source used by both EN and AR UIs.
 */
export async function fetchHomeFeaturedBlogSelection(
  locale: AppLocale
): Promise<BlogPostNode[]> {
  const pageId =
    locale === "ar"
      ? process.env.NEXT_PUBLIC_HOME_PAGE_ID_AR?.trim() ||
        process.env.NEXT_PUBLIC_HOME_PAGE_ID?.trim()
      : process.env.NEXT_PUBLIC_HOME_PAGE_ID?.trim();
  if (!pageId) return [];

  const query = `
    query GetHomeFeaturedBlogSelection($id: ID!) {
      page(id: $id, idType: DATABASE_ID) {
        homePage {
          homeFeaturedBlogPosts(first: 100) {
            nodes {
              ... on Post {
                ${HOME_SELECTED_BLOG_POST_FIELDS.trim()}
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(getWordPressGraphqlEndpoint(locale), {
    method: "POST",
    cache: "no-store",
    headers: getWordpressGraphqlHeaders(locale),
    body: JSON.stringify({ query, variables: { id: pageId } }),
  });
  if (!res.ok) return [];

  const json = (await res.json()) as GraphQLResponse<HomeFeaturedBlogsQueryData>;
  return (json.data?.page?.homePage?.homeFeaturedBlogPosts?.nodes ?? []).filter(
    (post): post is BlogPostNode => Boolean(post?.databaseId || post?.title?.trim())
  );
}

export type HomePortfolioListingNode = {
  databaseId?: number | null;
  slug?: string | null;
  title?: string | null;
  uri?: string | null;
  excerpt?: string | null;
  language?: { code?: string | null } | null;
  homePortfolioListing?: HomeFeaturedPortfolio["homePortfolioListing"];
  portfolioDetails?: HomeFeaturedPortfolio["portfolioDetails"];
};

/** Live portfolio node for listing cards (locale-aware). */
export async function fetchPortfolioListingById(
  id: string,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<HomePortfolioListingNode | null> {
  const query = `
    query GetPortfolioListingById($id: ID!) {
      portfolio(id: $id, idType: DATABASE_ID) {
        databaseId
        slug
        title
        uri
        excerpt
        language {
          code
        }
        homePortfolioListing {
          portfolioListingSubtitle
          portfolioListingTitle
          portfolioListingDescription
        }
        portfolioDetails {
          listingCard {
            portfolioSubtitle
            portfolioTitle
            portfolioDescription
            portfolioImage {
              node {
                sourceUrl
                mediaItemUrl
                altText
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(getWordPressGraphqlEndpoint(locale), {
    method: "POST",
    cache: "no-store",
    headers: getWordpressGraphqlHeaders(locale),
    body: JSON.stringify({ query, variables: { id } }),
  });
  if (!res.ok) return null;

  const json = (await res.json()) as GraphQLResponse<{
    portfolio?: HomePortfolioListingNode | null;
  }>;
  const node = json.data?.portfolio;
  return node?.databaseId != null || node?.title?.trim() ? node ?? null : null;
}
