import { Routes, Route, BrowserRouter } from 'react-router-dom'
import ReceiptPage from './pages/ReceiptPage/index';
import WarrantyTermPage from './pages/WarrantyTermPage';
import DeliverySchedule from './pages/App/DeliverySchedule';; 
import SalesOrder from './pages/App/SalesOrder';
import AppLayout from './AppLayout';

function Router() {
  return (
  
      <BrowserRouter>
        
        <Routes>
          <Route path="/" element={<AppLayout />}>
          <Route path='/receipt' element={<ReceiptPage />} />
          <Route path='/sales-order' element={<SalesOrder />} />
          <Route path='/warranty-term' element={<WarrantyTermPage />} />
          <Route path='/schedule' element={<DeliverySchedule />} />
          </Route>
        </Routes>
      </BrowserRouter>
   
  );
}

export default Router;
