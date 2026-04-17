import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://maluka-shop.vercel.app';

  // الصفحات الثابتة
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/products`, lastModified: new Date(), priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/policies`, lastModified: new Date(), priority: 0.7, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/faq`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/orders`, lastModified: new Date(), priority: 0.6, changeFrequency: 'weekly' as const },
  ];

  // جلب المنتجات لإنشاء روابط ديناميكية
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true);

  const productPages = products?.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(product.updated_at || new Date()),
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  })) || [];

  return [...staticPages, ...productPages];
}