import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://lokul.club";
  const now  = new Date();

  return [
    {
      url:             `${base}/`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        1,
    },
    {
      url:             `${base}/#how`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.8,
    },
    {
      url:             `${base}/#features`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.8,
    },
    {
      url:             `${base}/#waitlist`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.9,
    },
  ];
}
