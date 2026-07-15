import type { Metadata } from "next";
import {
  defaultTitle,
  siteDescription,
  siteName,
  siteTagline,
  siteUrl,
} from "./site";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "LMS scalability",
    "enterprise learning management",
    "EdTech infrastructure",
    "auto-scaling LMS",
    "digital learning scaling",
    "Amazon FBA",
    "ScaleX LaunchPad",
    "ScaleXLMS",
  ],
  authors: [{ name: "ScaleX" }],
  creator: "ScaleX",
  publisher: "ScaleX",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const url = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url,
    },
    twitter: {
      title: `${title} | ${siteName}`,
      description,
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false },
};

export { siteTagline };
