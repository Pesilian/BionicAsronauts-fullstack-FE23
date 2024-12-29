import { Order } from '../types/orderTypes';

export const parseOrder = (data: any): Order => {
  // console.log('parseOrder called with data:', data);

  const numberedOrderItems = Object.keys(data)
    .filter((key) => key.startsWith('orderItem') && Array.isArray(data[key]))
    .flatMap((key) =>
      data[key].map((item: any) => ({
        id: key, // Keep the incoming orderItem key as id
        name: item.name || '',
        price: Number(item.price) || 0,
        toppings: Array.isArray(item.toppings) ? item.toppings : [],
      }))
    );

  // console.log('numberedOrderItems:', numberedOrderItems);

  const parsedOrder = {
    orderId: data.orderId || '',
    customerName: data.customerName || '',
    orderStatus: data.orderStatus || '',
    numberedOrderItems, // Directly use the variable
    totalPrice: Number(data.totalPrice) || 0,
    createdAt: data.createdAt || data.modifiedAt || '',
    modifiedAt: data.modifiedAt || '',
    orderNote: data.orderNote || '',
  };

  // console.log('Parsed order:', parsedOrder);

  return parsedOrder;
};
