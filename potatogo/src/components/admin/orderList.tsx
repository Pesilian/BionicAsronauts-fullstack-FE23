import React, { useEffect, useState, useCallback } from 'react';
import { fetchOrders } from '../../api/ordersApi';
import { Order } from '../../types/orderTypes';
import OrderItem from './orderItem';
import styles from '../../styles/admin/orderList.module.css';

interface OrderListProps {
  orderStatus: string;
  highlightedOrderId?: string | null;
  onStatusUpdate?: (newStatus: string, orderId: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orderStatus, highlightedOrderId, onStatusUpdate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'createdAt' | 'modifiedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOrders({ orderStatus });
      const sortedOrders = response.items.sort((a: Order, b: Order) => {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [orderStatus, sortField, sortOrder]);

  useEffect(() => {
    loadOrders();
  }, [orderStatus, sortField, sortOrder, loadOrders]);

  const handleSort = (field: 'createdAt' | 'modifiedAt') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc')); // Toggle order
    } else {
      setSortField(field); // Change field
      setSortOrder('desc'); // Default to descending
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.orderList}>
      {/* Header */}
      <div className={styles.orderListHeader}>
        <span>Order ID</span>
        <span>Customer</span>
        <span onClick={() => handleSort('createdAt')} className={styles.clickable}>
          Created {sortField === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
        </span>
        <span onClick={() => handleSort('modifiedAt')} className={styles.clickable}>
          Updated {sortField === 'modifiedAt' && (sortOrder === 'desc' ? '↓' : '↑')}
        </span> 
      </div>
  
      {/* Order Items */}
      {orders.map((order) => (
        <OrderItem
          key={order.orderId}
          order={order}
          onDelete={loadOrders}
          isHighlighted={highlightedOrderId === order.orderId}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </div>
  );
  
};

export default OrderList;
