import React, { useState } from 'react';
import AdminNav from '../../../components/admin/adminNav';
import OrderNavTabs from '../../../components/admin/orderNavTabs';
import OrderList from '../../../components/admin/orderList';
import styles from '../../../styles/admin/ordersView.module.css';

const OrdersView: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('pending');

  return (
    <div className={styles.container}>
      <AdminNav />
      <div className={styles.content}>
        {/* Tabs Navigation */}
        <OrderNavTabs currentTab={currentTab} onTabChange={setCurrentTab} />

        {/* Display Orders */}
        <OrderList status={currentTab.toLowerCase()} />
      </div>
    </div>
  );
};

export default OrdersView;
