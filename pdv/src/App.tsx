import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Order from './pages/Order';
import Form from './pages/form/Index';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path='/order' element={<Order />}/>
        </Routes>
      </BrowserRouter>
    </>

  );
}

export default App;
