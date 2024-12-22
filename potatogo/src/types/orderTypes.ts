export interface Order {
  orderId: string;
  customerName: string;
  orderStatus: string;
  orderItems: {
    name: string;
    price: number;
    toppings: string[];
  }[];
  totalPrice: number;
  createdAt: string;
  modifiedAt: string;
  orderNote: string; // Newly added field
}





export interface fetchedOrders {
  items: Order[];
  lastEvaluatedKey: string | null;
}