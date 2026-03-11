import Order, { OrderAction, IsButtonsClicked } from "../../../types/order.type";

export const actionsMap: Record<OrderAction, (order: Order) => void> = {
    'PRINT_RECEIPT': (order) => {
        console.log("Gerando Recibo para o pedido:", order.id);
    },
    'PRINT_SHIPPING_ORDER': (order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const itemsHtml = order.items.map(item => {
            const unitPrice = item.unitPrice || 0;
            const quantity = item.quantity || 0;
            const discount = item.unitDiscount || 0;
            const total = (unitPrice - discount) * quantity;
            
            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        }).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Pedido de Venda - ${order.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #333; }
                        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th { background: #f4f4f4; text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
                        .footer { margin-top: 30px; text-align: right; font-weight: bold; font-size: 1.2em; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Pedido de Venda</h1>
                        <p>ID: ${order.id}</p>
                        <p>Data: ${order.date}</p>
                        <p>Cliente: ${order.customerData?.fullName || 'Não informado'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th style="text-align: center;">Qtd</th>
                                <th style="text-align: right;">V. Unit</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="footer">
                        Total do Pedido: R$ ${(order.paymentsSummary.totalOrderValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    },
    'PRINT_WARRANTY_TERM': (order) => {
        console.log("Gerando Termo de Garantia para o pedido:", order.id);
    },
    'SEND_SHIPPING_ORDER': (order) => {
        const message = `*Confirmação de Entrega*%0A%0AOlá! Seu pedido de entrega foi registrado.%0A%0A*Itens:*%0A${order.items
            .map((item) => `- ${item.description} (Qtd: ${item.quantity})`)
            .join("%0A")}%0A%0A*Total:* ${order.paymentsSummary.totalOrderValue || 0
            }%0A%0AObrigado!`;
        window.open(`https://wa.me/?text=${message}`, "_blank");
    },
    'SEND_CUSTOMER_ORDER': (order) => {
        const message = `*Detalhes do Pedido*%0A%0AOlá! Aqui estão os detalhes do seu pedido.%0A%0A*Total:* ${order.paymentsSummary.totalOrderValue || 0
            }%0A%0AStatus: Em Preparação.`;
        window.open(`https://wa.me/?text=${message}`, "_blank");
    },
    'SEND_CUSTOMER_REVIEWS': (order) => {
        const message = `*Avaliação do Pedido*%0A%0AOlá! Poderia nos avaliar?`;
        window.open(`https://wa.me/?text=${message}`, "_blank");
    },
    'STOCK_WITHDRAWAL': () => {
        // Handled in UI
    },
    'STOCK_REVERSAL': () => {
        // Handled in UI
    }
};

export interface OrderButton {
    key: keyof IsButtonsClicked;
    icon: string;
    action: OrderAction;
    label: string;
    color: string;
}

export const buttons: OrderButton[] = [
    {
        key: "printShippingOrder",
        icon: "bi-printer-fill",
        action: "PRINT_SHIPPING_ORDER",
        label: "Imprimir Pedido",
        color: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all font-bold text-xs uppercase tracking-widest px-6 py-3"
    },
    {
        key: "sendShippingOrder",
        icon: "bi-truck",
        action: "SEND_SHIPPING_ORDER",
        label: "Enviar Entrega",
        color: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all font-bold text-xs uppercase tracking-widest px-6 py-3"
    },
    {
        key: "sendCustomerOrder",
        icon: "bi-whatsapp",
        action: "SEND_CUSTOMER_ORDER",
        label: "WhatsApp Cliente",
        color: "bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-200 transition-all font-bold text-xs uppercase tracking-widest px-6 py-3"
    },
];
