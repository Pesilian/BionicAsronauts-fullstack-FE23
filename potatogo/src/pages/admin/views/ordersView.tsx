import React, { useState } from 'react';
import OrderNavTabs from '../../../components/admin/orderNavTabs';
import OrderList from '../../../components/admin/orderList';
import OrderSearch from '../../../components/admin/orderSearch';
import styles from '../../../styles/admin/ordersView.module.css';

const OrdersView: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('pending');

  return (
    <div className={styles.content}>
      {/* Tabs Navigation */}
      <OrderNavTabs currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Display Orders or Search */}
      {currentTab === 'search' ? (
        <OrderSearch />
      ) : (
        <OrderList orderStatus={currentTab.toLowerCase()} />
      )}
    </div>
  );
};

export default OrdersView;
