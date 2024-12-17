import React from 'react';
import styles from '../../styles/admin/orderNavTabs.module.css';

interface OrderNavTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const orderNavTabs: React.FC<OrderNavTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${currentTab === 'Pending' ? styles.active : ''}`}
        onClick={() => onTabChange('Pending')}
      >
        Pending
      </button>
      <button
        className={`${styles.tab} ${currentTab === 'In Progress' ? styles.active : ''}`}
        onClick={() => onTabChange('In Progress')}
      >
        In Progress
      </button>
      <button
        className={`${styles.tab} ${currentTab === 'Done' ? styles.active : ''}`}
        onClick={() => onTabChange('Done')}
      >
        Done
      </button>
      <button
        className={`${styles.tab} ${styles.search}`}
        onClick={() => onTabChange('Search')}
      >
        🔍
      </button>
    </div>
  );
};

export default orderNavTabs;
