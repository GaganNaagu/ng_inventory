import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-orange-100 dark:border-gray-700 transition-colors duration-300">
        <p className="text-gray-600 dark:text-gray-300">Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{user?.email}</span></p>
        <span className="inline-block mt-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs font-medium">
          {user?.role}
        </span>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Use the sidebar to manage your products and categories.</p>
      </div>
    </Layout>
  );
}
