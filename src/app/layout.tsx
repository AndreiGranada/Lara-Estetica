import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Lara Schneider Estética Regenerativa",
  description:
    "Consultório de estética com atendimento personalizado, cadastro opcional para cupom de avaliação gratuita e contato imediato via WhatsApp.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg" }],
  },
  keywords: [
    "estética regenerativa",
    "bioestimulador de colágeno",
    "harmonização glútea",
    "microagulhamento",
    "botox",
    "estética em Rio Grande do Sul",
  ],
  openGraph: {
    title: "Lara Schneider Estética Regenerativa",
    description:
      "Procedimentos para contorno, regeneração da pele, harmonização e performance corporal.",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Lara Schneider Estética Regenerativa",
      },
    ],
    type: "website",
    locale: "pt_BR",
    siteName: "Lara Schneider Estética Regenerativa",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lara Schneider Estética Regenerativa",
    description:
      "Cadastro opcional para cupom de avaliação gratuita e atendimento imediato via WhatsApp.",
    images: [`${siteUrl}/opengraph-image`],
  },
};

export const viewport: Viewport = {
  themeColor: "#A44651",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"> {children} </body>
    </html>
  );
}
