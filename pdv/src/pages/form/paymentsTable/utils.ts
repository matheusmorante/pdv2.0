export const paymentTotal = (value: number, fee: number, feeIsPercentage: boolean) => {
  const total = value;
  const feeValue = feeIsPercentage
    ? total * fee / 100
    : fee;

  return +(total + feeValue).toFixed(2);
};