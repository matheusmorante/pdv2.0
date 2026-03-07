// Re-export from new location for backward compatibility
import type Order from './order.type';
export type { Order as default };
export type { Order, OrderAction, IsButtonsClicked } from './order.type';
export type { OrderAction as PdvAction } from './order.type';
