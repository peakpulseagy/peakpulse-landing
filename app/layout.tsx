import type { Metadata } from "next";
import "./globals.css";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/DisableDraftMode";

import { Geist, Geist_Mono, Syne, DM_Sans, JetBrains_Mono, Fraunces } from "next/font/google";
import { defineQuery } from "next-sanity";
import { NAVIGATION } from "@/sanity/lib/client";
import Header from "@/components/navigations/Header";
import Footer from "@/components/navigations/Footer";
import Logo from "@/public/logo.png"

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-syne",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-jb-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeakPulse",
  icons: {
      icon: `${Logo}`,
      shortcut: `${Logo}`,
	},
  description: "PeakPulse Agency is a performance-driven digital solutions firm based in Puerto Princesa, Mimaropa, Philippines. We deliver expert web development, professional video production, strategic digital marketing, and comprehensive automation solutions to small and large businesses.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();
    const navigationquery = defineQuery(NAVIGATION);

    let navigation: any = null;
    try {
      navigation = await sanityFetch({ query: navigationquery }).then((res) => res.data);
    } catch {
      navigation = null;
    }
    const navigationFallback = navigation ?? {
      title: "PeakPulse",
      header_logo: "/logo.png",
      header_menu: [
        { title: "Services", linkId: "services" },
        { title: "Work", linkId: "work" },
        { title: "Process", linkId: "process" },
        { title: "Contact", linkId: "contact" },
      ],
    };
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${syne.variable}
          ${fraunces.variable}
          ${dmSans.variable}
          ${jetBrainsMono.variable}
          antialiased
        `}
      >
        <Header navigation={navigationFallback} />
        {children}
        {isEnabled && (
          <>
            <SanityLive />
            <DisableDraftMode />
          </>
        )}
        <Footer />
      </body>
    </html>
  );
}
