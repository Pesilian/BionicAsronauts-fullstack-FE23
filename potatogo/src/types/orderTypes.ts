export interface Order {
  orderId: string;
  customerName: string;
  orderItems: string[][]; // Parsed array of order item arrays
  specials: string[];     // Parsed array of specials
  orderStatus: string;
  totalPrice: number;
  createdAt: string;
  modifiedAt: string;
  rawData: Record<string, any>; // Store the raw DynamoDB object for flexibility
}


export interface fetchedOrders {
  items: Order[];
  lastEvaluatedKey: string | null;
}