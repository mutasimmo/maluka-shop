import { supabase, Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500">حدث خطأ في تحميل المنتجات</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-3">جميع المنتجات</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          اكتشف تشكيلتنا المتنوعة من المنتجات السودانية الأصيلة
        </p>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Empty State */}
      {products?.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-gray-500 text-lg">لا توجد منتجات حالياً</p>
          <p className="text-gray-400">سيتم إضافة منتجات جديدة قريباً</p>
        </div>
      )}
    </div>
  );
}