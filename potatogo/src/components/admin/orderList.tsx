import React, { useEffect, useState } from 'react';
import { fetchOrders } from '../../api/ordersApi';
import { Order } from '../../types/orderTypes';
import { parseOrder } from '../../utils/parseOrder';
import OrderItem from './orderItem';
import styles from '../../styles/admin/orderList.module.css';

interface OrderListProps {
  orderStatus: string; // "pending", "in progress", "done"
}

const OrderList: React.FC<OrderListProps> = ({ orderStatus }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define loadOrders function at the top level
  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchOrders({ orderStatus });
      const parsedOrders = response.items.map((item: any) => parseOrder(item));
      setOrders(parsedOrders);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when orderStatus changes
  useEffect(() => {
    loadOrders();
  }, [orderStatus]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.orderList}>
      {orders.length > 0 ? (
        orders.map((order) => (
          <OrderItem
            key={order.orderId}
            order={order}
            onDelete={loadOrders} // Pass the loadOrders function
          />
        ))
      ) : (
        <p>No orders found for "{orderStatus}".</p>
      )}
    </div>
  );
};

export default OrderList;
