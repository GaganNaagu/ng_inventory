import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import Layout from '../components/Layout';
import { Receipt } from 'lucide-react';

interface Sale {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales');
      setSales(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchSales(); }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt /> Sales History
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-orange-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-orange-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cashier</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-orange-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(sale.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {sale.user_email || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600 dark:text-orange-400 text-right">
                  ₹{Number(sale.total_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No sales transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
