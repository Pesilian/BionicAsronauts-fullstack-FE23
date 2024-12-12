export interface Order {
  orderId: string;
  customerName: string;
  orderItems: string[];
  totalCost: number;
  orderStatus: string;
  createdAt: string;
  modifiedAt: string;
}
