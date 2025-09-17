
import Order from "../types/order.type";

interface Props {
    order: Order
}

type Action =
    'PRINT_RECEIPT' |
    'PRINT_SHIPPING_ORDER' |
    'PRINT_WARRANTY_TERM';

const OrderActions = ({ order }: Props) => {

    const handleAction = (e: React.MouseEvent<HTMLButtonElement>, action: Action) => {
        e.preventDefault();
        sessionStorage.setItem('order', JSON.stringify(order));
        switch (action) {
            case 'PRINT_RECEIPT':
                window.open('/receipt', '_blank');
                break;
            case 'PRINT_SHIPPING_ORDER':
                window.open('/order', '_blank')
                break;
            case 'PRINT_WARRANTY_TERM':
                window.open('/warranty-term', '_blank')

        }

    }
    return (
        <div className="flex gap-8">
            <button onClick={e => handleAction(e, 'PRINT_RECEIPT')}>
                Imprimir Recibo
            </button>
            <button onClick={e => handleAction(e, 'PRINT_SHIPPING_ORDER')}>
                Imprimir Pedido
            </button>
            <button onClick={e => handleAction(e, 'PRINT_WARRANTY_TERM')}>
                Imprimir Garantia
            </button>
            
        </div>
    )
};

export default OrderActions;