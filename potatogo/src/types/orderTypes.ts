export interface Order {
  orderId: string;
  customerName: string;
  orderStatus: string;
  numberedOrderItems: {
    id: string;
    name: string;
    price: number;
    toppings: string[];
  }[];
  totalPrice: number;
  createdAt: string;
  modifiedAt: string;
  orderNote: string;
}





export interface fetchedOrders {
  items: Order[];
  lastEvaluatedKey: string | null;
}