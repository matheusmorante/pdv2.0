
import Order from "../types/order.type";

interface Props {
    order: Order
}

type Action =
    'PRINT_RECEIPT' |
    'PRINT_ORDER_VIA_SHIPPING' |
    'PRINT_ORDER_VIA_CUSTOMER' |
    'PRINT_WARRANTY_TERM';

const OrderActions = ({ order }: Props) => {

    const handleAction = (e: React.MouseEvent<HTMLButtonElement>, action: Action) => {
        e.preventDefault();                                                                                                                                                                                                                                                                                                               
        sessionStorage.setItem('order', JSON.stringify(order));
        window.open('/printable-receipt', '_blank')
    }
    return (
        <div>
            <button onClick={e => handleAction(e, 'PRINT_RECEIPT')}>
                Imprimir Recibo
            </button>
            <button></button>
            <button></button>


        </div>
    )
};

export default OrderActions;