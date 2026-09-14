/**
 * WordPress WPGraphQL API for Contact Us page.
 * Fetches ACF data for the Contact Us page.
 */

import {
  getWordPressGraphqlEndpoint,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import { resolveContactFormProps, type ResolvedContactFormProps } from "@/app/lib/contact-form-config";

export const CONTACT_PAGE_URI =
  process.env.NEXT_PUBLIC_CONTACT_PAGE_URI || "/contact-us/";

const CONTACT_PAGE_BASE_QUERY = `
  query GetContactPage($id: ID!, $idType: PageIdType!) {
    page(id: $id, idType: $idType) {
      title
      slug
      contactPage {
        contactBanner {
          bannerTitle
          bannerDescription
          bannerBackgroundImage {
            node {
              sourceUrl
              altText
            }
          }
        }
        contactFormSettings {
          __CONTACT_FORM_SETTINGS_FIELDS__
        }
        contactMapLocations {
          name
          address
          latitude
          longitude
        }
        contactAccordionTitle
        contactAccordionItems {
          faqTitle
          faqContent
        }
      }
    }
  }
`;

// -----------------------------------------------------------------------------
// GraphQL Query
// -----------------------------------------------------------------------------
const DEFAULT_CONTACT_FORM_SETTING_FIELDS = [
  "recipientEmail",
  "submitButtonText",
  "successMessage",
];

let contactFormSettingsFieldsPromise: Promise<string[]> | null = null;

type GraphQLFieldTypeRef = {
  name?: string | null;
  kind?: string | null;
  ofType?: GraphQLFieldTypeRef | null;
};

function unwrapGraphQLType(type: GraphQLFieldTypeRef | null | undefined): GraphQLFieldTypeRef | null {
  let current = type ?? null;
  while (current?.ofType) current = current.ofType;
  return current;
}

async function fetchContactFormSettingsFields(): Promise<string[]> {
  if (contactFormSettingsFieldsPromise) return contactFormSettingsFieldsPromise;

  contactFormSettingsFieldsPromise = (async () => {
    try {
      const introspectionQuery = `
        {
          __type(name: "ContactPageContactFormSettings") {
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `;

      const res = await fetch(getWordPressGraphqlEndpoint(), {
        method: "POST",
        next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: introspectionQuery }),
      });
      const json = await res.json();
      const fields = (json?.data?.__type?.fields ?? []) as Array<{
        name?: string | null;
        type?: GraphQLFieldTypeRef | null;
      }>;

      const scalarFields = fields
        .filter((field) => {
          const leaf = unwrapGraphQLType(field.type);
          return !!field.name && leaf?.kind === "SCALAR";
        })
        .map((field) => field.name?.trim())
        .filter((name): name is string => !!name);

      return scalarFields.length ? scalarFields : DEFAULT_CONTACT_FORM_SETTING_FIELDS;
    } catch {
      return DEFAULT_CONTACT_FORM_SETTING_FIELDS;
    }
  })();

  return contactFormSettingsFieldsPromise;
}

function buildContactPageQuery(contactFormSettingFields: string[]): string {
  const selection = contactFormSettingFields.length
    ? contactFormSettingFields.join("\n")
    : DEFAULT_CONTACT_FORM_SETTING_FIELDS.join("\n");
  return CONTACT_PAGE_BASE_QUERY.replace("__CONTACT_FORM_SETTINGS_FIELDS__", selection);
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ContactBanner = {
  bannerTitle?: string | null;
  bannerDescription?: string | null;
  bannerBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
};

export type ContactFormSettings = {
  recipientEmail?: string | null;
  submitButtonText?: string | null;
  successMessage?: string | null;
  [key: string]: unknown;
};

export type ContactMapLocation = {
  name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type ContactAccordionItem = {
  faqTitle?: string | null;
  faqContent?: string | null;
};

export type ContactPageFields = {
  contactBanner?: ContactBanner | null;
  contactFormSettings?: ContactFormSettings | null;
  contactMapLocations?: ContactMapLocation[] | null;
  contactAccordionTitle?: string | null;
  contactAccordionItems?: ContactAccordionItem[] | null;
};

export type GraphQLContactResponse = {
  data?: {
    page?: {
      title?: string | null;
      slug?: string | null;
      contactPage?: ContactPageFields | null;
    } | null;
  } | null;
  errors?: Array<{ message: string }> | null;
};

type ContactPageIdType = "DATABASE_ID" | "URI";

// -----------------------------------------------------------------------------
// Fetch
// -----------------------------------------------------------------------------

export async function fetchContactPage(
  id: number | string,
  idType: ContactPageIdType = "URI"
): Promise<GraphQLContactResponse> {
  const contactFormSettingsFields = await fetchContactFormSettingsFields();
  const query = buildContactPageQuery(contactFormSettingsFields);
  const res = await fetch(getWordPressGraphqlEndpoint(), {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { id: String(id), idType },
    }),
  });
  return (await res.json()) as GraphQLContactResponse;
}

export async function fetchDefaultContactPage(): Promise<GraphQLContactResponse> {
  return fetchContactPage(CONTACT_PAGE_URI, "URI");
}

/** Extract contactPage fields from response */
export function getContactPageFields(data: GraphQLContactResponse["data"]): ContactPageFields | null {
  return data?.page?.contactPage ?? null;
}

export async function fetchDefaultContactFormProps(): Promise<ResolvedContactFormProps> {
  try {
    const res = await fetchDefaultContactPage();
    const fields = getContactPageFields(res.data);
    return resolveContactFormProps(
      (fields?.contactFormSettings ?? undefined) as Record<string, unknown> | undefined
    );
  } catch {
    return resolveContactFormProps(undefined);
  }
}
