import React from "react";
import ItemsTable from "./ItemsTable";
import Seller from "./Seller";
import ShippingInputs from "./ShippingData";
import PaymentsTable from "./PaymentsTable/Index";
import PersonalInfos from "./CustomerData";
import PdvActions from "./PdvActions/Index";
import { usePdvForm } from "./usePdvForm";

type PdvFormSectionProps = {
    form: ReturnType<typeof usePdvForm>;
};

const PdvFormSection = ({ form }: PdvFormSectionProps) => {
    const { state, actions } = form;

    return (
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
                    {state.currentOrderId ? "Editando Pedido" : "Novo Pedido"}
                </h2>
                {state.currentOrderId && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            actions.clearForm();
                        }}
                        className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                    >
                        <i className="bi bi-plus-circle mr-1" /> Criar Novo (Limpar)
                    </button>
                )}
            </div>

            <ItemsTable
                items={state.items}
                setItems={actions.setItems}
                summary={state.itemsSummary}
            />

            <div className="flex">
                <Seller seller={state.seller} setSeller={actions.setSeller} />
                <ShippingInputs
                    shipping={state.shipping}
                    setShipping={actions.setShipping}
                />
            </div>

            <PaymentsTable
                payments={state.payments}
                setPayments={actions.setPayments}
                summary={state.paymentsSummary}
            />

            <PersonalInfos
                customerData={state.customerData}
                setCustomerData={actions.setCustomerData}
            />

            <div>
                <label>Observações</label>
                <input
                    value={state.observation}
                    onChange={(e) => actions.setObservation(e.target.value)}
                    className="w-full min-h-[100px] border border-red-700 p-0 text-start"
                />
            </div>

            <div className="flex justify-between items-center border-t-2 pt-4 mt-2">
                <button
                    onClick={actions.handleSaveOrder}
                    disabled={state.isSaving}
                    className={`font-bold py-2 px-4 rounded shadow flex items-center ${state.isSaving
                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                        : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                >
                    {state.isSaving ? (
                        <>
                            <i className="bi bi-arrow-repeat animate-spin mr-2" /> Salvando...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-save mr-2" /> Salvar Pedido
                        </>
                    )}
                </button>
            </div>

            <PdvActions order={state.currentOrder} />
        </form>
    );
};

export default PdvFormSection;
