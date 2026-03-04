import ItemsTable from "./ItemsTable/Index";
import { useState } from "react";
import PaymentsTable from "./PaymentsTable/Index";
import PersonalInfos from "./CustomerData";
import useShipping from "./hooks/useShipping";
import PdvActions from "./PdvActions/Index";
import useItems from "./hooks/useItems";
import usePaymentsData from "./hooks/usePayments";
import { useCustomerData } from "./hooks/useCustomerData";
import { calcItemsSummary } from "./pdvUtils";
import { calcPaymentsSummary } from "../utils/calculations";
import ShippingInputs from "./ShippingData";
import Seller from "./Seller";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DeliverySchedule from "./DeliverySchedule/Index";
import OrderHistoryList from "./OrderHistoryList/Index";
import Order from "../types/pdvAction.type";
import { saveOrder } from "../utils/orderHistoryService";
import { validateBase } from "../utils/validations";
import { dateNow } from "../utils/fomatters";

const PdvPage = () => {
    const { items, setItems } = useItems();
    const { shipping, setShipping } = useShipping();
    const itemsSummary = calcItemsSummary(items);
    const { payments, setPayments } = usePaymentsData();
    const paymentsSummary = calcPaymentsSummary(
        payments, itemsSummary, shipping.value
    );
    const { customerData, setCustomerData } = useCustomerData();
    const [observation, setObservation] = useState('');
    const [seller, setSeller] = useState('');

    const [activeTab, setActiveTab] = useState<'pdv' | 'history' | 'schedule'>('pdv');
    const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(undefined);

    const loadOrderForEditing = (order: Order) => {
        setItems(order.items);
        setShipping(order.shipping);
        setPayments(order.payments);
        setCustomerData(order.customerData);
        setObservation(order.observation);
        setSeller(order.seller as string);
        setCurrentOrderId(order.id);
        setActiveTab('pdv');
        toast.info("Pedido carregado para edição.");
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveOrder = async (e: React.MouseEvent) => {
        e.preventDefault();

        const orderData: Order = {
            id: currentOrderId,
            items,
            itemsSummary,
            shipping,
            payments,
            paymentsSummary,
            customerData,
            observation,
            seller,
            date: dateNow()
        };

        if (!validateBase(orderData)) return;

        if (isSaving) return;
        setIsSaving(true);

        try {
            sessionStorage.setItem("order", JSON.stringify(orderData));
            await saveOrder(orderData);
            toast.success("Pedido salvo no histórico da nuvem!");
        } catch (error) {
            toast.error("Erro ao salvar pedido na nuvem.");
        } finally {
            setIsSaving(false);
        }
    };

    const clearForm = () => {
        if (window.confirm("Deseja limpar o formulário para um novo pedido?")) {
            window.location.reload();
        }
    }

    return (
        <div className="flex flex-col mx-auto w-full items-center mb-10">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                draggable
            />

            {/* TABS */}
            <div className="flex gap-4 mt-4 w-[900px]">
                <button
                    onClick={() => setActiveTab('pdv')}
                    className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeTab === 'pdv' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    PDV / Edição
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Histórico de Pedidos
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Cronograma de Entregas
                </button>
            </div>

            {activeTab === 'pdv' && (
                <form
                    className="
                        flex flex-col w-[900px] mx-auto p-4 shadow-lg shadow-slate-400
                        gap-6 [&_th]:border-2 [&_td]:border-2 [&_input]:bg-white [&_td]:px-1
                        [&_td]:border-gray-200 [&_th]:bg-gray-300 [&_th]:py-1
                        [&_td]:py-1 [&_input]:px-2 focus:[&_input]:outline-none
                        bg-white
                    "
                >
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-700">
                            {currentOrderId ? "Editando Pedido" : "Novo Pedido"}
                        </h2>
                        {currentOrderId && (
                            <button
                                onClick={(e) => { e.preventDefault(); clearForm(); }}
                                className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                            >
                                <i className="bi bi-plus-circle mr-1" /> Criar Novo (Limpar)
                            </button>
                        )}
                    </div>

                    <ItemsTable
                        items={items}
                        setItems={setItems}
                        summary={itemsSummary}
                    />

                    <div className="flex">
                        <Seller seller={seller} setSeller={setSeller} />

                        <ShippingInputs
                            shipping={shipping}
                            setShipping={setShipping}
                        />
                    </div>

                    <PaymentsTable
                        payments={payments}
                        setPayments={setPayments}
                        summary={paymentsSummary}
                    />

                    <PersonalInfos
                        customerData={customerData}
                        setCustomerData={setCustomerData}
                    />

                    <div>
                        <label>Observações</label>
                        <input
                            value={observation}
                            onChange={e => setObservation(e.target.value)}
                            className="w-full min-h-[100px] border border-red-700
                            p-0 text-start"
                        />
                    </div>

                    <div className="flex justify-between items-center border-t-2 pt-4 mt-2">
                        <button
                            onClick={handleSaveOrder}
                            disabled={isSaving}
                            className={`font-bold py-2 px-4 rounded shadow flex items-center ${isSaving
                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {isSaving ? (
                                <><i className="bi bi-arrow-repeat animate-spin mr-2" /> Salvando...</>
                            ) : (
                                <><i className="bi bi-save mr-2" /> Salvar Pedido</>
                            )}
                        </button>
                    </div>

                    <PdvActions order={{
                        id: currentOrderId,
                        items,
                        itemsSummary,
                        payments,
                        paymentsSummary,
                        shipping,
                        seller,
                        customerData,
                        observation,
                        date: ''
                    }} />

                </form>
            )}

            {activeTab === 'history' && (
                <OrderHistoryList onEdit={loadOrderForEditing} />
            )}

            {activeTab === 'schedule' && (
                <DeliverySchedule />
            )}
        </div>
    )
}
export default PdvPage;