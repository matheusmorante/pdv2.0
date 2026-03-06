import { useState } from "react";
import Order from "../../types/pdvAction.type";
import useItems from "./hooks/useItems";
import useShipping from "./hooks/useShipping";
import usePaymentsData from "./hooks/usePayments";
import { useCustomerData } from "./hooks/useCustomerData";
import { calcItemsSummary } from "./pdvUtils";
import { calcPaymentsSummary } from "../../utils/calculations";
import { toast } from "react-toastify";
import { saveOrder } from "../../utils/orderHistoryService";
import { validateBase } from "../../utils/validations";
import { dateNow } from "../../utils/formatters";

export const usePdvForm = () => {
    const { items, setItems } = useItems();
    const { shipping, setShipping } = useShipping();
    const { payments, setPayments } = usePaymentsData();
    const { customerData, setCustomerData } = useCustomerData();
    const [observation, setObservation] = useState("");
    const [seller, setSeller] = useState("");
    const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    const itemsSummary = calcItemsSummary(items);
    const paymentsSummary = calcPaymentsSummary(payments, itemsSummary, shipping.value);

    const loadOrderForEditing = (order: Order) => {
        setItems(order.items);
        setShipping(order.shipping);
        setPayments(order.payments);
        setCustomerData(order.customerData);
        setObservation(order.observation);
        setSeller(order.seller as string);
        setCurrentOrderId(order.id);
        toast.info("Pedido carregado para edição.");
    };

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
            date: dateNow(),
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
    };

    const currentOrder: Order = {
        id: currentOrderId,
        items,
        itemsSummary,
        payments,
        paymentsSummary,
        shipping,
        seller,
        customerData,
        observation,
        date: "",
    };

    return {
        state: {
            items,
            shipping,
            payments,
            customerData,
            observation,
            seller,
            currentOrderId,
            isSaving,
            itemsSummary,
            paymentsSummary,
            currentOrder,
        },
        actions: {
            setItems,
            setShipping,
            setPayments,
            setCustomerData,
            setObservation,
            setSeller,
            loadOrderForEditing,
            handleSaveOrder,
            clearForm,
        },
    };
};
