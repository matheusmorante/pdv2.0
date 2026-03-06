import { useState, useEffect, useRef } from "react";
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
    const [status, setStatus] = useState<'draft' | 'scheduled' | 'fulfilled' | 'cancelled'>('draft');
    const [isSaving, setIsSaving] = useState(false);
    const [activeModal, setActiveModal] = useState<boolean>(false);

    // Auto-save control
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    const itemsSummary = calcItemsSummary(items);
    const paymentsSummary = calcPaymentsSummary(payments, itemsSummary, shipping.value);

    const getOrderData = (newStatus?: 'draft' | 'scheduled' | 'fulfilled' | 'cancelled'): Order => ({
        id: currentOrderId,
        status: newStatus || status,
        items,
        itemsSummary,
        shipping,
        payments,
        paymentsSummary,
        customerData,
        observation,
        seller,
        date: dateNow(),
    });

    // AUTO-SAVE LOGIC
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        // Only auto-save if there's at least some data
        if (items.length === 0 && !customerData.fullName && !seller) return;

        autoSaveTimerRef.current = setTimeout(async () => {
            const draft = getOrderData(); // Uses current status
            try {
                await saveOrder(draft);
                // If it was a new order, we might get an ID back if we updated saveOrder
                // For now, assume it works and doesn't notify to avoid spamming
            } catch (error) {
                console.error("Erro no salvamento automático:", error);
            }
        }, 2000); // 2 second debounce

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [items, shipping, payments, customerData, observation, seller]);

    const loadOrderForEditing = (order: Order) => {
        setItems(order.items);
        setShipping(order.shipping);
        setPayments(order.payments);
        setCustomerData(order.customerData);
        setObservation(order.observation);
        setSeller(order.seller as string);
        setCurrentOrderId(order.id);
        setStatus(order.status || 'draft');
        setActiveModal(true);
        toast.info("Pedido carregado para edição.");
    };

    const handleCompleteOrder = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const orderData = getOrderData('scheduled');

        if (!validateBase(orderData)) {
            toast.error("Preencha todos os campos obrigatórios para efetivar o pedido.");
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        try {
            await saveOrder(orderData);
            setStatus('scheduled');
            toast.success("Pedido FINALIZADO com sucesso!");
        } catch (error) {
            toast.error("Erro ao efetivar pedido.");
        } finally {
            setIsSaving(false);
        }
    };

    const clearForm = () => {
        if (window.confirm("Deseja limpar o formulário para um novo pedido?")) {
            window.location.reload();
        }
    };

    const currentOrder = getOrderData(currentOrderId ? 'scheduled' : 'draft');

    const isValidForCompletion = validateBase(getOrderData('scheduled'));

    return {
        state: {
            items,
            shipping,
            payments,
            customerData,
            observation,
            seller,
            currentOrderId,
            status,
            isSaving,
            itemsSummary,
            paymentsSummary,
            currentOrder,
            isValidForCompletion,
        },
        actions: {
            setItems,
            setShipping,
            setPayments,
            setCustomerData,
            setObservation,
            setSeller,
            loadOrderForEditing,
            handleSaveOrder: handleCompleteOrder,
            handleCompleteOrder,
            clearForm,
        },
    };
};
