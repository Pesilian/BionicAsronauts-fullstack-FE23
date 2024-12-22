import React, { useEffect, useState, useCallback } from 'react';
import { fetchOrders } from '../../api/ordersApi';
import { Order } from '../../types/orderTypes';
import { parseOrder } from '../../utils/parseOrder';
import OrderItem from './orderItem';
import styles from '../../styles/admin/orderList.module.css';

interface OrderListProps {
  orderStatus: string;
}

const OrderList: React.FC<OrderListProps> = ({ orderStatus }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  
  const loadOrders = useCallback(async () => {
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
  }, [orderStatus]); 


  useEffect(() => {
    loadOrders();
  }, [orderStatus, loadOrders]);
  

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.orderList}>
      {orders.length > 0 ? (
        orders.map((order) => (
          <OrderItem
            key={order.orderId}
            order={order}
            onDelete={loadOrders}
          />
        ))
      ) : (
        <p>No orders found for "{orderStatus}".</p>
      )}
    </div>
  );
};

export default OrderList;
