import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ملوكا شوب',
    short_name: 'ملوكا شوب',
    description: 'متجر سوداني للمنتجات الأصيلة',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#22c55e',
    // icons: [  // تم تعطيل الأيقونات مؤقتاً لحين تجهيزها
    //   { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    //   { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    // ],
  };
}