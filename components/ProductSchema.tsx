'use client';

import { useEffect } from 'react';

interface ProductSchemaProps {
  product: {
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    stock: number;
    category: string | null;
  };
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description || 'منتج سوداني أصلي',
      image: product.image_url || 'https://maluka-shop.vercel.app/logo.png',
      sku: product.name,
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'SDG',
        availability: product.stock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        url: `https://maluka-shop.vercel.app/product/${product.name}`,
      },
      brand: {
        '@type': 'Brand',
        name: 'ملوكا شوب',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '15',
      },
    });
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  return null;
}