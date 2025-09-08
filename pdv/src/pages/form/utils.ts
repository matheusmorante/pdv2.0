



export const percentToValue = (price: number, discountPercent: number) => {
    const p = price || 0;
    const d = discountPercent || 0;

    if (discountPercent === 0) {
        return discountPercent
    }

    return +(p * (d / 100)).toFixed(2);
};

export const valueToPercent = (price: number, discountValue: number) => {
    const p = price || 0;
    const d = discountValue || 0;

    if (discountValue === 0) {
        return discountValue
    }

    return +(d / p * 100).toFixed(2);
};





export const currencyToNumber = (currency: string) => {
  return Number(currency.replace('.', '')
    .replace(',', '.').replace('R$ ', '').replace(' un', ''));
}

