'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Coupon } from '@/lib/supabase';
import { Plus, Edit, Trash2, Tag, X, CheckCircle } from 'lucide-react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setCoupons(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const couponData = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseInt(formData.discount_value),
      min_order_amount: parseInt(formData.min_order_amount) || 0,
      max_discount: formData.max_discount ? parseInt(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_active: true,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);
      
      if (!error) {
        alert('تم تحديث الكوبون بنجاح');
        closeModal();
        fetchCoupons();
      }
    } else {
      const { error } = await supabase.from('coupons').insert([couponData]);
      if (!error) {
        alert('تم إضافة الكوبون بنجاح');
        closeModal();
        fetchCoupons();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (confirm(`هل أنت متأكد من حذف الكوبون "${coupon.code}"؟`)) {
      const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
      if (!error) fetchCoupons();
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);
    if (!error) fetchCoupons();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '0',
      max_discount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
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
          <h1 className="text-3xl font-bold text-gray-800">كوبونات الخصم</h1>
          <p className="text-gray-500 mt-1">إدارة أكواد الخصم والترويج</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          إضافة كوبون
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className={`p-4 ${coupon.is_active ? 'bg-green-600' : 'bg-gray-500'} text-white`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tag size={20} />
                  <span className="font-mono text-xl font-bold">{coupon.code}</span>
                </div>
                <button
                  onClick={() => handleToggleStatus(coupon)}
                  className="px-2 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30"
                >
                  {coupon.is_active ? 'نشط' : 'غير نشط'}
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-3">{coupon.description || 'لا يوجد وصف'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الخصم:</span>
                  <span className="font-semibold text-green-600">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `${coupon.discount_value} ج.س`}
                  </span>
                </div>
                {coupon.min_order_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">الحد الأدنى:</span>
                    <span>{coupon.min_order_amount} ج.س</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">عدد الاستخدامات:</span>
                  <span>{coupon.used_count} / {coupon.usage_limit || '∞'}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => {
                    setEditingCoupon(coupon);
                    setFormData({
                      code: coupon.code,
                      description: coupon.description || '',
                      discount_type: coupon.discount_type,
                      discount_value: coupon.discount_value.toString(),
                      min_order_amount: coupon.min_order_amount.toString(),
                      max_discount: coupon.max_discount?.toString() || '',
                      usage_limit: coupon.usage_limit?.toString() || '',
                      start_date: coupon.start_date?.split('T')[0] || '',
                      end_date: coupon.end_date?.split('T')[0] || '',
                    });
                    setShowModal(true);
                  }}
                  className="flex-1 btn-secondary text-sm"
                >
                  <Edit size={14} className="inline ml-1" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(coupon)}
                  className="flex-1 btn-danger text-sm"
                >
                  <Trash2 size={14} className="inline ml-1" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">لا توجد كوبونات</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            أضف أول كوبون
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {editingCoupon ? 'تعديل كوبون' : 'إضافة كوبون جديد'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">كود الكوبون *</label>
                  <input
                    type="text"
                    required
                    className="input-field uppercase"
                    placeholder="مثال: WELCOME10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">الوصف</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="وصف الكوبون"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">نوع الخصم</label>
                    <select
                      className="input-field"
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">قيمة ثابتة (ج.س)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">قيمة الخصم *</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      placeholder={formData.discount_type === 'percentage' ? 'مثال: 10' : 'مثال: 50'}
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">الحد الأدنى للطلب</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">الحد الأقصى للخصم</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="بدون حد"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">عدد الاستخدامات المسموح</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="غير محدود"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">تاريخ البدء</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'جاري الحفظ...' : (editingCoupon ? 'تحديث' : 'إضافة')}
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