'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, Product, Category } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { 
  Plus, Edit, Trash2, Eye, Search, 
  Image as ImageIcon, X, Check, Package, Sparkles,
  TrendingUp, TrendingDown, DollarSign, RefreshCw, Upload
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [autoSKU, setAutoSKU] = useState(true);
  const [profitPreview, setProfitPreview] = useState<{ profit: number; margin: number } | null>(null);
  const [suggestedSKU, setSuggestedSKU] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost_price: '',
    stock: '',
    sku: '',
    supplier: '',
    location: '',
    reorder_point: '5',
    category: '',
    image_url: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // حساب الربح ونسبة الربح في الوقت الفعلي
  useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    const costPrice = parseFloat(formData.cost_price) || 0;
    
    if (price > 0 && costPrice > 0) {
      const profit = price - costPrice;
      const margin = (profit / price) * 100;
      setProfitPreview({ profit, margin });
    } else {
      setProfitPreview(null);
    }
  }, [formData.price, formData.cost_price]);

  // إنشاء SKU تلقائي عند تغيير الاسم
  useEffect(() => {
    if (autoSKU && !editingProduct && formData.name) {
      generateSuggestedSKU(formData.name);
    }
  }, [formData.name, autoSKU, editingProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) setCategories(data);
  };

  
const uploadImage = async (file: File) => {
  setUploading(true);
  
  // إنشاء اسم فريد للصورة
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // رفع الصورة إلى Supabase Storage
  const { data, error: uploadError } = await supabase.storage
    .from('products')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    alert(`حدث خطأ في رفع الصورة: ${uploadError.message}`);
    setUploading(false);
    return null;
  }

  // الحصول على الرابط العام للصورة
  const { data: publicUrlData } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  setUploading(false);
  return publicUrlData.publicUrl;
};

  // معالج اختيار الصورة
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة صالح');
      return;
    }

    // التحقق من الحجم (حد أقصى 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData({ ...formData, image_url: imageUrl });
    }
  };

  const generateSuggestedSKU = async (productName: string) => {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) return;
    
    const nextNumber = ((count || 0) + 1).toString().padStart(4, '0');
    let prefix = productName.substring(0, 3).toUpperCase();
    prefix = prefix.replace(/[^A-Za-z\u0600-\u06FF]/g, '');
    if (!prefix) prefix = 'PRD';
    
    const sku = `${prefix}-${nextNumber}`;
    setSuggestedSKU(sku);
    setFormData(prev => ({ ...prev, sku: sku }));
  };

  const regenerateSKU = async () => {
    if (formData.name) {
      await generateSuggestedSKU(formData.name);
    }
  };
const handleAutoCategorize = async () => {
  if (!formData.name) return;
  
  const { data, error } = await supabase.rpc('auto_categorize_product', {
    product_name: formData.name,
    product_description: formData.description
  });

  if (!error && data) {
    // استخدم callback form لتجنب مشاكل التحديث المتكرر
    setFormData(prev => ({ ...prev, category: data }));
  }
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const price = parseInt(formData.price);
    const costPrice = parseInt(formData.cost_price) || 0;
    const profit = price - costPrice;
    const profitMargin = costPrice > 0 ? (profit / costPrice) * 100 : 0;

    let finalSKU = formData.sku;
    if (autoSKU && !editingProduct && (!finalSKU || finalSKU === suggestedSKU)) {
      finalSKU = suggestedSKU;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: price,
      cost_price: costPrice,
      profit_margin: profitMargin,
      stock: parseInt(formData.stock),
      sku: finalSKU || null,
      supplier: formData.supplier || null,
      location: formData.location || null,
      reorder_point: parseInt(formData.reorder_point) || 5,
      category: formData.category || null,
      image_url: formData.image_url || null,
      is_active: true,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      
      if (!error) {
        alert('تم تحديث المنتج بنجاح');
        closeModal();
        fetchProducts();
      } else {
        alert('حدث خطأ في تحديث المنتج');
      }
    } else {
      const { error } = await supabase.from('products').insert([productData]);
      if (!error) {
        alert('تم إضافة المنتج بنجاح');
        closeModal();
        fetchProducts();
      } else {
        alert('حدث خطأ في إضافة المنتج');
      }
    }
    setLoading(false);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (!error) {
        alert('تم حذف المنتج بنجاح');
        fetchProducts();
      } else {
        alert('حدث خطأ في حذف المنتج');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setAutoSKU(false);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      cost_price: (product as any).cost_price?.toString() || '',
      stock: product.stock.toString(),
      sku: (product as any).sku || '',
      supplier: (product as any).supplier || '',
      location: (product as any).location || '',
      reorder_point: (product as any).reorder_point?.toString() || '5',
      category: product.category || '',
      image_url: product.image_url || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setProfitPreview(null);
    setSuggestedSKU('');
    setAutoSKU(true);
    setFormData({
      name: '',
      description: '',
      price: '',
      cost_price: '',
      stock: '',
      sku: '',
      supplier: '',
      location: '',
      reorder_point: '5',
      category: '',
      image_url: '',
    });
  };

  const getProfitBadge = (product: Product) => {
    const costPrice = (product as any).cost_price || 0;
    const profit = product.price - costPrice;
    const margin = costPrice > 0 ? (profit / product.price) * 100 : 0;
    
    if (profit <= 0) {
      return <span className="text-xs text-red-500">خسارة</span>;
    } else if (margin < 10) {
      return <span className="text-xs text-yellow-500">ربح منخفض</span>;
    } else if (margin < 30) {
      return <span className="text-xs text-green-500">ربح جيد</span>;
    } else {
      return <span className="text-xs text-green-700 font-bold">ربح ممتاز</span>;
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p as any).sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">المنتجات</h1>
          <p className="text-gray-500 mt-1">إدارة منتجات المتجر</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة منتج
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن منتج (بالاسم، التصنيف، أو SKU)..."
            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر البيع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر الشراء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الربح</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const costPrice = (product as any).cost_price || 0;
                const profit = product.price - costPrice;
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {(product as any).sku || '-'}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-green-600 font-bold">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-gray-600">{costPrice > 0 ? formatPrice(costPrice) : '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={profit > 0 ? 'text-green-600 font-semibold' : 'text-red-500'}>
                          {profit > 0 ? `+${formatPrice(profit)}` : formatPrice(profit)}
                        </span>
                        {getProfitBadge(product)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center gap-1 w-fit">
                        <span>{getCategoryIcon(product.category)}</span>
                        {product.category || 'غير مصنف'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/product/${product.id}`} target="_blank">
                          <button className="text-blue-500 hover:text-blue-700">
                            <Eye size={18} />
                          </button>
                        </Link>
                        <button onClick={() => handleEdit(product)} className="text-green-500 hover:text-green-700">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(product)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
           </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد منتجات</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (autoCategorize && !editingProduct) {
                        setTimeout(() => handleAutoCategorize(), 500);
                      }
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">الوصف</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* صورة المنتج - رفع من الجهاز */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">صورة المنتج</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="رابط الصورة أو ارفع من جهازك"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                    >
                      <Upload size={18} />
                      {uploading ? 'جاري الرفع...' : 'رفع'}
                    </button>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image src={formData.image_url} alt="معاينة" fill className="object-cover" />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">يمكنك إدخال رابط صورة أو رفع صورة من جهازك</p>
                </div>

                {/* أسعار البيع والشراء */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">💰 سعر البيع *</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">🏷️ سعر الشراء</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    />
                  </div>
                </div>

                {/* معاينة الربح */}
                {profitPreview && profitPreview.profit > 0 && (
                  <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-600" />
                        <span className="text-sm text-gray-600">الربح المتوقع:</span>
                      </div>
                      <div>
                        <span className="font-bold text-green-700">{formatPrice(profitPreview.profit)}</span>
                        <span className="text-xs text-green-600 mr-2">({profitPreview.margin.toFixed(1)}% نسبة)</span>
                      </div>
                    </div>
                  </div>
                )}

                {profitPreview && profitPreview.profit <= 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TrendingDown size={18} className="text-red-600" />
                        <span className="text-sm text-gray-600">تحذير:</span>
                      </div>
                      <span className="font-bold text-red-600">سعر البيع أقل من سعر الشراء!</span>
                    </div>
                  </div>
                )}

                {/* رقم المنتج (SKU) */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700">🔢 رقم المنتج (SKU)</label>
                    {autoSKU && !editingProduct && (
                      <button
                        type="button"
                        onClick={regenerateSKU}
                        className="text-green-600 text-sm flex items-center gap-1 hover:text-green-700"
                      >
                        <RefreshCw size={14} />
                        تجديد
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder={autoSKU && !editingProduct ? "سيتم إنشاؤه تلقائياً" : "أدخل رقم المنتج"}
                      value={formData.sku}
                      onChange={(e) => {
                        setFormData({ ...formData, sku: e.target.value });
                        if (e.target.value) setAutoSKU(false);
                      }}
                    />
                    {!editingProduct && (
                      <label className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={autoSKU}
                          onChange={(e) => {
                            setAutoSKU(e.target.checked);
                            if (e.target.checked && formData.name) {
                              generateSuggestedSKU(formData.name);
                            }
                          }}
                          className="w-4 h-4"
                        />
                        تلقائي
                      </label>
                    )}
                  </div>
                  {autoSKU && !editingProduct && suggestedSKU && (
                    <p className="text-xs text-green-600 mt-1">
                      ✨ SKU المقترح: <code className="bg-green-50 px-1 rounded">{suggestedSKU}</code>
                    </p>
                  )}
                </div>

                {/* التصنيف التلقائي */}
                <div className="mb-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCategorize}
                      onChange={(e) => setAutoCategorize(e.target.checked)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-600">تصنيف تلقائي</span>
                  </label>
                  {autoCategorize && formData.name && (
                    <button
                      type="button"
                      onClick={handleAutoCategorize}
                      className="text-green-600 text-sm flex items-center gap-1 hover:text-green-700"
                    >
                      <Sparkles size={14} />
                      تصنيف الآن
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">التصنيف</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">-- اختر التصنيف --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name} {cat.name_en ? `(${cat.name_en})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">المخزون *</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">حد إعادة الطلب</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.reorder_point}
                      onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">المورد</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">موقع التخزين</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="مثال: رف A1"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={loading || uploading} className="btn-primary flex-1">
                    {loading || uploading ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'إضافة')}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// دالة مساعدة للحصول على أيقونة التصنيف
function getCategoryIcon(categoryName: string | null): string {
  const icons: Record<string, string> = {
    'ملابس': '👕',
    'إلكترونيات': '📱',
    'طعام': '🍕',
    'تجميل': '💄',
    'منزل': '🏠',
    'ألعاب': '🎮',
    'كتب': '📚',
    'رياضة': '⚽',
    'حيوانات': '🐕',
    'سيارات': '🚗',
    'منتجات متنوعة': '📦',
  };
  return icons[categoryName || ''] || '📦';
}