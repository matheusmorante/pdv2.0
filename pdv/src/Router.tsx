import SalesOrder from './pages/App/SalesOrder';
import AppLayout from './AppLayout';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import ReceiptPage from './pages/ReceiptPage';
import WarrantyTermPage from './pages/WarrantyTermPage';
import DeliverySchedule from './pages/App/DeliverySchedule';
import OrderPage from './pages/OrderPage';
import ComingSoon from './components/shared/ComingSoon';
import Products from './pages/App/Products/Index';


function Router() {
  return (

    <BrowserRouter>

      <Routes>
        <Route path='/receipt' element={<ReceiptPage />} />
        <Route path='/order' element={<OrderPage />} />
        <Route path='/schedule' element={<DeliverySchedule />} />
        <Route path='/' element={<AppLayout />}>
          <Route path='/sales-order' element={<SalesOrder />} />
          <Route path='/warranty-term' element={<WarrantyTermPage />} />
          <Route path='/delivery-schedule' element={<DeliverySchedule />} />

          {/* Registrations */}
          <Route path='/registrations/products' element={<Products />} />
          <Route path='/registrations/customers' element={<ComingSoon title="Clientes" />} />
          <Route path='/registrations/suppliers' element={<ComingSoon title="Fornecedores" />} />
          <Route path='/registrations/employees' element={<ComingSoon title="Funcionários" />} />
        </Route>
      </Routes>
    </BrowserRouter>

  );
}

export default Router;
