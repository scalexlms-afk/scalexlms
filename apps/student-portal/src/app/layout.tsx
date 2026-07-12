import type { Metadata } from "next";
import { ThemeProvider, ThemeScript } from "@scalex/ui";
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-surface text-foreground antialiased">
        <ThemeScript />
        <ThemeProvider>
          <GoogleAnalytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
