import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Sans, IBM_Plex_Mono, Fustat, Schibsted_Grotesk, Inter } from "next/font/google";
import "./globals.css";

// "Camera Report" identity: a condensed, stenciled display face (evokes
// film-can labels and technical stamps) + a working document sans + a
// mono face for every number this app is full of -- frame counts,
// durations, percentages, timecodes. Still used by the not-yet-restyled
// project-workspace pages (project detail, new-project form, onboarding).
const bigShoulders = Big_Shoulders({
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

// "Oceanic Design" identity -- additive, alongside Camera Report above.
// See design-systems/oceanic-design/DESIGN-SYSTEM.md §1. Fustat for page
// headings, Schibsted Grotesk for UI chrome, Inter for body copy.
const fustat = Fustat({
  variable: "--font-oceanic-heading",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-oceanic-ui",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-oceanic-body",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Idea to Video",
  description: "Pipeline dashboard for turning a script into a produced video",
};

// Thin shell only -- fonts + <body>. No ambient background is rendered here
// anymore: Camera Report's <GridBackground /> and Oceanic's gradient washes
// are both applied per-page/per-layout instead, since they're two different
// visual identities that must never render on top of each other. See
// DESIGN-SYSTEM.md §3 "Layout/background scoping".
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${plexSans.variable} ${plexMono.variable} ${fustat.variable} ${schibstedGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">{children}</body>
    </html>
  );
}
