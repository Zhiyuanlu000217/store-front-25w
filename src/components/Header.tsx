'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import CartSheet from './CartSheet';

export default function Header() {
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Best Buy Clone
          </Link>
          
          <button 
            className="relative p-2 rounded-full hover:bg-blue-700 transition-colors"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
} 