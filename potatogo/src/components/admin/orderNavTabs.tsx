import React from 'react';
import styles from '../../styles/admin/orderNavTabs.module.css';

interface OrderNavTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const OrderNavTabs: React.FC<OrderNavTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${currentTab === 'pending' ? styles.active : ''}`}
        onClick={() => onTabChange('pending')}
      >
        Pending
      </button>
      <button
        className={`${styles.tab} ${currentTab === 'in progress' ? styles.active : ''}`}
        onClick={() => onTabChange('in progress')}
      >
        In Progress
      </button>
      <button
        className={`${styles.tab} ${currentTab === 'done' ? styles.active : ''}`}
        onClick={() => onTabChange('done')}
      >
        Done
      </button>
      <button
        className={`${styles.tab} ${styles.search}`}
        onClick={() => onTabChange('search')}
      >
        🔍
      </button>
    </div>
  );
};

export default OrderNavTabs;
