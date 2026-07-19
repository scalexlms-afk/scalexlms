import type { Metadata } from "next";
import {
  defaultTitle,
  siteDescription,
  siteName,
  siteTagline,
  siteUrl,
} from "./site";

const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: defaultTitle,
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Amazon FBA",
    "private label",
    "ecommerce education",
    "Amazon seller course",
    "product research",
    "Amazon FBA mentorship",
    "ScaleX LaunchPad",
  ],
  authors: [{ name: "ScaleX LaunchPad" }],
  creator: "ScaleX LaunchPad",
  publisher: "ScaleX LaunchPad",
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
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
    images: ["/twitter-image"],
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
      images: [ogImage],
    },
    twitter: {
      title: `${title} | ${siteName}`,
      description,
      images: ["/twitter-image"],
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
