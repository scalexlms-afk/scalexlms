import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/google-analytics";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-scalex-black text-text-primary-dark antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
