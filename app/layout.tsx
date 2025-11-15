import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat App - Anonymous Adult Chat",
  description: "Fast, anonymous chat for adults 18+",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#1f1f1f",
                  color: "#fff",
                  border: "1px solid #333",
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
