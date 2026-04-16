import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

// إضافة خط القاهرة - Cairo Font
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ملوكا شوب | Maluka Shop - متجر سوداني أصيل',
  description: 'أفضل المنتجات السودانية الأصيلة - شاي ملوكا، بن سوداني، لبان ذكر، حناء طبيعية',
  keywords: 'ملوكا, شوب, متجر سوداني, شاي, بن, لبان, حناء, منتجات سودانية',
  authors: [{ name: 'Maluka Shop' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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