import { MetadataRoute } from "next";
import { SERVICES_DATA } from "@/lib/constants/salon-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://theglorioushairstudio.vercel.app";

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/experts",
    "/gallery",
    "/bridal",
    "/offers",
    "/contact",
    "/booking"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8
  }));

  const serviceRoutes = SERVICES_DATA.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9
  }));

  return [...staticRoutes, ...serviceRoutes];
}

