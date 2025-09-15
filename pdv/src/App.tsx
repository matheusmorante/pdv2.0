import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Form from './pages/form/Index';
import PrintableReceipt from './pages/PrintableReceipt/Index';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path='/printable-receipt' element={<PrintableReceipt />}/>
        </Routes>
      </BrowserRouter>
    </>

  );
}

export default App;
