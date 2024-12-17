import { Order } from '../types/orderTypes';


export const parseOrder = (data: Record<string, any>): Order => {
  const orderItems: string[][] = [];
  const specials: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('orderItem') && value.L) {
      // Extract the list of items from DynamoDB's `L` type
      orderItems.push(value.L.map((item: any) => item.S));
    } else if (key.startsWith('specials') && value.S) {
      // Extract the special value from DynamoDB's `S` type
      specials.push(value.S);
    }
  });

  return {
    orderId: data.orderId.S,
    customerName: data.customerName.S,
    orderItems,
    specials,
    orderStatus: data.orderStatus.S,
    totalPrice: Number(data.totalPrice.N),
    createdAt: data.modifiedAt.S,
    modifiedAt: data.updatedAt.S,
    rawData: data, // Store the raw data for future use
  };
};
