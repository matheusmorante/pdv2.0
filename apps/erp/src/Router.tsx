import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SalesOrder from './pages/App/SalesOrder';
import Dashboard from './pages/App/Dashboard/Index';
import AppLayout from './AppLayout';
import PendingApproval from './pages/PendingApproval';
import ReceiptPage from './pages/ReceiptPage';
import WarrantyTermPage from './pages/WarrantyTermPage';
import DeliverySchedule from './pages/App/DeliverySchedule';
import OrderPage from './pages/OrderPage';
import Products from './pages/App/Products/Index';
import Categories from './pages/App/Products/Categories/Index';
import Settings from './pages/App/Settings';
import Customers from './pages/App/Customers/Index';
import Suppliers from './pages/App/Suppliers/Index';
import Employees from './pages/App/Employees/Index';
import Services from './pages/App/Services/Index';
import Variations from './pages/App/Variations/Index';
import Stock from './pages/App/Stock';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UsersManagementPage from './pages/App/Users/Index';
import ProfilePage from './pages/App/Profile/Index';
import PurchasesPage from './pages/App/Stock/Purchases/Index';
<<<<<<< HEAD:pdv/src/Router.tsx
import OrderRouteMap from './pages/App/SalesOrder/OrderRouteMap';
=======
import AttendanceDashboard from './pages/App/Attendance/Dashboard';
import WhatsAppMarketplace from './pages/App/Products/WhatsAppMarketplace';
>>>>>>> dev:apps/erp/src/Router.tsx

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, isPending } = useAuth();
  const logger = (globalThis as any).console;

  if (loading) {
    if (logger) logger.log('ProtectedRoute: still loading...');
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-10">
        <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 animate-pulse">Sincronizando Sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isPending) {
    return <PendingApproval />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function Router() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* Publicly accessible order pages could go here if needed */}
          <Route path='/receipt' element={<ReceiptPage />} />
          <Route path='/order' element={<OrderPage />} />
          <Route path='/schedule' element={<DeliverySchedule />} />

          {/* Protected ERP Application */}
          <Route path='/' element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path='/sales-order' element={<SalesOrder />} />
            <Route path='/sales-order/route-map' element={<OrderRouteMap />} />
            <Route path='/warranty-term' element={<WarrantyTermPage />} />
            <Route path='/delivery-schedule' element={<DeliverySchedule />} />
            <Route path='/attendance-dashboard' element={<AttendanceDashboard />} />
            <Route path='/settings' element={<AdminRoute><Settings /></AdminRoute>} />

            {/* Registrations */}
            <Route path='/registrations/products' element={<Products />} />
            <Route path='/registrations/whatsapp-marketplace' element={<WhatsAppMarketplace />} />
            <Route path='/registrations/product-categories' element={<Categories />} />
            <Route path='/stock' element={<Stock />} />
            <Route path='/stock/purchases' element={<PurchasesPage />} />
            <Route path='/registrations/services' element={<Services />} />
            <Route path='/registrations/variations' element={<Variations />} />
            <Route path='/registrations/customers' element={<Customers />} />
            <Route path='/registrations/suppliers' element={<Suppliers />} />
            <Route path='/registrations/employees' element={<Employees />} />
            <Route path='/users' element={<AdminRoute><UsersManagementPage /></AdminRoute>} />
            <Route path='/profile' element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default Router;
