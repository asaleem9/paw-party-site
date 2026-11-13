import type { MetadataRoute } from "next";
import { config } from "@/content/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy", "/support"].map((path) => ({ url: `${config.siteUrl}${path}` }));
}
