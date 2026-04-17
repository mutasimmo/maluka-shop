'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, ShoppingCart, Truck, CreditCard, RefreshCw, Package, Phone } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: JSX.Element;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs: FAQItem[] = [
    {
      category: 'الطلبات',
      icon: <ShoppingCart size={20} />,
      question: 'كيف يمكنني طلب منتج؟',
      answer: 'يمكنك طلب المنتج باتباع الخطوات التالية: 1. تصفح المنتجات وأضف ما تريد إلى السلة. 2. اذهب إلى صفحة الدفع وأدخل بياناتك. 3. اختر طريقة الدفع المناسبة. 4. أكد الطلب وسنتواصل معك للتأكيد.',
    },
    {
      category: 'الطلبات',
      icon: <ShoppingCart size={20} />,
      question: 'كيف أتتبع طلبي؟',
      answer: 'يمكنك تتبع طلبك من خلال صفحة "طلباتي" بعد إدخال رقم هاتفك. ستظهر لك حالة الطلب (قيد المعالجة، تم الدفع، تم الشحن، تم التوصيل).',
    },
    {
      category: 'الشحن',
      icon: <Truck size={20} />,
      question: 'كم تستغرق عملية التوصيل؟',
      answer: 'تستغرق عملية التوصيل من 2 إلى 5 أيام عمل حسب موقعك. نوصل لجميع ولايات السودان.',
    },
    {
      category: 'الشحن',
      icon: <Truck size={20} />,
      question: 'كم تبلغ رسوم التوصيل؟',
      answer: 'رسوم التوصيل 500 ج.س لجميع الولايات، وتصبح مجانية للطلبات التي تزيد عن 5000 ج.س.',
    },
    {
      category: 'الدفع',
      icon: <CreditCard size={20} />,
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'ندعم عدة طرق للدفع: الدفع عند الاستلام (كاش)، تحويل بنكي (بنكك، بنك النيل، بنك السودان)، محافظ إلكترونية (أوكاش، فوري).',
    },
    {
      category: 'الدفع',
      icon: <CreditCard size={20} />,
      question: 'هل الدفع آمن؟',
      answer: 'نعم، الدفع آمن 100%. نستخدم أنظمة تشفير متقدمة لحماية بياناتك المالية.',
    },
    {
      category: 'الإرجاع',
      icon: <RefreshCw size={20} />,
      question: 'ماذا أفعل إذا وصل المنتج تالفاً؟',
      answer: 'في حال وصول منتج تالف، يرجى التواصل مع خدمة العملاء خلال 24 ساعة من الاستلام وسنقوم باستبداله فوراً.',
    },
    {
      category: 'الإرجاع',
      icon: <RefreshCw size={20} />,
      question: 'هل يمكنني إرجاع المنتج إذا لم يعجبني؟',
      answer: 'نعم، يمكنك إرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون بحالته الأصلية غير مستخدم.',
    },
    {
      category: 'المنتجات',
      icon: <Package size={20} />,
      question: 'هل المنتجات أصلية؟',
      answer: 'نعم، جميع منتجاتنا أصلية 100% ونضمن جودتها. نتعامل مع موردين موثوقين.',
    },
    {
      category: 'المنتجات',
      icon: <Package size={20} />,
      question: 'ماذا لو كان المنتج غير متوفر؟',
      answer: 'إذا كان المنتج غير متوفر، سيظهر لك "غير متوفر حالياً". يمكنك متابعة المنتج وسنخبرك عند توفره.',
    },
    {
      category: 'الدعم',
      icon: <Phone size={20} />,
      question: 'كيف أتواصل مع خدمة العملاء؟',
      answer: 'يمكنك التواصل معنا عبر واتساب على الرقم 0917117123 أو عبر البريد الإلكتروني info@malukashop.com، أو من خلال صفحة اتصل بنا.',
    },
    {
      category: 'الدعم',
      icon: <Phone size={20} />,
      question: 'ما هي ساعات العمل؟',
      answer: 'نحن متاحون من السبت إلى الخميس من الساعة 9 صباحاً حتى 9 مساءً. الجمعة عطلة رسمية.',
    },
  ];

  const categories = ['all', ...new Set(faqs.map(f => f.category))];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.includes(searchTerm) || faq.answer.includes(searchTerm);
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-3">الأسئلة الشائعة</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          إجابات على أكثر الأسئلة شيوعاً عن متجر ملوكا شوب
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن سؤال..."
            className="w-full pr-10 pl-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full transition ${
              activeCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'الكل' : cat}
          </button>
        ))}
      </div>

      {/* FAQs Accordion */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filteredFaqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <button
              className="w-full p-4 text-right flex justify-between items-center hover:bg-gray-50 transition"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="text-green-600">{faq.icon}</span>
                <span className="font-semibold text-gray-800">{faq.question}</span>
              </div>
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 border-t bg-gray-50">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد نتائج مطابقة لبحثك</p>
        </div>
      )}

      {/* Contact CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">لم تجد إجابة لسؤالك؟</p>
        <a href="/contact" className="btn-primary inline-block">
          تواصل معنا
        </a>
      </div>
    </div>
  );
}