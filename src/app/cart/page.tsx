'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { env } from '@/config/env';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${env.orderApiUrl}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            sku: item.sku,
            quantity: item.quantity.toString()
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      await response.json();
      alert('Order placed successfully!');
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Your cart is empty</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">SKU: {item.sku}</p>
                    <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">Qty: {item.quantity}</span>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 