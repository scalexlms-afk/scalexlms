import type { Metadata } from "next";
import { ThemeProvider, ThemeScript } from "@scalex/ui";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleX Management OS",
  description:
    "Learn. Build. Launch. Grow. — Admin control room for ScaleX LaunchPad academy management.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full"
      data-admin-mock=""
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="admin-main-canvas min-h-full bg-surface text-foreground antialiased">
        <ThemeScript />
        <ThemeProvider>
          <GoogleAnalytics />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
