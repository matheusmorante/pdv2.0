import Order from "../types/pdvAction.type";

const STORAGE_KEY = "pdv_order_history";

export const getOrders = (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveOrder = (order: Order): void => {
    const orders = getOrders();
    // If it doesn't have an id, we create a new one, else we're updating existing
    // But saveOrder should only handle new or update?
    // Let's generate an ID if it's completely new. And update if exists.

    if (order.id) {
        updateOrder(order);
        return;
    }

    const newOrder = {
        ...order,
        id: crypto.randomUUID(), // Generates a unique ID
        date: new Date().toLocaleString('pt-BR') // Use readable date
    };

    orders.unshift(newOrder); // Add to the front
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const updateOrder = (orderToUpdate: Order): void => {
    let orders = getOrders();
    orders = orders.map(order => order.id === orderToUpdate.id ? { ...orderToUpdate, date: new Date().toLocaleString('pt-BR') } : order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const deleteOrder = (id: string): void => {
    let orders = getOrders();
    orders = orders.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};
