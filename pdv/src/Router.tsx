import SalesOrder from './pages/App/SalesOrder';
import AppLayout from './AppLayout';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import ReceiptPage from './pages/ReceiptPage';
import WarrantyTermPage from './pages/WarrantyTermPage';
import DeliverySchedule from './pages/App/DeliverySchedule'; import OrderPage from './pages/OrderPage';
;


function Router() {
  return (

    <BrowserRouter>
   
      <Routes>
           <Route path='/receipt' element={<ReceiptPage />} />
      <Route path='/order' element={<OrderPage />} />
        <Route path='/' element={<AppLayout />}>
          <Route path='/sales-order' element={<SalesOrder />} />
          <Route path='/warranty-term' element={<WarrantyTermPage />} />
          <Route path='/schedule' element={<DeliverySchedule />} />
        </Route>
      </Routes>
    </BrowserRouter>

  );
}

export default Router;
