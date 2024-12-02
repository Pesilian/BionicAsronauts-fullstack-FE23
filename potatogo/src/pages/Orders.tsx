import React, { useEffect, useState } from "react";
import OrderTable from "../components/OrderTable";
import { fetchOrders } from "../api/orders";
import { Order } from "../types/order";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };

    loadOrders();
  }, []);

  return (
    <div>
      <h1>Orders</h1>
      <OrderTable orders={orders} />
    </div>
  );
};

export default Orders;
