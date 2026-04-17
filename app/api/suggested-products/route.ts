import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const limit = parseInt(searchParams.get('limit') || '4');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  try {
    // جلب المنتج الحالي لمعرفة تصنيفه
    const { data: currentProduct } = await supabase
      .from('products')
      .select('category')
      .eq('id', productId)
      .single();

    // 1. منتجات من نفس التصنيف
    const { data: sameCategory } = await supabase
      .from('products')
      .select('*')
      .eq('category', currentProduct?.category)
      .neq('id', productId)
      .eq('is_active', true)
      .limit(limit);

    let suggestedProducts = sameCategory || [];

    // 2. إذا كان العدد أقل من المطلوب، أضف الأكثر مبيعاً
    if (suggestedProducts.length < limit) {
      const remaining = limit - suggestedProducts.length;
      const { data: topSelling } = await supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .eq('is_active', true)
        .not('id', 'in', `(${suggestedProducts.map(p => p.id).join(',') || '""'})`)
        .order('purchase_count', { ascending: false })
        .limit(remaining);

      if (topSelling) {
        suggestedProducts = [...suggestedProducts, ...topSelling];
      }
    }

    // 3. إذا كان العدد لا يزال أقل، أضف منتجات عشوائية
    if (suggestedProducts.length < limit) {
      const remaining = limit - suggestedProducts.length;
      const { data: random } = await supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .eq('is_active', true)
        .not('id', 'in', `(${suggestedProducts.map(p => p.id).join(',') || '""'})`)
        .limit(remaining);

      if (random) {
        suggestedProducts = [...suggestedProducts, ...random];
      }
    }

    return NextResponse.json({ products: suggestedProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suggested products' }, { status: 500 });
  }
}