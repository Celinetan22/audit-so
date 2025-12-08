import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// === Font utama ===
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dashboard Plan SO",
  description: "Monitoring dan Manajemen Plan Sales Order",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} antialiased bg-slate-50 text-slate-800`}
        suppressHydrationWarning
      >
        {/* Wrapper untuk memaksa React hydrate hanya di dalam area ini */}
        <div id="__app" suppressHydrationWarning>
          {children}
        </div>

        {/* Global Toast */}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "rounded-xl shadow-md font-medium text-gray-800",
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
