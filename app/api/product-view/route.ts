import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { productId } = await request.json();

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  // تحديث عدد المشاهدات
  await supabase.rpc('increment_view_count', { product_id: productId });

  return NextResponse.json({ success: true });
}