import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Order from "../../types/order.type";
// ... (rest of imports keep same)
import useItems from "./hooks/useItems";
import useShipping from "./hooks/useShipping";
import usePaymentsData from "./hooks/usePayments";
import { useCustomerData } from "./hooks/useCustomerData";
import { calcItemsSummary } from "./salesOrderUtils";
import { calcPaymentsSummary } from "../../utils/calculations";
import { toast } from "react-toastify";
import { saveOrder } from "../../utils/orderHistoryService";
import { validateBase, validateOrder, ValidationErrors } from "../../utils/validations";
import { dateNow } from "../../utils/formatters";
import Shipping from "../../types/Shipping.type";
import CustomerData from "../../types/customerData.type";

export const useSalesOrderForm = () => {
    const { items, setItems } = useItems();
    const { shipping, setShipping } = useShipping();
    const { payments, setPayments } = usePaymentsData();
    const { customerData, setCustomerData } = useCustomerData();
    const [observation, setObservation] = useState("");
    const [seller, setSeller] = useState("");
    const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string>('draft');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Auto-save control
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    const itemsSummary = calcItemsSummary(items);
    const paymentsSummary = calcPaymentsSummary(payments, itemsSummary, shipping.value);

    const getOrderData = useCallback((newStatus?: 'draft' | 'scheduled' | 'fulfilled' | 'cancelled'): Order => ({
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
    }), [currentOrderId, status, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller]);

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
            const draft = getOrderData();
            try {
                await saveOrder(draft);
            } catch (error) {
                console.error("Erro no salvamento automático:", error);
            }
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [items, shipping, payments, customerData, observation, seller, getOrderData]);

    const loadOrderForEditing = useCallback((order: Order) => {
        setItems(order.items);
        setShipping(order.shipping);
        setPayments(order.payments);
        setCustomerData(order.customerData);
        setObservation(order.observation);
        setSeller(order.seller as string);
        setCurrentOrderId(order.id);
        setStatus(order.status || 'draft');
        setErrors({});
        toast.info("Pedido carregado para edição.");
    }, [setItems, setShipping, setPayments, setCustomerData, setObservation, setSeller, setCurrentOrderId, setStatus]);

    const handleCompleteOrder = useCallback(async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const orderData = getOrderData('scheduled');
        const validationErrors = validateOrder(orderData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Existem campos obrigatórios não preenchidos.");
            return;
        }

        if (isSaving) return;
        setIsSaving(true);
        setErrors({});

        try {
            await saveOrder(orderData);
            setStatus('scheduled');
            toast.success("Pedido FINALIZADO com sucesso!");
        } catch (error) {
            toast.error("Erro ao efetivar pedido.");
        } finally {
            setIsSaving(false);
        }
    }, [getOrderData, isSaving]);

    const clearForm = useCallback(() => {
        if (window.confirm("Deseja limpar o formulário para um novo pedido?")) {
            window.location.reload();
        }
    }, []);

    const currentOrder = useMemo(() => getOrderData(currentOrderId ? 'scheduled' : 'draft'), [getOrderData, currentOrderId]);

    const isValidForCompletion = useMemo(() => validateBase(getOrderData('scheduled')), [getOrderData]);

    const state = useMemo(() => ({
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
        errors,
    }), [items, shipping, payments, customerData, observation, seller, currentOrderId, status, isSaving, itemsSummary, paymentsSummary, currentOrder, isValidForCompletion, errors]);

    const actions = useMemo(() => ({
        setItems,
        setShipping: (val: React.SetStateAction<Shipping>) => {
            setShipping(val);
            setErrors(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.startsWith('shipping_')) delete next[key];
                });
                return next;
            });
        },
        setPayments,
        setCustomerData: (val: React.SetStateAction<CustomerData>) => {
            setCustomerData(val);
            setErrors(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.startsWith('customer_')) delete next[key];
                });
                return next;
            });
        },
        setObservation,
        setSeller: (val: string) => {
            setSeller(val);
            setErrors(prev => {
                const next = { ...prev };
                delete next['seller'];
                return next;
            });
        },
        loadOrderForEditing,
        handleSaveOrder: handleCompleteOrder,
        handleCompleteOrder,
        clearForm,
        setErrors,
    }), [setItems, setShipping, setPayments, setCustomerData, setObservation, setSeller, loadOrderForEditing, handleCompleteOrder, clearForm]);

    return { state, actions };
};
