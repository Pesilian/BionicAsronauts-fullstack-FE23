import { MenuItem, Special } from '../types/cartTypes';
import { Order } from '../types/orderTypes';

export const numberedOrderItemsIntoCartItems = (data: any): MenuItem[] => {
  // Extract order items, handling both map and list types
  const numberedOrderItems = Object.keys(data).filter((key) => key.startsWith('orderItem'));
  const menuItems: MenuItem[] = [];
  numberedOrderItems.forEach((key) => {
    const orderItem = data[key];
    if (Array.isArray(orderItem)) {
      // If it's a list, process each element
      orderItem.forEach((item: any) => {
        menuItems.push({
          menuItem: item.name || '',
          category: key,
          price: Number(item.price) || 0,
          toppings: Array.isArray(item.toppings) ? item.toppings : [],
        });
      });
    } else if (orderItem && typeof orderItem === 'object') {
      // If it's a map, process it directly
      menuItems.push({
        menuItem: orderItem.name || '',
        category: key,
        price: Number(orderItem.price) || 0,
        toppings: Array.isArray(orderItem.toppings) ? orderItem.toppings : [],
      });
    }
  });

  return menuItems;
}

export const numberedOrderItemsIntoMenuSelectedItems = (data: any): any[] => {
  // Extract order items, handling both map and list types
  const numberedOrderItems = Object.keys(data).filter((key) => key.startsWith('orderItem'));
  const selectedItems: any[] = [];
  numberedOrderItems.forEach((key) => {
    const orderItem = data[key];
    if (Array.isArray(orderItem)) {
      // If it's a list, process each element
      orderItem.forEach((item: any) => {
        selectedItems.push({
          menuItem: item.name || '',
          price: Number(item.price) || 0,
          toppings: Array.isArray(item.toppings) ? item.toppings : [],
        });
      });
    } else if (orderItem && typeof orderItem === 'object') {
      // If it's a map, process it directly
      selectedItems.push({
        menuItem: orderItem.name || '',
        price: Number(orderItem.price) || 0,
        toppings: Array.isArray(orderItem.toppings) ? orderItem.toppings : [],
      });
    }
  });

  return selectedItems;
}
  

export const isSpecial = (item: MenuItem | Special): item is Special => {
  return (item as Special).specialsName !== undefined;
};

export const selectedItemsIntoMenuItem = (selectedItems: any[]): MenuItem => {
  let mainItem: MenuItem = {} as MenuItem; 
  let toppings: string[] = [];
  selectedItems.forEach(item => {
    if (isSpecial(item)) {
        mainItem.name = item.specialsName;
        mainItem.price = item.price || 0;
    } else {
      if (item.price) {
        
        mainItem.name = item.menuItem;
        mainItem.price = item.price || 0;
      } else {
       
        toppings.push(item.menuItem);
      }
    }
  });

 
  if (toppings.length > 0) {
    mainItem.toppings = toppings;
  }
  return mainItem;
};

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
