'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  name_en: string;
  icon: string;
  product_count: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    icon: '📦',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    
    // جلب التصنيفات من المنتجات الموجودة
    const { data: products } = await supabase
      .from('products')
      .select('category');

    const categoryMap = new Map<string, number>();
    products?.forEach(p => {
      if (p.category) {
        categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
      }
    });

    const categoriesList: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name,
      name: name,
      name_en: name,
      icon: getIconForCategory(name),
      product_count: count,
    }));

    setCategories(categoriesList);
    setLoading(false);
  };

  const getIconForCategory = (category: string): string => {
    const icons: Record<string, string> = {
      'ملابس': '👕',
      'إلكترونيات': '📱',
      'طعام': '🍕',
      'مشروبات': '🥤',
      'تجميل': '💄',
      'منزل': '🏠',
      'ألعاب': '🎮',
      'كتب': '📚',
    };
    return icons[category] || '📦';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // التصنيفات مشتقة من المنتجات، لا تحتاج إلى جدول منفصل
    alert('التصنيفات تُستخرج تلقائياً من المنتجات');
    closeModal();
  };

  const handleDelete = async (category: Category) => {
    if (confirm(`حذف التصنيف "${category.name}" سيؤثر على المنتجات. هل أنت متأكد؟`)) {
      // هنا يمكن تحديث المنتجات لإزالة التصنيف
      alert('يمكنك تحديث المنتجات يدوياً لإزالة هذا التصنيف');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', name_en: '', icon: '📦' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">التصنيفات</h1>
          <p className="text-gray-500 mt-1">إدارة تصنيفات المنتجات</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة تصنيف
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center text-white">
              <div className="text-5xl mb-2">{category.icon}</div>
              <h3 className="text-xl font-bold">{category.name}</h3>
              <p className="text-sm text-white/80">{category.name_en}</p>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500">عدد المنتجات</span>
                <span className="font-bold text-green-600">{category.product_count}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({
                      name: category.name,
                      name_en: category.name_en,
                      icon: category.icon,
                    });
                    setShowModal(true);
                  }}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Edit size={14} />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="btn-danger text-sm flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">لا توجد تصنيفات</p>
          <p className="text-gray-400 text-sm">أضف تصنيفات عند إضافة المنتجات</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">اسم التصنيف (عربي)</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">اسم التصنيف (إنجليزي)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">الأيقونة</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="📦"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">استخدم إيموجي أو رمز تعبيري</p>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingCategory ? 'تحديث' : 'إضافة'}
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