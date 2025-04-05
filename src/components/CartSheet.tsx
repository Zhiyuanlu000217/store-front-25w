'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { env } from '@/config/env';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import Image from 'next/image';

interface OrderItem {
  name: string;
  sku: string;
  quantity: string;
}

interface Order {
  items: OrderItem[];
  orderId: string;
  timestamp: string;
  status: string;
}

interface OrderResponse {
  message: string;
  order: Order;
}

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const { items, removeItem, clearCart, updateQuantity } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Lock scroll when cart is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

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

      const orderData = await response.json();
      setOrderDetails(orderData);
      clearCart();
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[9998] 
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Cart Sheet */}
      <div 
        ref={sheetRef}
        className={`fixed bg-white shadow-lg transition-transform duration-300 ease-out transform z-[9999]
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          bottom-0 left-0 right-0 h-[40vh] min-h-[300px] rounded-t-3xl
          md:translate-y-0 md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-[400px] md:h-screen md:rounded-none md:rounded-l-2xl
          ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Shopping Cart</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          <ScrollArea.Root className="flex-1 overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              <div className="p-4">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-4 py-3 border-b">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image 
                            src={item.imageUrl} 
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-black">{item.name}</h3>
                          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-blue-600 font-bold text-xl">${item.price.toFixed(2)}</span>
                            <div className="flex items-center ml-auto">
                              <span className="text-gray-600 mr-2">Qty:</span>
                              <div className="flex items-center">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newQuantity = Math.max(1, item.quantity - 1);
                                    updateQuantity(index, newQuantity);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100 text-gray-600"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-white text-black">
                                  {item.quantity || 0}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    updateQuantity(index, item.quantity + 1);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100 text-gray-600"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 p-1 ml-2"
                              aria-label="Remove item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          {items.length > 0 && (
            <div className="p-4 border-t">
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
          )}
        </div>
      </div>

      {/* Order Confirmation Dialog */}
      <Dialog.Root open={!!orderDetails} onOpenChange={() => setOrderDetails(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-[10000]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-[10001]">
            <Dialog.Title className="text-2xl font-bold mb-4 text-black">Order Confirmed!</Dialog.Title>
            <div className="space-y-4">
              <p className="text-black">Your order has been successfully placed.</p>
              {orderDetails && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-4 text-black">
                    <div>
                      <h3 className="font-semibold mb-2">Order Summary</h3>
                      <p className="text-sm">Order ID: {orderDetails.order.orderId}</p>
                      <p className="text-sm">Date: {new Date(orderDetails.order.timestamp).toLocaleString()}</p>
                      <p className="text-sm">Status: {orderDetails.order.status.charAt(0).toUpperCase() + orderDetails.order.status.slice(1)}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Items Ordered</h3>
                      <div className="space-y-2">
                        {orderDetails.order.items.map((item: OrderItem, index: number) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-gray-600">Quantity: {item.quantity} • SKU: {item.sku}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Dialog.Close className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Close
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
} 