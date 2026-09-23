import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EarthRe SLA Monitoring Dashboard",
  description: "Stateless SLA Monitoring & Billing Credit Analytics Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}