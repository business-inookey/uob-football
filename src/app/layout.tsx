import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MobileNav from "@/components/layout/MobileNav";
import { AppLoadingWrapper } from "@/components/AppLoadingWrapper";
import { LoadingProvider } from "@/components/GlobalLoadingState";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { GlobalNavigation } from "@/components/layout/GlobalNavigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UoB Football - Team Management System",
  description: "University of Birmingham Football Team Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LoadingProvider>
            <NavigationProvider>
              <AppLoadingWrapper>
                <MobileNav />
                <GlobalNavigation />
                <div className="pb-4 sm:pt-0">{children}</div>
              </AppLoadingWrapper>
            </NavigationProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
