import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HashHandler } from "@/components/auth/hash-handler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GAPP - Garageinn App",
    template: "%s | GAPP",
  },
  description:
    "Sistema de gestão de chamados e checklists operacionais da Garageinn",
  keywords: ["garageinn", "estacionamento", "chamados", "checklists", "gestão"],
  authors: [{ name: "Garageinn" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <HashHandler />
        {children}
      </body>
    </html>
  );
}
