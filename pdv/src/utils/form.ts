
export const itemTotalValue = (price: number, quantity: number, discount: number, discountIsPercentage: boolean) => {
  const total = price * quantity;
  const discountValue = discountIsPercentage 
    ? (total * discount) / 100
    : discount;
  return +(total - discountValue).toFixed(2);
};

export const toggleDiscountMode = (price: number, discount: number, discountIsPercentage: boolean) => {
  const p = price || 0;
  const d = discount || 0;

  if (discount === 0) {
    return discount
  }

  if (discountIsPercentage) {
    return +(d / p * 100 ).toFixed(2);
  } else {
    return +(p * (d / 100)).toFixed(2);                                                                                                                                               d.toFixed(2);
  }
};

export const currencyToNumber = (price: string) => {
  return Number(price.replace('.', '')
    .replace(',', '.').replace('R$ ', ''));
}

