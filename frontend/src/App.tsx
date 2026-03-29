import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import POS from './pages/POS';
import Sales from './pages/Sales';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute><Products /></ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute><Categories /></ProtectedRoute>
        } />
        <Route path="/pos" element={
          <ProtectedRoute><POS /></ProtectedRoute>
        } />
        <Route path="/sales" element={
          <ProtectedRoute><Sales /></ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
