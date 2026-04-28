import { createClient } from "next-sanity";

/**
 * Fallbacks keep the build green when the env vars aren't configured
 * (e.g. on a fresh Vercel deploy before Sanity is wired up).
 * `placeholder` is a syntactically valid projectId that just won't fetch any data.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET   || "production";

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-30",
  useCdn: true,
  token: process.env.SANITY_WRITE_TOKEN,
  stega: {
    enabled: false,
    studioUrl: "/admin",
  },
});

export const SETTINGS = `*[_type == "settings"][0]{
  title,
  _type,
  enablePopup,
  popup1,
  popup2,
  popup1_title,
  popup2_title
}`;

export const NAVIGATION = `*[_type == "navigation"][0]{
  title,
  _type,
  "header_logo": header_logo.asset->url,
  "header_logo2": header_logo2.asset->url,

  "footer_logo": footer_logo.asset->url,
  header_menu[]{
    title,
    link,
    linkId,
    page{
      slug->{
        "slug": slug.current
        }
      },
      subMenu[]{
      title,
      custom_links,
      link,
      page{
        slug->{
          "slug": slug.current
          },
        },
      },
    },
   footer_menu[]{
    title,
    link
  },
  social_links[]{
    title,
    link
  },
  contact_email,
  location,
  copywrite,
  company_info
}`;

export const HEADER = `*[_type == "navigation"][0]{
  title,
  _type,
  "header_logo": header_logo.asset->url,
  "header_logo2": header_logo2.asset->url,
  "footer_logo": footer_logo.asset->url,
  location,
  services,
  about,
  company_info,
  footer_menu[] {
    title,
    link
  },
  header_menu[]{
    title,
    link,
    page{
      slug->{
        "slug": slug.current
        }
      },
      subMenu[]{
      title,
      custom_links,
      link,
      page{
        slug->{
          "slug": slug.current
          },
        },
      },
    },
}`;

export const FOOTER = `*[_type == "navigation"][0]{
  title,
  _type,
  "footer_logo": footer_logo.asset->url,
  "header_logo": header_logo.asset->url,
  contact_email,
  location,
  services,
  about,
  company_info,
  footer_menu[] {
    title,
    link
  }
}`;

export const homeQuery = `*[_type == "home"][0]{
    title,
    "slug": slug.current,
    _id,
    _rev,
    _type,
    _createdAt,
    _updatedAt,
    "mainImage": mainImage.asset->url,
    hero{
      heading,
      description,
      icons[] {
      "image":image.asset->url,
      link
      },
      buttonLabel,
      buttonLink,
      featured_Image[] {
      "image":image.asset->url,
      position_type
      }
    },
    components[]{
      ...,
      "image_mobile":image_mobile.asset->url,
      "image_desktop":image_desktop.asset->url,
      "image_background":image_background.asset->url,
      "image_background_mobile":image_background_mobile.asset->url,
      "logo_title":logo_title.asset->url,
      image_caption,
      increase_spacing_content,
      "logo":logo.asset->url,
      layout,
      "image": image.asset->url,
      images[] {
        "image": asset->url
      },
      columns[] {
        title,
        description,
        centerTitles,
        link,
        "svg": svg.asset->url,
        iconBgColor,
        linkId
      },
        stats[] {
          value,
          numericValue,
          suffix,
          label
        },
      multiCol_items[] {
        title,
        description,
        badge,
        featured
      },
        multiColumns3_items[]{
      name,
      position,
      description,
      badge,
      rating,
      featured
    },
    }
  }
`;

export const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    _id,
    _rev,
    _type,
    _createdAt,
    _updatedAt,
    "mainImage": mainImage.asset->url,
    hide_title,
    hero{
      heading,
      description,
      icons[] {
      "image":image.asset->url,
      link
      },
      buttonLabel,
      buttonLink,
      featured_Image[] {
      "image":image.asset->url,
      position_type
      }
    },
    components[]{
      ...,
      "image_mobile":image_mobile.asset->url,
      "image_desktop":image_desktop.asset->url,
      "image_background":image_background.asset->url,
      "image_background_mobile":image_background_mobile.asset->url,
      "logo_title":logo_title.asset->url,
      image_caption,
      increase_spacing_content,
      "logo":logo.asset->url,
      layout,
      "image": image.asset->url,
      images[] {
        "image": asset->url
      },
      columns[] {
        title,
        description,
        centerTitles,
        link,
        "svg": svg.asset->url,
        iconBgColor,
        linkId
      },
        stats[] {
          value,
          numericValue,
          suffix,
          label
        },
      multiCol_items[] {
        title,
        description,
        badge,
        featured
      },
        multiColumns3_items[]{
      name,
      position,
      description,
      badge,
      rating,
      featured
    },
    }
  }
`;

export const ALLPAGE_QUERY = `*[_type == "page"]{
  title,
  "slug": slug.current,
  _type,
  "image": image.asset->url,
  meta_description,
  background_color,
  "meta_image": meta_image.asset->url,
  components[]{
    ...,
    "image_mobile":image_mobile.asset->url,
    "image_desktop":image_desktop.asset->url,
    "logo_title":logo_title.asset->url,
    images[] {
      "image": image.asset->url
    },
    title,
    description,
    button_label,
    button_link,
    features[]{
      title,
      description,
      icon{
        asset->{
          url,
        }
      }
    },
  }
}`;
