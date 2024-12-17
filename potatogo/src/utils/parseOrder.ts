import { Order } from '../types/orderTypes';

export const parseOrder = (data: any): Order => {
  return {
    orderId: data.orderId,
    customerName: data.customerName,
    orderStatus: data.orderStatus,
    orderItems: [
      data.orderItem1 || [],
      data.orderItem2 || [],
      data.orderItem3 || [],
      data.orderItem4 || [],
    ].filter(item => item.length > 0), // Filter out empty arrays
    specials: [data.specials1, data.specials2, data.specials3].filter(Boolean),
    totalPrice: Number(data.totalPrice) || 0,
    createdAt: data.createdAt || data.modifiedAt || '',
    modifiedAt: data.modifiedAt || '',
  };
};
