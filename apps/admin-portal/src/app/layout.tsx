import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleX Management OS",
  description:
    "Learn. Build. Launch. Grow. — Admin control room for ScaleX LaunchPad academy management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-scalex-black text-text-primary-dark antialiased">
        {children}
      </body>
    </html>
  );
}
