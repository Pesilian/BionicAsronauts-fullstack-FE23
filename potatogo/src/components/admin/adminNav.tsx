import React from 'react';
import styles from '../../styles/admin/adminNav.module.css';

const adminNav: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <a href="/admin/orders" className={styles.navLink}>Orders</a>
        </li>
        <li className={styles.navItem}>
          <a href="/admin/menu" className={styles.navLink}>Menu</a>
        </li>
        <li className={styles.navItem}>
          <a href="/admin/stock" className={styles.navLink}>Stock</a>
        </li>
      </ul>
    </nav>
  );
};

export default adminNav;
