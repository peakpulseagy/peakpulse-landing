/* eslint-disable @typescript-eslint/no-explicit-any */
import {defineQuery, SanityDocument} from "next-sanity";
import {ALLPAGE_QUERY, client} from "../../sanity/lib/client";
import {PAGE_QUERY} from "../../sanity/lib/client";
import Pages from "../../components/pages/Pages";
import {Metadata} from "next";
import { sanityFetch } from "@/sanity/lib/live";
import { notFound } from "next/navigation";

type Params = {slug: string};

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<Params>;
// }): Promise<Metadata> {
//   const { slug } = await params;
//   const query = defineQuery(PAGE_QUERY);
  

//   const page = await client.fetch<SanityDocument>(PAGE_QUERY, {slug});

//   if (!page) {
//     const fallbackTitle = "404: Lost in Space-Time Continuum";
//     return {
//       title: fallbackTitle,
//       description: "This page could not be found.",
//       openGraph: {
//         title: fallbackTitle,
//         description: "This page could not be found.",
//         url: `https://ledger-rocket.vercel.app/${slug}`,
//         siteName: "Ledger Rocket",
//         images: [],
//         type: "website",
//       },
//     };
//   }

//   const aspectRatio = 1.91;
//   const width = 1200;
//   const height = Math.min(630, Math.round(width / aspectRatio));

//   const metaTitle = `Resolve Cap | ${page.title ?? slug}`;

//   return {
//     title: metaTitle,
//     description: page.meta_description ?? "Resolve Cap official page",
//     openGraph: {
//       title: metaTitle,
//       description: page.meta_description ?? "Resolve Cap official page",
//       url: `https://ledger-rocket.vercel.app/${slug}`,
//       siteName: "Resolve Cap",
//       images: page.meta_image
//         ? [
//             {
//               url: page.meta_image,
//               width,
//               height,
//               alt: page.title ?? "Resolve Cap",
//             },
//           ]
//         : [],
//       type: "website",
//     },
//     other: {
//       "Permissions-Policy":
//         "payment=(), microphone=(), camera=(), geolocation=()",
//     },
//   };
// }

export default async function Page({ params }: { params: Promise<Params> }) {
  const query = defineQuery(PAGE_QUERY);
  const resolvedParams = await params;
  
   const { data: page } = await sanityFetch({
    query,
    params: {
      ...resolvedParams,
    },
  });

  if (!page) {
    notFound();
  }

  return <Pages page={page} />;
}
export async function generateStaticParams() {
  const query = defineQuery(ALLPAGE_QUERY);

  try {
    const allslug = await client.fetch(query, {}, { cache: "no-store" });
    if (!Array.isArray(allslug)) return [];
    return allslug
      .filter((item: any) => item?.slug && item.slug !== "investors")
      .map((item: any) => ({ slug: item.slug }));
  } catch {
    // Sanity unreachable (e.g. placeholder env vars during initial deploy) —
    // skip prebuilding static slugs so the build succeeds.
    return [];
  }
}


export const revalidate = 2592000; // 30 days
