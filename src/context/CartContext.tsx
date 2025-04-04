'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  _id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  description: string;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.sku === item.sku);
      if (existingItem) {
        return currentItems.map(i =>
          i.sku === item.sku
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...currentItems, item];
    });
  };

  const removeItem = (index: number) => {
    setItems(currentItems => currentItems.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    
    console.log(`CartContext: Updating quantity for item at index ${index} to ${quantity}`);
    
    setItems(currentItems => {
      const updatedItems = currentItems.map((item, i) => 
        i === index ? { ...item, quantity } : item
      );
      console.log('Updated items:', updatedItems);
      return updatedItems;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 