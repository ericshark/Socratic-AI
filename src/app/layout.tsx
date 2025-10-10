import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@total-typescript/ts-reset";
import "./globals.css";

import { AppProviders } from "@/components/providers/app-providers";
import { env } from "@/env";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Socratic · AI Thinking Coach",
  description:
    "Socratic helps teams reason better with guided questions, decision maps, and thoughtful guardrails.",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", geistSans.variable, geistMono.variable)}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
