'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // في الواقع، يمكن ربط هذا بـ Supabase أو خدمة بريد إلكتروني
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">اتصل بنا</h1>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">معلومات الاتصال</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-500">الهاتف</p>
                <p className="font-medium">0917117123</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium">info@malukashop.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-500">العنوان</p>
                <p className="font-medium">الخرطوم، السودان</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-bold mb-2">ساعات العمل</h3>
            <p className="text-gray-600">السبت - الخميس: 9:00 ص - 9:00 م</p>
            <p className="text-gray-600">الجمعة: مغلق</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">أرسل لنا رسالة</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">الاسم</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">الرسالة</label>
              <textarea
                required
                className="input-field"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Send size={18} />
              إرسال
            </button>
            
            {sent && (
              <p className="text-green-600 text-center mt-4">✓ تم إرسال رسالتك بنجاح</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}