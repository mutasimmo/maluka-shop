import { createClient } from '@supabase/supabase-js';

// استخدم المفتاح السري هنا (آمن لأن هذا الملف يستخدم فقط في الخادم)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// هذا العميل يتجاوز RLS - يستخدم فقط في API Routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);