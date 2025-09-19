import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Yachterly | Smart Finance for Yacht Crew",
  description: "Yachterly is the modern fintech platform for yacht crew: virtual cards, real-time expenses, payroll & defect management. Secure, global, digital.",
  keywords: [
    "yacht crew fintech",
    "virtual card",
    "yacht payroll",
    "expense management",
    "superyacht SaaS",
    "marine finance",
    "Yachterly",
    "boat crew payments"
  ],
  openGraph: {
    title: "Yachterly | Smart Finance for Yacht Crew",
    description: "Virtual cards, expenses, payroll & defects—all-in-one solution for superyachts.",
    images: [
      {
        url: "https://yachterly.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yachterly virtual card and finance dashboard"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Yachterly | Smart Finance for Yacht Crew",
    description: "Virtual cards, expense management, payroll and defect tracking for global yacht crew.",
    images: ["https://yachterly.com/twitter-image.png"]
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <main>
          {children}
        </main>
        <Analytics />;
      </body>
    </html>
  );
}
