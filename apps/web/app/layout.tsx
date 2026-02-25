import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import StoreProvider from "@/Redux/storeProvider";
import "./globals.css";
import TopLoader from "@/components/top-loader";
import ToastProvider from "@/components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "docflow-360 - Construction Document Management",
  description:
    "docflow-360 is a construction document management and workflow automation platform. Automatically process invoices, compliance documents, and track construction projects with intelligent document routing and approval workflows.",
  icons: {
    icon: "/images/docflow-360-logo.png",
    shortcut: "/favicon.ico",
    apple: "/images/docflow-360-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${poppins.variable} antialiased`}>
      <TopLoader />
        <StoreProvider>
          {children}
          <ToastProvider />
        </StoreProvider>
      </body>
    </html>
  );
}


