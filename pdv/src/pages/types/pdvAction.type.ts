// Re-export from new location for backward compatibility
import Order from './order.type';
export default Order;
export type { Order, OrderAction, IsButtonsClicked } from './order.type';
export type { OrderAction as PdvAction } from './order.type';
