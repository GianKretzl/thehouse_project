import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "The House Platform",
  description: "Sistema de Gestão Educacional - The House Institute",
  icons: {
    icon: "/thehouse-icon.png",
    apple: "/thehouse-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <AuthProvider>
            <SidebarConfigProvider>
              {children}
              <Toaster />
            </SidebarConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
