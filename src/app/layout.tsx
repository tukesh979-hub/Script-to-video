import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { GridBackground } from "@/components/GridBackground";

// "Camera Report" identity: a condensed, stenciled display face (evokes
// film-can labels and technical stamps) + a working document sans + a
// mono face for every number this app is full of -- frame counts,
// durations, percentages, timecodes.
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

export const metadata: Metadata = {
  title: "Idea to Video",
  description: "Pipeline dashboard for turning a script into a produced video",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <GridBackground />
        {children}
      </body>
    </html>
  );
}
