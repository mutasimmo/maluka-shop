'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  MapPin,
  Clock,
  Mail,
} from 'lucide-react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const mainMenuItems = [
    { href: '/', label: 'الرئيسية', icon: '🏠' },
    { href: '/products', label: 'المنتجات', icon: '📦' },
    { href: '/about', label: 'عن المتجر', icon: 'ℹ️' },
    { href: '/contact', label: 'اتصل بنا', icon: '📞' },
    { href: '/orders', label: 'طلباتي', icon: '📋' },
    { href: '/policies', label: 'السياسات', icon: '📜' },
    { href: '/faq', label: 'الأسئلة الشائعة', icon: '❓' },
  ];

  // بيانات الأقسام (Categories)
  const categorySections = [
    {
      title: 'إلكترونيات',
      icon: '📱',
      links: [
        { label: 'جوالات', href: '/products?category=جوالات' },
        { label: 'لابتوبات', href: '/products?category=لابتوبات' },
        { label: 'سماعات', href: '/products?category=سماعات' },
        { label: 'شواحن', href: '/products?category=شواحن' },
      ],
    },
    {
      title: 'أزياء',
      icon: '👕',
      links: [
        { label: 'رجالي', href: '/products?category=رجالي' },
        { label: 'نسائي', href: '/products?category=نسائي' },
        { label: 'أطفال', href: '/products?category=أطفال' },
        { label: 'أحذية', href: '/products?category=أحذية' },
      ],
    },
    {
      title: 'المنزل والمطبخ',
      icon: '🏠',
      links: [
        { label: 'أثاث', href: '/products?category=أثاث' },
        { label: 'أجهزة منزلية', href: '/products?category=أجهزة منزلية' },
        { label: 'أدوات مطبخ', href: '/products?category=أدوات مطبخ' },
        { label: 'ديكور', href: '/products?category=ديكور' },
      ],
    },
    {
      title: 'عناية شخصية',
      icon: '💄',
      links: [
        { label: 'عطور', href: '/products?category=عطور' },
        { label: 'مكياج', href: '/products?category=مكياج' },
        { label: 'عناية بالبشرة', href: '/products?category=عناية بالبشرة' },
        { label: 'عناية بالشعر', href: '/products?category=عناية بالشعر' },
      ],
    },
    {
      title: 'رياضة',
      icon: '⚽',
      links: [
        { label: 'معدات رياضية', href: '/products?category=معدات رياضية' },
        { label: 'ملابس رياضية', href: '/products?category=ملابس رياضية' },
        { label: 'أحذية رياضية', href: '/products?category=أحذية رياضية' },
      ],
    },
    {
      title: 'كتب وأدوات مكتبية',
      icon: '📚',
      links: [
        { label: 'كتب', href: '/products?category=كتب' },
        { label: 'أدوات مدرسية', href: '/products?category=أدوات مدرسية' },
        { label: 'قرطاسية', href: '/products?category=قرطاسية' },
      ],
    },
  ];

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('maluka_cart');
      const items = cart ? JSON.parse(cart) : [];

      const count = items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );

      setCartCount(count);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-green-700/95 backdrop-blur-md shadow-xl'
            : 'bg-gradient-to-r from-green-700 to-green-600'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* LOGO */}
            <Link href="/" className="text-xl md:text-2xl font-extrabold whitespace-nowrap">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                ملوكا
              </span>
              <span className="text-white"> شوب</span>
              <span className="text-sm text-yellow-300 mr-1">🛍️</span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-5 lg:gap-7">
              {mainMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-1.5 text-white/90 hover:text-yellow-300 transition relative px-1 py-2"
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm lg:text-base">{item.label}</span>
                  <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}

              {/* MEGA MENU - الأقسام */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-white/90 hover:text-yellow-300 transition px-2 py-2">
                  <span>📂</span>
                  <span className="text-sm lg:text-base">الأقسام</span>
                </button>

                <div className="absolute top-12 right-0 w-[800px] bg-white text-black shadow-2xl rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="grid grid-cols-3 gap-6">
                    {categorySections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="text-green-700 font-bold mb-3 flex items-center gap-2">
                          <span>{section.icon}</span>
                          {section.title}
                        </h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          {section.links.map((link, linkIdx) => (
                            <li key={linkIdx}>
                              <Link
                                href={link.href}
                                className="hover:text-green-600 cursor-pointer transition block"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* عرض خاص داخل القائمة */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600">🔥 عروض حصرية لفترة محدودة</p>
                      <Link
                        href="/products?discount=true"
                        className="inline-block mt-2 bg-green-600 text-white px-4 py-1 rounded-full text-sm hover:bg-green-700 transition"
                      >
                        تسوق العروض الآن
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3 md:gap-4">
              <button className="text-white/80 hover:text-white">
                <Search size={20} />
              </button>

              <Link href="/cart" className="relative">
                <ShoppingCart size={22} className="text-white hover:scale-110 transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 pb-4 border-t border-green-500/40">
              <div className="flex flex-col gap-1 mt-3">
                {mainMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 text-white/90 hover:bg-white/10 rounded-lg text-sm"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* الأقسام في الموبايل */}
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-yellow-300 px-3 py-2 text-sm font-bold">📂 الأقسام</p>
                  {categorySections.map((section, idx) => (
                    <div key={idx} className="mr-4">
                      <p className="text-white/80 px-3 py-1 text-xs flex items-center gap-2">
                        <span>{section.icon}</span>
                        {section.title}
                      </p>
                      {section.links.map((link, linkIdx) => (
                        <Link
                          key={linkIdx}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-2 px-8 text-white/70 hover:bg-white/10 rounded-lg text-sm"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="h-16" />

      {/* CONTENT */}
      {children}

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-right">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-yellow-400">ملوكا</span> شوب
              </h3>
              <p className="text-gray-300">
                متجر سوداني يقدم منتجات محلية بجودة عالية
              </p>
            </div>

            <div>
              <h4 className="text-yellow-400 mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-300">
                {mainMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-gray-300 space-y-2">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <Phone size={16} /> 0917117123
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} /> info@malukashop.com
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <MapPin size={16} /> الخرطوم - السودان
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <Clock size={16} /> 9ص - 9م
              </p>
            </div>

            <div>
              <h4 className="text-yellow-400 mb-4">تابعنا</h4>
              <div className="flex gap-4 justify-center md:justify-start">
                <Facebook className="cursor-pointer hover:text-yellow-400 transition" />
                <Instagram className="cursor-pointer hover:text-yellow-400 transition" />
                <Twitter className="cursor-pointer hover:text-yellow-400 transition" />
                <Youtube className="cursor-pointer hover:text-yellow-400 transition" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            © 2026 ملوكا شوب. جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </>
  );
}