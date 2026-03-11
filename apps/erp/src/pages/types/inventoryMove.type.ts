export type InventoryMoveType = 'entry' | 'withdrawal' | 'balance';

export type InventoryMove = {
    id?: string;
    productId: string;
    variationId?: string;
    productDescription: string;
    type: InventoryMoveType;
    quantity: number;
    date: string;
    label?: string; // e.g., 'Venda', 'Compra', 'Ajuste Manual'
    observation?: string;
    createdAt?: string;
};

export default InventoryMove;
