import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import GoogleAnalytics from '@/components/GoogleAnalytics';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QR Code Generator - Create Custom QR Codes",
  description: "Generate customizable QR codes with colors, logos, and frames. Support for URLs, text, phone numbers, email, and Wi-Fi QR codes. Free and easy to use!",
  keywords: "qr code generator, custom qr codes, qr code with logo, qr code colors, free qr code generator",
  metadataBase: new URL('https://kreattix.github.io/qrcode'),
  authors: [{ name: 'Kreattix', url: 'https://github.com/kreattix' }],
  creator: 'Kreattix',
  publisher: 'Kreattix',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://kreattix.github.io/qrcode',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kreattix.github.io/qrcode',
    siteName: 'QR Code Generator by Kreattix',
    title: 'QR Code Generator - Create Custom QR Codes',
    description: 'Generate customizable QR codes with colors, logos, and frames. Support for URLs, text, phone numbers, email, and Wi-Fi QR codes. Free and easy to use!',
    images: [
      {
        url: '/qrcode/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QR Code Generator by Kreattix',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Code Generator - Create Custom QR Codes',
    description: 'Generate customizable QR codes with colors, logos, and frames. Support for URLs, text, phone numbers, email, and Wi-Fi QR codes. Free and easy to use!',
    site: '@kreattix',
    creator: '@kreattix',
    images: ['/qrcode/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/qrcode/favicon.ico' },
      { url: '/qrcode/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/qrcode/apple-touch-icon.png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-site-verification-code', // Add your Google verification code
  },
  category: 'Technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'QR Code Generator',
              description: 'Generate customizable QR codes with colors, logos, and frames. Support for URLs, text, phone numbers, email, and Wi-Fi QR codes.',
              url: 'https://kreattix.github.io/qrcode',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              author: {
                '@type': 'Organization',
                name: 'Kreattix',
                url: 'https://github.com/kreattix'
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <GoogleAnalytics />
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
