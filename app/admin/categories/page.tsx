'use client';

import { useState, useEffect } from 'react';
import { supabase, Category } from '@/lib/supabase';
import { Plus, Edit, Trash2, Tag, X, Save } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    icon: '📦',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error && data) setCategories(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const categoryData = {
      name: formData.name,
      name_en: formData.name_en,
      icon: formData.icon,
      description: formData.description,
      is_active: true,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      
      if (!error) {
        alert('تم تحديث التصنيف بنجاح');
        closeModal();
        fetchCategories();
      } else {
        alert('حدث خطأ في تحديث التصنيف');
      }
    } else {
      const { error } = await supabase.from('categories').insert([categoryData]);
      if (!error) {
        alert('تم إضافة التصنيف بنجاح');
        closeModal();
        fetchCategories();
      } else {
        alert('حدث خطأ في إضافة التصنيف');
      }
    }
    setLoading(false);
  };

  const handleDelete = async (category: Category) => {
    if (confirm(`هل أنت متأكد من حذف التصنيف "${category.name}"؟`)) {
      const { error } = await supabase.from('categories').delete().eq('id', category.id);
      if (!error) {
        alert('تم حذف التصنيف بنجاح');
        fetchCategories();
      } else {
        alert('حدث خطأ في حذف التصنيف');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      name_en: '',
      icon: '📦',
      description: '',
    });
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">التصنيفات</h1>
          <p className="text-gray-500 mt-1">إدارة تصنيفات المنتجات</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          إضافة تصنيف
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="text-4xl mb-2">{category.icon}</div>
              <h3 className="text-xl font-bold">{category.name}</h3>
              {category.name_en && (
                <p className="text-sm text-white/80">{category.name_en}</p>
              )}
            </div>
            <div className="p-4">
              {category.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{category.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({
                      name: category.name,
                      name_en: category.name_en || '',
                      icon: category.icon,
                      description: category.description || '',
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
                  className="flex-1 btn-danger text-sm flex items-center justify-center gap-1"
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
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            أضف أول تصنيف
          </button>
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
                  <label className="block text-gray-700 mb-2">اسم التصنيف (عربي) *</label>
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
                    placeholder="مثال: Electronics"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  />
                </div>

                <div className="mb-4">
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

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">الوصف</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="وصف التصنيف..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'إضافة')}
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