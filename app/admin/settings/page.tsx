'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Bell, DollarSign, Truck, Package, Shield } from 'lucide-react';

interface Settings {
  shop_name: string;
  shop_description: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  delivery_fee: number;
  free_delivery_min: number;
  currency: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    shop_name: 'ملوكا شوب',
    shop_description: 'متجر سوداني يقدم أفضل المنتجات المحلية الأصيلة',
    contact_phone: '0912345678',
    contact_email: 'info@malukashop.com',
    contact_address: 'الخرطوم، السودان',
    delivery_fee: 500,
    free_delivery_min: 5000,
    currency: 'ج.س',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('shop_settings')
      .select('*');
    
    if (data) {
      const settingsMap = new Map(data.map(s => [s.key, s.value]));
      setSettings({
        shop_name: settingsMap.get('shop_name')?.ar || 'ملوكا شوب',
        shop_description: settingsMap.get('shop_description')?.ar || '',
        contact_phone: settingsMap.get('contact_phone')?.value || '0912345678',
        contact_email: settingsMap.get('contact_email')?.value || 'info@malukashop.com',
        contact_address: settingsMap.get('contact_address')?.value || 'الخرطوم، السودان',
        delivery_fee: settingsMap.get('delivery_fee')?.value || 500,
        free_delivery_min: settingsMap.get('free_delivery_min')?.value || 5000,
        currency: settingsMap.get('currency')?.value || 'ج.س',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    const updates = [
      { key: 'shop_name', value: { ar: settings.shop_name } },
      { key: 'shop_description', value: { ar: settings.shop_description } },
      { key: 'contact_phone', value: { value: settings.contact_phone } },
      { key: 'contact_email', value: { value: settings.contact_email } },
      { key: 'contact_address', value: { value: settings.contact_address } },
      { key: 'delivery_fee', value: { value: settings.delivery_fee } },
      { key: 'free_delivery_min', value: { value: settings.free_delivery_min } },
      { key: 'currency', value: { value: settings.currency } },
    ];

    for (const update of updates) {
      await supabase
        .from('shop_settings')
        .upsert(update, { onConflict: 'key' });
    }

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إعدادات المتجر</h1>
        <p className="text-gray-500 mt-1">تخصيص إعدادات المتجر</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">الإعدادات العامة</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">اسم المتجر</label>
              <input
                type="text"
                className="input-field"
                value={settings.shop_name}
                onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">وصف المتجر</label>
              <textarea
                className="input-field"
                rows={3}
                value={settings.shop_description}
                onChange={(e) => setSettings({ ...settings, shop_description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">معلومات الاتصال</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                className="input-field"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                className="input-field"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">العنوان</label>
              <input
                type="text"
                className="input-field"
                value={settings.contact_address}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">إعدادات الشحن</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">رسوم التوصيل (ج.س)</label>
              <input
                type="number"
                className="input-field"
                value={settings.delivery_fee}
                onChange={(e) => setSettings({ ...settings, delivery_fee: parseInt(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">الحد الأدنى للتوصيل المجاني (ج.س)</label>
              <input
                type="number"
                className="input-field"
                value={settings.free_delivery_min}
                onChange={(e) => setSettings({ ...settings, free_delivery_min: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-400 mt-1">الطلبات التي تزيد عن هذا المبلغ تصبح مجانية التوصيل</p>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">إعدادات الدفع</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">العملة</label>
              <input
                type="text"
                className="input-field"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-green-600" />
                <span className="font-semibold">طرق الدفع المتاحة</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['الدفع عند الاستلام', 'بنكك', 'أوكاش', 'فوري', 'بنك النيل', 'مصرف البلد'].map((method) => (
                  <span key={method} className="px-2 py-1 bg-white rounded-lg text-sm">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fadeInUp">
          ✓ تم حفظ الإعدادات بنجاح
        </div>
      )}
    </div>
  );
}