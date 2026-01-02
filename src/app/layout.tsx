import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";



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
    <html lang="id">
<body className={`${plusJakarta.variable} antialiased bg-slate-50 text-slate-800`}>
  {children}
  <Toaster position="top-center" />
</body>

    </html>
  );
}
