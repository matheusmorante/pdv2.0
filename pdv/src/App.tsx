import { Routes, Route, BrowserRouter } from 'react-router-dom'
import PdvPage from './pages/PdvPage/Index';
import ReceiptPage from './pages/ReceiptPage/Index';
import WarrantyTermPage from './pages/WarrantyTermPage';
import OrderPage from './pages/OrderPage/Index';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<PdvPage />} />
          <Route path='/receipt' element={<ReceiptPage />}/>
          <Route path='/order' element={<OrderPage/>}/>
          <Route path='/warranty-term' element={<WarrantyTermPage/>}/>
        </Routes>
      </BrowserRouter>
    </>

  );
}

export default App;
