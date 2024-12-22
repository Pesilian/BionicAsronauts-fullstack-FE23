import { Order } from '../types/orderTypes';

export const parseOrder = (data: any): Order => {

  const orderItems = Object.keys(data)
    .filter((key) => key.startsWith('orderItem') && Array.isArray(data[key]))
    .flatMap((key) => data[key])
    .map((item: any) => ({
      name: item.name || '',
      price: Number(item.price) || 0,
      toppings: Array.isArray(item.toppings) ? item.toppings : [],
    }));

  return {
    orderId: data.orderId || '',
    customerName: data.customerName || '',
    orderStatus: data.orderStatus || '',
    orderItems, 
    totalPrice: Number(data.totalPrice) || 0,
    createdAt: data.createdAt || data.modifiedAt || '',
    modifiedAt: data.modifiedAt || '',
    orderNote: data.orderNote || '', 
  };
};
