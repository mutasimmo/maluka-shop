'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Smartphone, Send, Save, CheckCircle } from 'lucide-react';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    merchant_whatsapp: '249123456789',
    send_customer_notifications: true,
    send_merchant_notifications: true,
    auto_send_on_order: true,
    auto_send_on_status_change: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('shop_settings')
      .select('*')
      .in('key', [
        'merchant_whatsapp',
        'send_customer_notifications',
        'send_merchant_notifications',
        'auto_send_on_order',
        'auto_send_on_status_change',
      ]);

    if (data) {
      const settingsMap = new Map(data.map(s => [s.key, s.value]));
      setSettings({
        merchant_whatsapp: settingsMap.get('merchant_whatsapp')?.value || '249123456789',
        send_customer_notifications: settingsMap.get('send_customer_notifications')?.value || true,
        send_merchant_notifications: settingsMap.get('send_merchant_notifications')?.value || true,
        auto_send_on_order: settingsMap.get('auto_send_on_order')?.value || true,
        auto_send_on_status_change: settingsMap.get('auto_send_on_status_change')?.value || true,
      });
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    
    const updates = [
      { key: 'merchant_whatsapp', value: { value: settings.merchant_whatsapp } },
      { key: 'send_customer_notifications', value: { value: settings.send_customer_notifications } },
      { key: 'send_merchant_notifications', value: { value: settings.send_merchant_notifications } },
      { key: 'auto_send_on_order', value: { value: settings.auto_send_on_order } },
      { key: 'auto_send_on_status_change', value: { value: settings.auto_send_on_status_change } },
    ];

    for (const update of updates) {
      await supabase.from('shop_settings').upsert(update, { onConflict: 'key' });
    }

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sendTestNotification = () => {
    if (!testPhone) {
      alert('الرجاء إدخال رقم الهاتف');
      return;
    }
    
    setTestSending(true);
    const message = `🔔 *رسالة تجريبية من ملوكا شوب*

هذه رسالة تجريبية للتأكد من إعدادات الإشعارات.

✅ نظام الإشعارات يعمل بشكل صحيح!

📅 التاريخ: ${new Date().toLocaleString('ar')}

شكراً لتسوقك مع ملوكا شوب 🛍️`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${testPhone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setTestSending(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Bell size={28} className="text-green-600" />
        <h1 className="text-3xl font-bold text-gray-800">إعدادات الإشعارات</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* WhatsApp Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">إعدادات واتساب</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">رقم واتساب التاجر</label>
              <input
                type="tel"
                className="input-field"
                placeholder="249123456789"
                value={settings.merchant_whatsapp}
                onChange={(e) => setSettings({ ...settings, merchant_whatsapp: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">بالصيغة الدولية: 249xxxxxxxxx</p>
            </div>
          </div>
        </div>

        {/* Notification Triggers */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Send size={24} className="text-green-600" />
            <h2 className="text-xl font-bold">متى يتم الإرسال؟</h2>
          </div>

          <div className="space-y-3">
            <label className="flex justify-between items-center p-3 bg-gray-50 rounded-xl cursor-pointer">
              <span>إرسال إشعار للعميل عند إنشاء الطلب</span>
              <input
                type="checkbox"
                className="w-5 h-5 text-green-600"
                checked={settings.send_customer_notifications}
                onChange={(e) => setSettings({ ...settings, send_customer_notifications: e.target.checked })}
              />
            </label>

            <label className="flex justify-between items-center p-3 bg-gray-50 rounded-xl cursor-pointer">
              <span>إرسال إشعار للتاجر عند إنشاء الطلب</span>
              <input
                type="checkbox"
                className="w-5 h-5 text-green-600"
                checked={settings.send_merchant_notifications}
                onChange={(e) => setSettings({ ...settings, send_merchant_notifications: e.target.checked })}
              />
            </label>

            <label className="flex justify-between items-center p-3 bg-gray-50 rounded-xl cursor-pointer">
              <span>إرسال تلقائي عند تغيير حالة الطلب</span>
              <input
                type="checkbox"
                className="w-5 h-5 text-green-600"
                checked={settings.auto_send_on_status_change}
                onChange={(e) => setSettings({ ...settings, auto_send_on_status_change: e.target.checked })}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">اختبار الإشعارات</h2>
        <div className="flex gap-3">
          <input
            type="tel"
            placeholder="رقم الهاتف للاختبار"
            className="input-field flex-1"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
          />
          <button
            onClick={sendTestNotification}
            disabled={testSending}
            className="btn-primary"
          >
            إرسال تجريبي
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">سيتم فتح واتساب لإرسال رسالة تجريبية</p>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button onClick={saveSettings} disabled={loading} className="btn-primary flex items-center gap-2">
          <Save size={18} />
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {saved && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle size={20} />
          تم حفظ الإعدادات بنجاح
        </div>
      )}
    </div>
  );
}