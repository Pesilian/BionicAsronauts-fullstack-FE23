import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminNav from '../../components/admin/adminNav';
import OrdersView from './views/ordersView';
import MenuView from './views/menuView';
import StocksView from './views/stockView';
import styles from '../../styles/admin/adminPage.module.css';

const AdminPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <AdminNav />
      <div className={styles.content}>
        <Routes>
          <Route path="orders" element={<OrdersView />} />
          <Route path="menu" element={<MenuView />} />
          <Route path="stock" element={<StocksView />} />
          <Route path="/" element={<Navigate to="orders" />} /> {/* Default to Orders */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;
