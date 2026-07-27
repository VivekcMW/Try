import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PostHogProvider from "@/components/PostHogProvider";
import { ToastProvider } from "@/components/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lokul.club";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default:  "Lokul.club — Your Neighborhood, Connected",
    template: "%s | Lokul.club",
  },
  description:
    "The trusted operating system for Indian neighborhoods. Safety alerts, RWA notices, verified local businesses, and community — all in one place. Join the waitlist.",
  keywords: [
    "neighborhood app",
    "local community",
    "RWA app",
    "society management",
    "local services India",
    "pin code community",
    "lokul",
  ],
  authors: [{ name: "Lokul Technologies Pvt. Ltd." }],
  creator: "Lokul",
  publisher: "Lokul Technologies Pvt. Ltd.",
  category: "Community",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type:        "website",
    url:         APP_URL,
    siteName:    "Lokul.club",
    title:       "Lokul.club — Your Neighborhood, Connected",
    description: "Safety alerts, RWA notices, verified local businesses, and community — all in one app for Indian neighborhoods.",
    locale:      "en_IN",
    images: [
      {
        url:    "/opengraph-image",
        width:  1200,
        height: 630,
        alt:    "Lokul.club — Your Neighborhood, Connected",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    site:        "@lokulclub",
    creator:     "@lokulclub",
    title:       "Lokul.club — Your Neighborhood, Connected",
    description: "The trusted operating system for Indian neighborhoods.",
    images:      ["/opengraph-image"],
  },
  robots: {
    index:             true,
    follow:            true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <ToastProvider>{children}</ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
