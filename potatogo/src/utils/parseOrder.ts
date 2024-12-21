import { Order } from '../types/orderTypes';

export const parseOrder = (data: any): Order => {
  const orderItems = Object.keys(data)
    .filter(key => key.startsWith('orderItem') && Array.isArray(data[key]))
    .map(key => data[key])
    .filter(item => item.length > 0);

  const specials = Object.keys(data)
    .filter(key => key.startsWith('specials') && data[key])
    .map(key => data[key]);

  return {
    orderId: data.orderId || '',
    customerName: data.customerName || '',
    orderStatus: data.orderStatus || '',
    orderItems,
    specials,
    totalPrice: Number(data.totalPrice) || 0,
    createdAt: data.createdAt || data.modifiedAt || '',
    modifiedAt: data.modifiedAt || '',
  };
};
