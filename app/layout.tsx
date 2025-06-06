import { DashboardProvider } from "@/contexts/dashboard-context"
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Script from 'next/script';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GATTI - спортивная мафия",
  description: "Сайт для игроков и клубов по спортивной мафии.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <html lang="ru">
        <head>
          
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >

          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <DashboardProvider>
              {children}
            </DashboardProvider>
          </ThemeProvider>
        </body>
      </html>
    
  );
}
