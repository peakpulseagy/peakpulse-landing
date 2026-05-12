import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import CalendlyTracking from "@/components/tracking/CalendlyTracking";

// Google Ads conversion tracking — fires on every page so conversion
// events can be attributed back to the originating ad click.
const GOOGLE_ADS_ID = "AW-18110095524";

// Calendly Strategy Call conversion action label. Combined with the
// account ID above, this is the `send_to` value that fires whenever a
// Calendly popup booking is confirmed (see CalendlyTracking).
const CALENDLY_CONVERSION_LABEL = "0d5ACJSeyKscEKTByLtD";

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
      <head>
        {/* Google Ads global site tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        {/* Calendly inline widget assets — required for the popup CTA
            and the event_scheduled postMessage that fires our Google
            Ads conversion. */}
        <link
          rel="stylesheet"
          href="https://assets.calendly.com/assets/external/widget.css"
        />
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
        />
      </head>
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
        <CalendlyTracking conversionLabel={`${GOOGLE_ADS_ID}/${CALENDLY_CONVERSION_LABEL}`} />
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
