import React from 'react';
import AdminNav from '../../components/admin/adminNav';
import OrdersView from './views/ordersView';
import styles from '../../styles/admin/adminPage.module.css';

const AdminPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <AdminNav />
      <div className={styles.content}>
        <OrdersView />
      </div>
    </div>
  );
};

export default AdminPage;
