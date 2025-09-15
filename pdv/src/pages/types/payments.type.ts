
export type Payment = {
    method: string;
    amount: number;
    status: string;
}

export type PaymentsData = {
  interest: number
  list: Payment[]
}

export type PaymentsSummary = {
    totalOrderValue: number,
    totalAmountPaid: number,
    amountRemaining: number
}
