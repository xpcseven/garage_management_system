import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { ThemeProvider } from "next-themes";
import { auth } from "@/auth";
import dynamic from "next/dynamic";
import { Aref_Ruqaa, Cairo, IBM_Plex_Sans } from "next/font/google";

const ToastProvider = dynamic(
  () => import("@/components/Shared/ToastProvider"),
  { ssr: false }
);

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-cairo",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "Tahoma", "Arial", "sans-serif"],
});

const displayFont = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-display",
  preload: true,
});

const dataFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-data",
  preload: false,
});

export const metadata: Metadata = {
  title: "آشور للسياحة والسفر",
  description: "منصة سياحية عراقية — شركات، فنادق، مطاعم، ومزارع سياحية",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${displayFont.variable} ${dataFont.variable}`}
    >
      <body
        className={`${cairo.className} min-h-screen bg-background font-sans antialiased`}
      >
        <SessionProviderWrapper session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div>{children}</div>
            <ToastProvider />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
