'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Heart, User, Search } from 'lucide-react';
import { getCartCount } from '@/lib/utils';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('maluka_cart');
      const items = cart ? JSON.parse(cart) : [];
      const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    
    const interval = setInterval(updateCartCount, 1000);
    
    // شفافية الهيدر عند التمرير
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-green-700/95 backdrop-blur-md shadow-xl' : 'bg-gradient-to-r from-green-700 to-green-600'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                ملوكا
              </span>
              <span className="text-white"> شوب</span>
              <span className="text-sm text-yellow-300 mr-1">🛍️</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8">
              {[
                { href: '/', label: 'الرئيسية', icon: '🏠' },
                { href: '/products', label: 'المنتجات', icon: '📦' },
                { href: '/about', label: 'عن المتجر', icon: 'ℹ️' },
                { href: '/contact', label: 'اتصل بنا', icon: '📞' },
                { href: '/orders', label: 'طلباتي', icon: '📋' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2 text-white/90 hover:text-white transition duration-300 font-medium"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {/* بحث (قيد التطوير) */}
              <button className="hidden md:block text-white/80 hover:text-white transition">
                <Search size={22} />
              </button>
              
              {/* سلة التسوق */}
              <Link href="/cart" className="relative group">
                <div className="relative">
                  <ShoppingCart size={24} className="text-white group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse-slow">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-green-500/50 animate-fadeInUp">
              <div className="flex flex-col gap-3">
                {[
                  { href: '/', label: 'الرئيسية', icon: '🏠' },
                  { href: '/products', label: 'المنتجات', icon: '📦' },
                  { href: '/about', label: 'عن المتجر', icon: 'ℹ️' },
                  { href: '/contact', label: 'اتصل بنا', icon: '📞' },
                  { href: '/orders', label: 'طلباتي', icon: '📋' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg px-3 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* مساحة للهيدر الثابت */}
      <div className="h-16"></div>
      
      {children}
      
      {/* Footer محسن */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-right">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-yellow-400">ملوكا</span> شوب
              </h3>
              <p className="text-gray-300 leading-relaxed">
                متجر سوداني يقدم أفضل المنتجات المحلية الأصيلة بجودة عالية وأسعار منافسة
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white transition">الرئيسية</Link></li>
                <li><Link href="/products" className="text-gray-300 hover:text-white transition">المنتجات</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white transition">عن المتجر</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition">اتصل بنا</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">تواصل معنا</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span>📞</span> 0917117123
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span>✉️</span> info@malukashop.com
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span>📍</span> الخرطوم - السودان
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">طرق الدفع</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {['بنكك', 'أوكاش', 'فوري', 'النيل', 'مصرف البلد'].map((method) => (
                  <span key={method} className="px-3 py-1 bg-white/10 rounded-lg text-sm">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© 2026 ملوكا شوب. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </>
  );
}