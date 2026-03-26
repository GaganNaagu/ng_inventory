import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import Layout from '../components/Layout';
import { Plus, Pencil, Trash2, X, Search, AlertTriangle } from 'lucide-react';

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; sku: string; description: string;
  price: number; quantity: number; reorder_threshold: number;
  category_id: string; category_name: string; expiry_date: string;
  is_low_stock: boolean;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', description: '', price: '', quantity: '', reorder_threshold: '10', category_id: '', expiry_date: '' });
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filterCategory) params.category_id = filterCategory;
      if (showLowStock) params.low_stock = 'true';
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try { const res = await api.get('/categories'); setCategories(res.data); } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [search, filterCategory, showLowStock]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', sku: '', description: '', price: '', quantity: '', reorder_threshold: '10', category_id: '', expiry_date: '' });
    setError(''); setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, sku: p.sku, description: p.description || '',
      price: String(p.price), quantity: String(p.quantity),
      reorder_threshold: String(p.reorder_threshold),
      category_id: p.category_id || '', expiry_date: p.expiry_date || ''
    });
    setError(''); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price), quantity: parseInt(form.quantity),
      reorder_threshold: parseInt(form.reorder_threshold),
      category_id: form.category_id || null, expiry_date: form.expiry_date || null
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false); fetchProducts();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); fetchProducts(); } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors";

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => setShowLowStock(!showLowStock)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showLowStock ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <AlertTriangle size={14} /> Low Stock
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-orange-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-orange-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-orange-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.category_name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">₹{Number(p.price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{p.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.is_low_stock ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                      <AlertTriangle size={12} /> Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button onClick={() => openEdit(p)} className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto border border-orange-100 dark:border-gray-700 transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    className={inputClasses} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU *</label>
                  <input type="text" required value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})}
                    className={inputClasses} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2}
                  className={inputClasses} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}
                    className={inputClasses} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity *</label>
                  <input type="number" required value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})}
                    className={inputClasses} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reorder Threshold</label>
                  <input type="number" value={form.reorder_threshold} onChange={(e) => setForm({...form, reorder_threshold: e.target.value})}
                    className={inputClasses} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})}
                    className={inputClasses}>
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={(e) => setForm({...form, expiry_date: e.target.value})}
                    className={inputClasses} />
                </div>
              </div>
              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
              <button type="submit" className="w-full py-2 px-4 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 dark:focus:ring-offset-gray-800 transition-colors">
                {editingId ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
