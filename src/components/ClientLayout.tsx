"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <div>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}
