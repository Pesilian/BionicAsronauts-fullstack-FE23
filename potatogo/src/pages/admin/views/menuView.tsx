import React, { useState, useEffect } from 'react';
import { fetchMenu } from '../../../api/ordersApi'; // Adjust path if needed
import styles from '../../../styles/admin/menuView.module.css';

const MenuView: React.FC = () => {
  const [menu, setMenu] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await fetchMenu();
        setMenu(response.Menu);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load menu.');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  if (loading) {
    return <div>Loading menu...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.content}>
      <h1>Menu</h1>
      <div className={styles.menuList}>
        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className={styles.category}>
            <h3>{category}</h3>
            <ul className={styles.itemList}>
              {items.map((item, index) => (
                <li key={index} className={styles.menuItem}>
                  <p><strong>{item.menuItem}</strong> - ${item.price?.toFixed(2) || 'N/A'}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuView;
