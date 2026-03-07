import SalesOrder from './pages/App/SalesOrder';
import Dashboard from './pages/App/Dashboard/Index';
import AppLayout from './AppLayout';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import ReceiptPage from './pages/ReceiptPage';
import WarrantyTermPage from './pages/WarrantyTermPage';
import DeliverySchedule from './pages/App/DeliverySchedule';
import OrderPage from './pages/OrderPage';
import ComingSoon from './components/shared/ComingSoon';
import Products from './pages/App/Products/Index';
import Settings from './pages/App/Settings';
import Customers from './pages/App/Customers/Index';
import Suppliers from './pages/App/Suppliers/Index';
import Employees from './pages/App/Employees/Index';
import Services from './pages/App/Services/Index';
import Variations from './pages/App/Variations/Index';

function Router() {
  return (

    <BrowserRouter>

      <Routes>
        <Route path='/receipt' element={<ReceiptPage />} />
        <Route path='/order' element={<OrderPage />} />
        <Route path='/schedule' element={<DeliverySchedule />} />
        <Route path='/' element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path='/sales-order' element={<SalesOrder />} />
          <Route path='/warranty-term' element={<WarrantyTermPage />} />
          <Route path='/delivery-schedule' element={<DeliverySchedule />} />
          <Route path='/settings' element={<Settings />} />

          {/* Registrations */}
          <Route path='/registrations/products' element={<Products />} />
          <Route path='/registrations/services' element={<Services />} />
          <Route path='/registrations/variations' element={<Variations />} />
          <Route path='/registrations/customers' element={<Customers />} />
          <Route path='/registrations/suppliers' element={<Suppliers />} />
          <Route path='/registrations/employees' element={<Employees />} />
        </Route>
      </Routes>
    </BrowserRouter>

  );
}

export default Router;
