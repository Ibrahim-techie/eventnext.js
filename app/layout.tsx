import type { Metadata } from "next";
import {
  Schibsted_Grotesk,
  Martian_Mono,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import LightRays from "../components/LightRays";
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const SchibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-Schibsted_Grotesk-sans",
  subsets: ["latin"],
});

const MartianMono = Martian_Mono({
  variable: "--font-Martian_Mono-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Events",
  description: "The Hub for Every Day Event You Must not Miss",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        SchibstedGrotesk.variable,
        MartianMono.variable,
        "font-mono",
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-screen flex flex-col">
      <div className="absolute inset-0 z-[-1] min-h-screen">
        <LightRays
            raysOrigin="top-center"
            raysColor="#5dfeca"
            raysSpeed={0.5}
            lightSpread={3}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.05}
            fadeDistance={1}
            saturation={1}
            noiseAmount={0}
            distortion={0.05}
            pulsating={false}
          />
       
      </div>
      <main>
        {children}
        </main>
      </body>
          
    </html>
  );
}
