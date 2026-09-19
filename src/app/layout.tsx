import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FX Desk — PLN",
  description: "Kursy NBP, kupno i sprzedaż walut vs PLN oraz zysk z wymian.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${sans.variable} ${plex.variable} h-full w-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden">{children}</body>
    </html>
  );
}
