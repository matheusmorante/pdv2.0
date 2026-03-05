import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PdvPage from './pages/PdvPage/index';
import ReceiptPage from './pages/ReceiptPage/index';
import WarrantyTermPage from './pages/WarrantyTermPage';
import OrderPage from './pages/OrderPage/index';
import DeliverySchedule from './pages/PdvPage/DeliverySchedule/index';

function App() {
  return (
    <>
      <BrowserRouter>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          draggable
        />
        <Routes>
          <Route path="*" element={<PdvPage />} />
          <Route path='/receipt' element={<ReceiptPage />} />
          <Route path='/order' element={<OrderPage />} />
          <Route path='/warranty-term' element={<WarrantyTermPage />} />
          <Route path='/schedule' element={<DeliverySchedule />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
