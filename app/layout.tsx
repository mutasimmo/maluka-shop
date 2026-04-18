import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ملوكا شوب | متجر سوداني أصيل',
    template: '%s | ملوكا شوب',
  },
  description:
    'أفضل المنتجات السودانية الأصيلة - تسوق الآن مع توصيل سريع.',
  keywords:
    'ملوكا, متجر سوداني, تسوق السودان, منتجات سودانية',
  authors: [{ name: 'ملوكا شوب' }],
  metadataBase: new URL('https://maluka-shop.vercel.app'),
  openGraph: {
    title: 'ملوكا شوب',
    description: 'متجر سوداني أصيل',
    url: 'https://maluka-shop.vercel.app',
    siteName: 'ملوكا شوب',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ar_AR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#22c55e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body
        className={`${cairo.className} bg-gray-50 text-gray-900 antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}