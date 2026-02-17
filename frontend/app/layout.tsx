import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Faith Laundry Shop",
  description: "Laundry order management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <AuthProvider>
          <Nav />
          <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <AuthGuard>{children}</AuthGuard>
          </main>
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
