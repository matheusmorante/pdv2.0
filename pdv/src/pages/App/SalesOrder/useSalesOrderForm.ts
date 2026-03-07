import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Order from "../../types/order.type";
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
import { autoCalculateRouteDistance } from "../../utils/maps";
import { getSettings } from "../../utils/settingsService";

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
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Auto-save control
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    const itemsSummary = calcItemsSummary(items);
    const paymentsSummary = calcPaymentsSummary(payments, itemsSummary, shipping.value);

    // Stable state ref for callbacks
    const latestState = useRef({ 
        currentOrderId, status, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller, isSaving 
    });
    
    useEffect(() => {
        latestState.current = { 
            currentOrderId, status, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller, isSaving 
        };
    }, [currentOrderId, status, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller, isSaving]);

    const getOrderData = useCallback((newStatus?: 'draft' | 'scheduled' | 'fulfilled' | 'cancelled'): Order => {
        const s = latestState.current;
        return {
            id: s.currentOrderId,
            status: newStatus || s.status,
            items: s.items,
            itemsSummary: s.itemsSummary,
            shipping: s.shipping,
            payments: s.payments,
            paymentsSummary: s.paymentsSummary,
            customerData: s.customerData,
            observation: s.observation,
            seller: s.seller,
            date: dateNow(),
        };
    }, []);

    // AUTO-SAVE LOGIC
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        // Check if there's any meaningful changes from the default state
        const isDefaultState = (() => {
            // Check Customer
            if (customerData.fullName || customerData.phone || customerData.fullAddress.street || customerData.fullAddress.cep) return false;
            // Check Items
            if (items.length > 1) return false;
            if (items.length === 1 && (items[0].description !== '' || items[0].unitPrice !== 0)) return false;
            // Check Shipping
            if (shipping.value !== 0 || shipping.distance !== undefined || shipping.scheduling.date !== '') return false;
            // Check Payments
            if (payments.length > 1) return false;
            if (payments.length === 1 && payments[0].amount !== 0) return false;
            // Check Observation and Seller
            if (observation !== '' || seller !== '') return false;
            
            return true;
        })();

        if (isDefaultState) return;

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
    }, [setItems, setShipping, setPayments, setCustomerData, setObservation, setSeller]);

    const handleAutoCalculateDistance = useCallback(async (address: CustomerData['fullAddress']) => {
        if (!address.street || !address.city) return;

        setIsCalculatingDistance(true);
        try {
            const settings = getSettings();
            const routeResult = await autoCalculateRouteDistance(address);
            if (routeResult !== null) {
                const { distanceKm, destinationCoords, routeGeoJSON } = routeResult;
                
                setShipping(prev => {
                    let value = prev.value;
                    // Auto-calculate freight if rate is configured
                    if (settings.freightPerKm > 0) {
                        value = distanceKm * settings.freightPerKm;
                    }
                    return { 
                        ...prev, 
                        distance: distanceKm,
                        value,
                        destinationCoords,
                        routeGeoJSON
                    };
                });
            }
        } catch (e) {
            console.error("Erro ao calcular rota automática:", e);
        } finally {
            setIsCalculatingDistance(false);
        }
    }, [setShipping]);

    // Automatic calculation when address changes
    useEffect(() => {
        const addr = customerData.fullAddress;
        if (shipping.autoCalculateValue && addr.street && addr.city && (addr.number || addr.cep)) {
            const timer = setTimeout(() => {
                handleAutoCalculateDistance(addr);
            }, 1000); // Debounce to avoid excessive API calls
            return () => clearTimeout(timer);
        }
    }, [customerData.fullAddress, shipping.autoCalculateValue, handleAutoCalculateDistance]);

    const handleCompleteOrder = useCallback(async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const orderData = getOrderData('scheduled');
        const validationErrors = validateOrder(orderData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Existem campos obrigatórios não preenchidos.");
            return;
        }

        if (latestState.current.isSaving) return; // Note: isSaving is not in latestState in the current code structure, but we can fix it
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
    }, [getOrderData]);

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
        isCalculatingDistance,
        itemsSummary,
        paymentsSummary,
        currentOrder,
        isValidForCompletion,
        errors,
    }), [items, shipping, payments, customerData, observation, seller, currentOrderId, status, isSaving, isCalculatingDistance, itemsSummary, paymentsSummary, currentOrder, isValidForCompletion, errors]);

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
        handleAutoCalculateDistance,
        handleSaveOrder: handleCompleteOrder,
        handleCompleteOrder,
        clearForm,
        setErrors,
    }), [setItems, setShipping, setPayments, setCustomerData, setObservation, setSeller, loadOrderForEditing, handleAutoCalculateDistance, handleCompleteOrder, clearForm]);

    return { state, actions };
};
