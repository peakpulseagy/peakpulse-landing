import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const ROOT_URL = "https://peak-pulse.vercel.app";
  return [
    
    {
      url: ROOT_URL,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    // {
    //   url: ROOT_URL + "/about-us",
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: ROOT_URL + "/portfolio",
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: ROOT_URL + "/news",
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: ROOT_URL + "/contact",
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: ROOT_URL + "/disclaimer",
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
    // {
    //   url: ROOT_URL + "/privacy-policy",
    //   lastModified: new Date(),
    //   changeFrequency: "weekly",
    //   priority: 0.5,
    // },
  ];
}