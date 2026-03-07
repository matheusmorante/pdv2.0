import CustomerData from "./CustomerData";
import Header from "./Header";
import ItemsTable from "./ItemsTable";
import PaymentsTable from "./PaymentsTable";
import ShippingData from "./ShippingData";

const ReceiptPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center">
                <i className="bi bi-exclamation-triangle-fill text-5xl text-amber-500 mb-4"></i>
                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic">Nenhum pedido encontrado no armazenamento</h1>
                <p className="text-slate-500 mt-2">Por favor, acesse através da lista de pedidos.</p>
                <button
                    onClick={() => window.close()}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs"
                >
                    Fechar Janela
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 text-slate-900 dark:text-slate-100 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_td]:bg-white dark:[&_td]:bg-slate-900
         [&_input]:px-2 [&_input]:bg-white dark:[&_input]:bg-slate-900">
            <Header seller={order.seller} />
            <CustomerData customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />
            <div className="flex flex-col lg:flex-row w-full justify-between gap-6">
                {
                    order?.shipping?.scheduling?.time &&
                    <ShippingData shipping={order.shipping} />
                }
                <PaymentsTable
                    payments={order?.payments || []}
                    summary={order?.paymentsSummary}
                />
            </div>

            <div className="flex text-center gap-10 justify-center mt-10">
                <div className="assinatura">
                    <div>________________________________________________</div>
                    <div>Assinatura do Vendedor</div>
                </div>
            </div>
        </div>
    )
};

export default ReceiptPage;