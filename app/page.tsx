import {client, homeQuery} from "@/sanity/lib/client";
import {defineQuery} from "next-sanity";
import {draftMode} from "next/headers";
import { Metadata } from "next";
import { sanityFetch } from "@/sanity/lib/live";
import Homepage from "@/components/pages/Home";

export const revalidate = 2592000;

export async function generateMetadata(): Promise<Metadata> {
  const query = defineQuery(homeQuery);

  let data: any = null;
  try {
    const res = await sanityFetch({ query });
    data = res.data;
  } catch {
    data = null;
  }

  const metaTitle = `PeakPulse`;
  const metadata: Metadata = {
    title: metaTitle,
    description:
      "PeakPulse Agency is a performance-driven digital solutions firm based in Puerto Princesa, Mimaropa, Philippines. We deliver expert web development, professional video production, strategic digital marketing, and comprehensive automation solutions to small and large businesses.",
    openGraph: {
      title: metaTitle,
      description:
        data && data.meta_description != null
          ? data.meta_description
          : "PeakPulse Agency is a performance-driven digital solutions firm based in Puerto Princesa, Mimaropa, Philippines. We deliver expert web development, professional video production, strategic digital marketing, and comprehensive automation solutions to small and large businesses.",
      url: `https://peakpulseagy.com/`,
      siteName: metaTitle,
      type: "website",
    },
    other: {
      "Permissions-Policy":
        "payment=(), microphone=(), camera=(), geolocation=()",
    },
  };
  return metadata;
}

export default async function Home() {
  const query = defineQuery(homeQuery);

  let data: any = null;
  try {
    const res = await sanityFetch({ query });
    data = res.data;
  } catch {
    data = null;
  }

  return <Homepage data={data} />;
}

export async function generateStaticParams() {

  return [
    {slug: "/"}
  ];
}
