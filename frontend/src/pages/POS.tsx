import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/axios';
import Layout from '../components/Layout';
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string; name: string; sku: string; price: number; quantity: number;
}
interface CartItem extends Product { cartQuantity: number; }

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;

  const fetchProducts = async (offset = 0, append = false) => {
    try {
      if (!append) setLoadingMore(true);
      const res = await api.get('/products', { params: { search, limit: PAGE_SIZE, offset } });
      const newProducts: Product[] = res.data;
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      setHasMore(newProducts.length === PAGE_SIZE);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  };

  // Reset pagination when search changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(0, false);
  }, [search]);

  // Load more when page increments
  useEffect(() => {
    if (page > 0) fetchProducts(page * PAGE_SIZE, true);
  }, [page]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = gridRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev; // Do not increment via product click if already in cart
      }
      if (product.quantity <= 0) return prev; // Out of stock
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const adjustQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.cartQuantity + delta;
        if (newQ > item.quantity || newQ < 1) return item;
        return { ...item, cartQuantity: newQ };
      }
      return item;
    }));
  };

  const setExactQuantity = (id: string, value: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (value === '') return { ...item, cartQuantity: 0 };
        let newQ = parseInt(value);
        if (isNaN(newQ) || newQ < 0) return item;
        if (newQ > item.quantity) newQ = item.quantity;
        return { ...item, cartQuantity: newQ };
      }
      return item;
    }));
  };

  const handleQuantityBlur = (id: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && (item.cartQuantity === 0 || isNaN(item.cartQuantity))) {
        return { ...item, cartQuantity: 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => { setCart(prev => prev.filter(i => i.id !== id)); };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await api.post('/sales', {
        items: cart.map(item => ({ productId: item.id, quantity: item.cartQuantity }))
      });
      toast.success('Sale completed successfully!');
      setCart([]);
      setPage(0);
      setHasMore(true);
      fetchProducts(0, false); // Refresh stock
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-8rem)] gap-6">
        
        {/* Products Grids */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-orange-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="p-4 border-b border-orange-100 dark:border-gray-700">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors" />
            </div>
          </div>
          <div ref={gridRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min content-start">
            {products.map(p => {
              const inCart = cart.some(item => item.id === p.id);
              return (
                <div key={p.id} onClick={() => addToCart(p)}
                  className={`border rounded-lg p-4 transition-all ${
                    p.quantity <= 0 
                      ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900' 
                      : inCart
                        ? 'cursor-default border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                        : 'cursor-pointer border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-md bg-white dark:bg-gray-800'
                  }`}>
                  
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{p.sku}</p>
                    </div>
                    {inCart && (
                      <span className="shrink-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                        In Cart
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-orange-600 dark:text-orange-400">₹{Number(p.price).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.quantity > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                      {p.quantity > 0 ? `${p.quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="w-full md:w-96 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-orange-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="p-4 border-b border-orange-100 dark:border-gray-700 bg-orange-50 dark:bg-gray-700 flex justify-between items-center transition-colors duration-300">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><ShoppingCart size={20} /> Current Sale</h2>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded-full">{cart.length} items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <ShoppingCart size={48} className="mb-2 opacity-20" />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">₹{Number(item.price).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button onClick={() => adjustQuantity(item.id, -1)} className="p-1 hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"><Minus size={14}/></button>
                      <input 
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={item.cartQuantity || ''}
                        onChange={(e) => setExactQuantity(item.id, e.target.value)}
                        onBlur={() => handleQuantityBlur(item.id)}
                        className="w-10 text-center text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white p-0 m-0 [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                      <button onClick={() => adjustQuantity(item.id, 1)} className="p-1 hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-orange-100 dark:border-gray-700 bg-orange-50 dark:bg-gray-700 transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
            </div>
            


            <button onClick={handleCheckout} disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors
                ${cart.length > 0 ? 'bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:outline-none dark:focus:ring-offset-gray-800 shadow-md' : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'}`}>
              Checkout
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
