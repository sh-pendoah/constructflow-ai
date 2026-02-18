import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/Redux/storeProvider";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

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
      <NextTopLoader />
        <StoreProvider>
          {children}
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#0E1114",
              borderRadius: "8px",
              border: "1px solid #DEE0E3",
              padding: "16px",
              fontFamily: "SF Pro, sans-serif",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
        </StoreProvider>
      </body>
    </html>
  );
}


