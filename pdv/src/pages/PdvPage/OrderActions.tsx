
import Order from "../types/order.type";
import { dateNow } from "../utils/fomatters";
import { validateItems, validateOrder } from "../utils/validations";
import { customerOrderWhatsappUrl, shippingOrderWhatsappUrl, customerReviewsWhatsappUrl } from "../utils/whatsapp";

interface Props {
    order: Order
}

type Action =
    'PRINT_RECEIPT' |
    'PRINT_SHIPPING_ORDER' |
    'PRINT_WARRANTY_TERM' |
    'SEND_SHIPPING_ORDER' |
    'SEND_CUSTOMER_ORDER' |
    'SEND_CUSTOMER_REVIEWS'

const OrderActions = ({ order }: Props) => {

    const handleAction = (e: React.MouseEvent<HTMLButtonElement>, action: Action) => {
        e.preventDefault();

        if (!validateOrder(order)) {
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
            case 'SEND_CUSTOMER_REVIEWS':
                window.open(customerReviewsWhatsappUrl(order), '_blank')
        }

    }
    return (
        <div className="block [&>button]:p-2 [&>button]:font-bold">
            <button
                onClick={e => handleAction(e, 'PRINT_RECEIPT')}
                className="bg-gray-400"
            >
                <i className="bi bi-printer mr-1"/>Imprimir Recibo
            </button>
            <button
                onClick={e => handleAction(e, 'PRINT_SHIPPING_ORDER')}
                className="bg-blue-500"
            >
                <i className="bi bi-printer mr-1"/> Imprimir Pedido
            </button>
            <button
                onClick={e => handleAction(e, 'PRINT_WARRANTY_TERM')}
                className="bg-yellow-500"
            >
                <i className="bi bi-shield-check mr-1"/> Imprimir Garantia
            </button>
            <button
                onClick={e => handleAction(e, 'SEND_SHIPPING_ORDER')}
                className="bg-green-500"
            >
                <i className="bi bi-whatsapp mr-1"/> Enviar Pedido de Entrega
            </button>
            <button
                onClick={e => handleAction(e, 'SEND_CUSTOMER_ORDER')}
                className="bg-red-500"
            >
                <i className="bi bi-whatsapp mr-1"/> Enviar Pedido do Cliente
            </button>
            <button
                onClick={e => handleAction(e, 'SEND_CUSTOMER_REVIEWS')}
                className="bg-orange-500"
            >
                <i className="bi bi-whatsapp mr-1"/> 
                Enviar Pedido de Avaliação ao Cliente
            </button>

        </div>
    )
};

export default OrderActions;