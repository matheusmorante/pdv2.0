import { Link } from 'react-router-dom';

const ActionButtons = () => {
  
    return (
        <div>
            <button>Enviar pedido por Whatsapp</button>
            <Link to='order' target='_blank' rel='noopener noreferrer'>Imprimir pedido</Link>
            <button>Imprimir recibo</button>
        </div>
    )
}