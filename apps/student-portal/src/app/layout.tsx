import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider, ThemeScript } from "@scalex/ui";
import { GoogleAnalytics } from "@/components/google-analytics";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { AuthSessionRefresh } from "@/components/auth-session-refresh";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-surface font-body text-foreground antialiased">
        <ThemeScript />
        <ThemeProvider>
          <GoogleAnalytics />
          <WebVitalsReporter />
          <AuthSessionRefresh />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
