import { MetadataRoute } from "next";
import { client, ALLPAGE_QUERY } from "@/sanity/lib/client";

export const revalidate = 3600; // Refresh sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ROOT_URL = "https://peakpulseagy.com";

  // Homepage is always indexed
  const homepage = {
    url: ROOT_URL,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
  };

  // Pull every published page from Sanity. If Sanity is unreachable,
  // we still return the homepage so the sitemap doesn't 500.
  let pages: Array<{ slug?: string; _updatedAt?: string }> = [];
  try {
    const result = await client.fetch(ALLPAGE_QUERY, {}, { cache: "no-store" });
    if (Array.isArray(result)) {
      pages = result;
    }
  } catch {
    pages = [];
  }

  const pageEntries = pages
    .filter((p) => typeof p.slug === "string" && p.slug && p.slug !== "investors")
    .map((p) => ({
      url: `${ROOT_URL}/${p.slug}`,
      lastModified: p._updatedAt ? new Date(p._updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [homepage, ...pageEntries];
}
