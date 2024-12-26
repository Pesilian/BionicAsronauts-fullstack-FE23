import React, { useState } from 'react';
import OrderNavTabs from '../../../components/admin/orderNavTabs';
import OrderList from '../../../components/admin/orderList';
import OrderSearch from '../../../components/admin/orderSearch';
import styles from '../../../styles/admin/ordersView.module.css';

const OrdersView: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('pending');
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  const handleStatusUpdate = (newStatus: string, orderId: string) => {
    setCurrentTab(newStatus.toLowerCase()); // Switch to the updated tab
    setHighlightedOrderId(orderId); // Pass the ID to highlight the order
  };

  return (
    <div className={styles.content}>
      {/* Tabs Navigation */}
      <OrderNavTabs currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Display Orders or Search */}
      {currentTab === 'search' ? (
        <OrderSearch />
      ) : (
        <OrderList
          orderStatus={currentTab.toLowerCase()}
          highlightedOrderId={highlightedOrderId}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default OrdersView;
