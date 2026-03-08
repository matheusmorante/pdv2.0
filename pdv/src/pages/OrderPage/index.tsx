import CustomerData from "./CustomerData";
import ItemsTable from "./ItemsTable";
import PaymentsTable from "./PaymentsTable";
import ShippingData from "./ShippingData";
import { useEffect } from "react";

const OrderPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;

    useEffect(() => {
        window.print();
    }, []);


    return (
        <div className="flex flex-col gap-4 text-slate-900 dark:text-slate-100 [&_tr_th]:bg-slate-200 dark:[&_tr_th]:bg-slate-800 
            [&_input]:px-2 [&_input]:bg-white dark:[&_input]:bg-slate-900 transition-colors duration-300">
            <div className="flex justify-between font-black uppercase tracking-widest text-[10px] text-slate-500">
                <div>Vendedor: <span className="text-slate-900 dark:text-slate-100">{order.seller}</span></div>
                <div>Data de emissão: <span className="text-slate-900 dark:text-slate-100">{order.date}</span></div>
            </div>
            <div>
                <h1 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">OBSERVAÇÕES SOBRE A ENTREGA</h1>
                <div className="min-h-[50px] border-2 border-red-500/50 dark:border-red-900/50 p-4 rounded-2xl bg-red-50/30 dark:bg-red-900/10 text-sm flex flex-wrap gap-2 items-start">
                    {order.observation ? order.observation.split(';').filter((t: string) => t.trim() !== "").map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-[12px] font-bold rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 capitalize">
                            {tag}
                        </span>
                    )) : ""}
                </div>
            </div>
            <CustomerData customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />

            <div className="flex flex-row justify-around gap-6">
                <ShippingData shipping={order.shipping} />

                <PaymentsTable
                    payments={order.payments}
                    summary={order.paymentsSummary}
                />

            </div>
        </div>
    )
};

export default OrderPage;