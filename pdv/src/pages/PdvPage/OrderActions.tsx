
import Order from "../types/order.type";
import { dateNow } from "../utils/fomatters";
import { validateItems, validateOrder } from "../utils/validations";
import { customerOrderWhatsappUrl, shippingOrderWhatsappUrl } from "../utils/whatsapp";

interface Props {
    order: Order
}

type Action =
    'PRINT_RECEIPT' |
    'PRINT_SHIPPING_ORDER' |
    'PRINT_WARRANTY_TERM' |
    'SEND_SHIPPING_ORDER' |
    'SEND_CUSTOMER_ORDER'

const OrderActions = ({ order }: Props) => {

    const handleAction = (e: React.MouseEvent<HTMLButtonElement>, action: Action) => {
        e.preventDefault();
        
        if(!validateOrder(order)) {
            return
        }

        order.date = dateNow();

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
                break;
            case 'SEND_SHIPPING_ORDER':
                window.open(shippingOrderWhatsappUrl(order), '_blank')
                break;
            case 'SEND_CUSTOMER_ORDER':
                window.open(customerOrderWhatsappUrl(order), '_blank')
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
            <button onClick={e => handleAction(e, 'SEND_SHIPPING_ORDER')}>
                Enviar Pedido de Entrega
            </button>
            <button onClick={e => handleAction(e, 'SEND_CUSTOMER_ORDER')}>
                Enviar Pedido do Cliente
            </button>

        </div>
    )
};

export default OrderActions;