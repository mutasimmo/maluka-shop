import { Product, CartItem } from './supabase';

export const formatPrice = (price: number): string => {
  // تحديد اللغة العربية بشكل واضح لتوحيد التنسيق بين الخادم والمتصفح
  return `${price.toLocaleString('ar-EG')} ج.س`;
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${month}${day}${random}`;
};

// سلة التسوق - localStorage
export const saveCart = (cart: CartItem[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('maluka_cart', JSON.stringify(cart));
  }
};

export const loadCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('maluka_cart');
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

export const addToCart = (product: Product, quantity: number = 1): void => {
  const cart = loadCart();
  const existing = cart.find(item => item.product_id === product.id);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url || undefined
    });
  }
  
  saveCart(cart);
};

export const removeFromCart = (productId: string): void => {
  const cart = loadCart();
  const filtered = cart.filter(item => item.product_id !== productId);
  saveCart(filtered);
};

export const updateQuantity = (productId: string, quantity: number): void => {
  const cart = loadCart();
  const item = cart.find(item => item.product_id === productId);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
};

export const getCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartCount = (cart: CartItem[]): number => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};

export const clearCart = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('maluka_cart');
  }
};