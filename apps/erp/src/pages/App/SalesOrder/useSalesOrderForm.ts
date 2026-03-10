import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Order from "../../types/order.type";
import useItems from "./hooks/useItems";
import useShipping from "./hooks/useShipping";
import usePaymentsData from "./hooks/usePayments";
import { useCustomerData } from "./hooks/useCustomerData";
import { calcPaymentsSummary, calcItemsSummary } from "../../utils/calculations";
import { toast } from "react-toastify";
import { saveOrder } from "../../utils/orderHistoryService";
import { validateBase, validateOrder, ValidationErrors } from "../../utils/validations";
import { dateNow } from "../../utils/formatters";
import Shipping from "../../types/Shipping.type";
import CustomerData from "../../types/customerData.type";
import { autoCalculateRouteDistance } from "../../utils/maps";
import { getSettings } from "../../utils/settingsService";

const getCurrentDatetimeLocal = () => {
    const now = new Date();
    // Ajuste simples para o fuso horário local
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const formatToBRDateTime = (datetimeLocalStr: string) => {
    if (!datetimeLocalStr) return dateNow();
    try {
        const [date, time] = datetimeLocalStr.split('T');
        if (!date || !time) return dateNow();

        const [y, m, d] = date.split('-');
        return `${d}/${m}/${y}, ${time}:00`;
    } catch {
        return dateNow();
    }
};

const parseBRDateTimeToLocal = (brDateTimeStr: string) => {
    if (!brDateTimeStr) return getCurrentDatetimeLocal();
    try {
        const [datePart, timePart] = brDateTimeStr.split(', ');
        if (!datePart) return getCurrentDatetimeLocal();

        const [d, m, y] = datePart.split('/');
        if (!d || !m || !y) return getCurrentDatetimeLocal();

        let time = (timePart || '00:00:00').split(':').slice(0, 2).join(':'); // HH:mm
        if (time.length < 5) time = '00:00';

        // Retorna YYYY-MM-DDTHH:mm
        return `${y.padStart(4, '2020')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${time}`;
    } catch {
        return getCurrentDatetimeLocal();
    }
};

export const useSalesOrderForm = (initialDeliveryMethod: 'delivery' | 'pickup' = 'delivery') => {
    const { items, setItems } = useItems();
    const { shipping, setShipping } = useShipping(initialDeliveryMethod);
    const { payments, setPayments } = usePaymentsData();
    const { customerData, setCustomerData } = useCustomerData();
    const [observation, setObservation] = useState("");
    const [seller, setSeller] = useState("");
    const [marketingOrigin, setMarketingOrigin] = useState("Direto na Loja");
    const [orderDate, setOrderDate] = useState(() => getCurrentDatetimeLocal());
    const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string>('draft');
    const [isSaving, setIsSaving] = useState(false);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const lastCalculatedAddressRef = useRef<string>("");

    // Auto-save control
    const autoSaveTimerRef = useRef<any>(null);
    const isInitialMount = useRef(true);

    const itemsSummary = calcItemsSummary(items);
    const paymentsSummary = calcPaymentsSummary(payments, itemsSummary, shipping.value);

    // Stable state ref for callbacks
    const latestState = useRef({
        currentOrderId, status, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller, marketingOrigin, orderDate, isSaving
    });

    useEffect(() => {
        latestState.current = {
            currentOrderId, status, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller, marketingOrigin, orderDate, isSaving
        };
    }, [currentOrderId, status, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller, marketingOrigin, orderDate, isSaving]);

    const getOrderData = useCallback((newStatus?: 'draft' | 'scheduled' | 'fulfilled' | 'cancelled'): Order => {
        const s = latestState.current;
        return {
            id: s.currentOrderId,
            orderType: 'sale',
            status: newStatus || s.status,
            items: s.items,
            itemsSummary: s.itemsSummary,
            shipping: s.shipping,
            payments: s.payments,
            paymentsSummary: s.paymentsSummary,
            customerData: s.customerData,
            observation: s.observation,
            seller: s.seller,
            marketingOrigin: s.marketingOrigin,
            date: formatToBRDateTime(s.orderDate),
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
            if (observation !== '' || seller !== '' || marketingOrigin !== 'Direto na Loja') return false;

            return true;
        })();

        if (isDefaultState) return;

        autoSaveTimerRef.current = setTimeout(async () => {
            const draft = getOrderData();
            try {
                const savedId = await saveOrder(draft);
                // After first auto-save, update currentOrderId so all subsequent
                // saves update the same doc instead of creating new ones.
                if (!latestState.current.currentOrderId && savedId) {
                    setCurrentOrderId(savedId);
                }
            } catch (error) {
                console.error("Erro no salvamento automático:", error);
            }
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [items, shipping, payments, customerData, observation, seller, marketingOrigin, orderDate, getOrderData]);

    const loadOrderForEditing = useCallback((order: Order) => {
        setItems(order.items);
        setShipping(order.shipping);
        setPayments(order.payments);
        setCustomerData(order.customerData);
        setObservation(order.observation);
        setSeller(order.seller as string);
        setMarketingOrigin(order.marketingOrigin || 'Direto na Loja');
        setOrderDate(parseBRDateTimeToLocal(order.date));
        setCurrentOrderId(order.id);
        setStatus(order.status || 'draft');
        setErrors({});
        // Initialize calculation ref to prevent instant recalculation if address exists
        if (order.customerData?.fullAddress) {
            lastCalculatedAddressRef.current = JSON.stringify(order.customerData.fullAddress);
        }
    }, [setItems, setShipping, setPayments, setCustomerData, setObservation, setSeller, setMarketingOrigin]);

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
                    // Auto-calculate freight if rate is configured AND auto-calculate is enabled
                    if (prev.autoCalculateValue && settings.freightPerKm > 0) {
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
        if (addr.street && addr.city && (addr.number || addr.cep)) {
            const addrStr = JSON.stringify(addr);
            if (addrStr === lastCalculatedAddressRef.current) return;

            const timer = setTimeout(() => {
                handleAutoCalculateDistance(addr);
                lastCalculatedAddressRef.current = addrStr;
            }, 1000); // Debounce to avoid excessive API calls
            return () => clearTimeout(timer);
        }
    }, [customerData.fullAddress, handleAutoCalculateDistance]);

    const handleSaveOrder = useCallback(async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const orderData = getOrderData('draft'); // Save as draft
        const validationErrors = validateOrder(orderData); // Get actual error object

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Existem campos obrigatórios não preenchidos para salvar como rascunho.");
            return false;
        }

        if (latestState.current.isSaving) return;
        setIsSaving(true);
        setErrors({});

        try {
            const savedId = await saveOrder(orderData);
            if (!latestState.current.currentOrderId && savedId) {
                setCurrentOrderId(savedId);
            }
            setStatus('draft');
            toast.success("Pedido salvo como rascunho!");
            return true;
        } catch (error) {
            toast.error("Erro ao salvar pedido como rascunho.");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [getOrderData]);

    const handleCompleteOrder = useCallback(async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const orderData = getOrderData('scheduled');
        const validationErrors = validateOrder(orderData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Existem campos obrigatórios não preenchidos.");
            return false;
        }

        if (latestState.current.isSaving) return; // Note: isSaving is not in latestState in the current code structure, but we can fix it
        setIsSaving(true);
        setErrors({});

        try {
            await saveOrder(orderData);
            setStatus('scheduled');
            toast.success("Pedido FINALIZADO com sucesso!");
            return true;
        } catch (error) {
            toast.error("Erro ao efetivar pedido.");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [getOrderData]);

    const clearForm = useCallback(() => {
        if (window.confirm("Deseja limpar o formulário para um novo pedido?")) {
            window.location.reload();
        }
    }, []);

    const currentOrder = useMemo((): Order => ({
        id: currentOrderId,
        orderType: 'sale',
        status: status as any,
        items,
        itemsSummary,
        shipping,
        payments,
        paymentsSummary,
        customerData,
        observation,
        seller,
        marketingOrigin,
        date: formatToBRDateTime(orderDate),
    }), [currentOrderId, items, itemsSummary, shipping, payments, paymentsSummary, customerData, observation, seller, marketingOrigin, status, orderDate]);

    const isValidForCompletion = useMemo(() => validateBase(getOrderData('scheduled')), [getOrderData]);

    const state = useMemo(() => ({
        items,
        shipping,
        payments,
        customerData,
        observation,
        seller,
        marketingOrigin,
        currentOrderId,
        status,
        isSaving,
        isCalculatingDistance,
        itemsSummary,
        paymentsSummary,
        currentOrder,
        isValidForCompletion,
        errors,
        orderDate,
    }), [items, shipping, payments, customerData, observation, seller, marketingOrigin, currentOrderId, status, isSaving, isCalculatingDistance, itemsSummary, paymentsSummary, currentOrder, isValidForCompletion, errors, orderDate]);

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
        setMarketingOrigin,
        loadOrderForEditing,
        handleAutoCalculateDistance,
        handleSaveOrder,
        handleCompleteOrder,
        clearForm,
        setErrors,
        validateOrder,
        setOrderDate,
    }), [setItems, setShipping, setPayments, setCustomerData, setObservation, setSeller, setMarketingOrigin, loadOrderForEditing, handleAutoCalculateDistance, handleSaveOrder, handleCompleteOrder, clearForm]);

    return { state, actions };
};
