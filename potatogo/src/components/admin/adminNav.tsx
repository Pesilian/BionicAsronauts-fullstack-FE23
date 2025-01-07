import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/admin/adminNav.module.css';

const AdminNav: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/admin/orders" className={styles.navLink}>Orders</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/admin/menu" className={styles.navLink}>Menu</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/admin/stock" className={styles.navLink}>Stock</Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNav;
