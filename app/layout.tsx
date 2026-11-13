import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { config } from "@/content/config";
import { copy } from "@/content/copy";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: { default: copy.meta.title, template: `%s · ${config.name}` },
  description: copy.meta.description,
  openGraph: {
    title: copy.meta.title,
    description: copy.meta.description,
    siteName: config.name,
    type: "website",
    images: [{ url: "/video/share.jpg", width: 1920, height: 1080, alt: "Paw Party: free on iPad" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#00f4d1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${bricolage.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
