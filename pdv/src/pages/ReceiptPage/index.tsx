import React, { useEffect } from "react";
import CustomerData from "./CustomerData";
import Header from "./Header";
import ItemsTable from "./ItemsTable";
import PaymentsTable from "./PaymentsTable";
import ShippingData from "./ShippingData";
import MapRoute from "../App/SalesOrder/ShippingComponents/MapRoute";

const ReceiptPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;

    useEffect(() => {
        if (order) {
            // Give extra time for MapLibre to render before showing print dialog
            const timer = setTimeout(() => {
                window.print();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-white text-slate-800">
                <i className="bi bi-exclamation-triangle-fill text-5xl text-amber-500 mb-4"></i>
                <h1 className="text-2xl font-black italic">Nenhum pedido encontrado no armazenamento</h1>
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
        <div className="flex flex-col gap-5 text-slate-900 bg-white p-4 min-h-screen
         [&_th]:bg-slate-100 [&_td]:bg-white
         [&_input]:px-2 [&_input]:bg-white">
            <Header seller={order.seller} />
            <CustomerData customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />

            <div className="flex flex-col lg:flex-row w-full justify-between gap-6">
                <div className="flex flex-col gap-4 w-[40%]">
                    {order?.shipping?.scheduling?.time && <ShippingData shipping={order.shipping} />}
                    {order?.shipping?.destinationCoords && (
                        <div className="w-full">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Rota de Entrega</p>
                            <MapRoute
                                destinationCoords={order.shipping.destinationCoords}
                                routeGeoJSON={order.shipping.routeGeoJSON}
                                className="h-48 w-full border-2 border-slate-200"
                            />
                        </div>
                    )}
                </div>
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