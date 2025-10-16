"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <div>
            {!isLoginPage && <Navbar />}
            <main className="min-h-screen">{children}</main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
