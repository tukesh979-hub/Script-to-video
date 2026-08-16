import type { Metadata } from "next";
import { Silkscreen, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { GridBackground } from "@/components/GridBackground";

const silkscreen = Silkscreen({
  variable: "--font-display",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  weight: ["400", "500", "700"],
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
      className={`${silkscreen.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <GridBackground />
        {children}
      </body>
    </html>
  );
}
