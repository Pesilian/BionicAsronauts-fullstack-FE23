import { Order } from '../types/orderTypes';

export const parseOrder = (data: any): Order => {
  // Extract order items, handling both map and list types
  const numberedOrderItems = Object.keys(data)
    .filter((key) => key.startsWith('orderItem'))
    .flatMap((key) => {
      const orderItem = data[key];
      if (Array.isArray(orderItem)) {
        // If it's a list, process each element
        return orderItem.map((item: any) => ({
          id: key, // Keep the incoming orderItem key as id
          name: item.name || '',
          price: Number(item.price) || 0,
          toppings: Array.isArray(item.toppings) ? item.toppings : [],
        }));
      } else if (orderItem && typeof orderItem === 'object') {
        // If it's a map, process it directly
        return {
          id: key, // Keep the incoming orderItem key as id
          name: orderItem.name || '',
          price: Number(orderItem.price) || 0,
          toppings: Array.isArray(orderItem.toppings) ? orderItem.toppings : [],
        };
      }
      return []; // Handle unexpected cases gracefully
    });

  // Parse the rest of the order data
  const parsedOrder: Order = {
    orderId: data.orderId || '',
    customerName: data.customerName || '',
    orderStatus: data.orderStatus || '',
    numberedOrderItems, // Directly use the processed order items
    totalPrice: Number(data.totalPrice) || 0,
    createdAt: data.createdAt || data.modifiedAt || '',
    modifiedAt: data.modifiedAt || '',
    orderNote: data.orderNote || '',
  };

  return parsedOrder;
};
