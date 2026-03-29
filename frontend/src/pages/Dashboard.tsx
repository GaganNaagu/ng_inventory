import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { api } from '../lib/axios';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardData {
  salesSummary: { today: number; thisWeek: number; thisMonth: number; };
  topProducts: { id: string; name: string; sku: string; total_sold: number; total_revenue: number; }[];
  lowStock: { id: string; name: string; sku: string; quantity: number; reorder_threshold: number; }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to load dashboard data');
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const generateInsights = async () => {
    setLoadingInsights(true);
    setInsights('');
    try {
      const res = await api.post('/analytics/insights');
      setInsights(res.data.insights);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to generate insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  if (!data) return <Layout><div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-orange-600 dark:text-orange-400" size={48} /></div></Layout>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Welcome back, {user?.email}</p>
        </div>
        <button 
          onClick={generateInsights} disabled={loadingInsights}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-orange-500 text-white rounded-lg text-sm font-bold shadow hover:opacity-90 disabled:opacity-50 transition-colors duration-300">
          {loadingInsights ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Generate AI Insights
        </button>
      </div>



      {/* AI Insights Panel */}
      {insights && (
        <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 dark:from-gray-800 dark:to-gray-800 dark:border-gray-700 rounded-xl shadow-sm relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-500 dark:from-orange-400 dark:to-orange-600"></div>
          <h2 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2 transition-colors duration-300">
            <Sparkles className="text-orange-600 dark:text-orange-400" size={20}/> 
            AI Executive Summary
          </h2>
          <div className="prose prose-sm prose-orange whitespace-pre-line text-gray-800 dark:text-gray-200 transition-colors duration-300">
            {insights}
          </div>
        </div>
      )}

      {/* Sales KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-orange-100 dark:border-gray-700 flex items-center transition-colors duration-300">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4 transition-colors duration-300"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Today's Sales</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">₹{data.salesSummary.today.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-orange-100 dark:border-gray-700 flex items-center transition-colors duration-300">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4 transition-colors duration-300"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">This Week</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">₹{data.salesSummary.thisWeek.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-orange-100 dark:border-gray-700 flex items-center transition-colors duration-300">
          <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mr-4 transition-colors duration-300"><Package size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">₹{data.salesSummary.thisMonth.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="p-4 border-b border-orange-100 dark:border-gray-700 bg-orange-50/50 dark:bg-gray-700 transition-colors duration-300">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 transition-colors duration-300">
              <TrendingUp size={18} className="text-orange-600 dark:text-orange-400"/> 
              Top Selling Products
            </h3>
          </div>
          <div className="p-4">
            {data.topProducts.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No sales data yet.</p> : (
              <ul className="divide-y divide-orange-100 dark:divide-gray-700 transition-colors duration-300">
                {data.topProducts.map((p, i) => (
                  <li key={p.id} className="py-3 flex justify-between items-center transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-400 w-4">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{p.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300">{p.total_sold} sold</p>
                      <p className="text-xs text-green-600 dark:text-green-400 transition-colors duration-300">₹{p.total_revenue.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="p-4 border-b border-orange-100 dark:border-gray-700 bg-orange-50/50 dark:bg-gray-700 transition-colors duration-300">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 transition-colors duration-300">
              <AlertTriangle size={18} className="text-red-500 dark:text-red-400"/> 
              Low Stock Alerts
            </h3>
          </div>
          <div className="p-4">
            {data.lowStock.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4 transition-colors duration-300">All stock levels are healthy.</p> : (
              <ul className="divide-y divide-orange-100 dark:divide-gray-700 transition-colors duration-300">
                {data.lowStock.map((p) => (
                  <li key={p.id} className="py-3 flex justify-between items-center transition-colors duration-300">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 transition-colors duration-300">
                        {p.quantity} left
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Threshold: {p.reorder_threshold}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
