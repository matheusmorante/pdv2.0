import { stringifyFullAddress, calcItemsTotalValue, getFixedDiscount, sumKeyValues } from "../utils";
import CustomerData from "../types/customerData.type";
import { Item } from "../types/items.type";

export const calcItemsSummary = (items: Item[]) => {
    const totalQuantity = sumKeyValues(items, 'quantity');
    const totalFixedDiscount = items.reduce((acc, item) => {
        const discount = getFixedDiscount(item);
        return acc + (discount * item.quantity)
    }, 0);
    const itemsTotalValue = calcItemsTotalValue(items);
    const itemsSubtotal = itemsTotalValue + totalFixedDiscount;

    return {
        totalQuantity,
        itemsSubtotal,
        totalFixedDiscount,
        itemsTotalValue,
    }
}

export const getShippingRouteUrl = (fullAddress: CustomerData['fullAddress']) => {
    const fullAddressString = stringifyFullAddress(fullAddress);

    const origin = encodeURIComponent("R. Cascavel, 306 - Guaraituba, Colombo - PR, 83410-270");
    const destination = encodeURIComponent(fullAddressString);

    return (
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
    )
}

export const currencyToNumber = (currency: string) => {
    return Number(currency
        .replace('.', '')
        .replace(',', '.')
        .replace('R$ ', '')
        .replace(' un', '')
        .replace(' %', '')
    );
}

