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
    template: '%s | ملوكا شوب'
  },
  description: 'أفضل المنتجات السودانية الأصيلة - شاي ملوكا، بن سوداني، لبان ذكر، حناء طبيعية. تسوق الآن مع توصيل سريع لجميع أنحاء السودان.',
  keywords: 'ملوكا, شوب, متجر سوداني, شاي, بن سوداني, لبان ذكر, حناء, منتجات سودانية, تسوق اونلاين السودان',
  authors: [{ name: 'ملوكا شوب', url: 'https://maluka-shop.vercel.app' }],
  creator: 'ملوكا شوب',
  publisher: 'ملوكا شوب',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'ملوكا شوب - متجر سوداني أصيل',
    description: 'أفضل المنتجات السودانية الأصيلة. تسوق الآن واستمتع بتوصيل سريع.',
    url: 'https://maluka-shop.vercel.app',
    siteName: 'ملوكا شوب',
    images: [
      {
        url: 'https://maluka-shop.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ملوكا شوب - متجر سوداني',
      },
    ],
    locale: 'ar_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ملوكا شوب - متجر سوداني أصيل',
    description: 'أفضل المنتجات السودانية الأصيلة',
    images: ['https://maluka-shop.vercel.app/twitter-image.jpg'],
  },
  category: 'ecommerce',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#166534' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={cairo.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}