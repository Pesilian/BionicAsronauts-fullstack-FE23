export interface Order {
  orderId: string;
  customerName: string;
  orderStatus: string;
  orderItems: string[][];
  specials: string[];
  totalPrice: number;
  createdAt: string;
  modifiedAt: string;
}




export interface fetchedOrders {
  items: Order[];
  lastEvaluatedKey: string | null;
}