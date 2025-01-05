import React, { useState } from 'react';
import styles from '../../styles/admin/addItemsOverlay.module.css'; // Adjust the path as needed

console.log('AddItemsOverlay is rendering');


interface MenuItem {
  menuItem: string;
  category: string;
  price?: number | null;
}

interface AddItemsOverlayProps {
  menu: Record<string, MenuItem[]>;
  onAddItems: (selectedItems: MenuItem[]) => void;
  onClose: () => void;
}

const AddItemsOverlay: React.FC<AddItemsOverlayProps> = ({ menu, onAddItems, onClose }) => {
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);

  const toggleItemSelection = (item: MenuItem) => {
    setSelectedItems((prev) =>
      prev.includes(item)
        ? prev.filter((selected) => selected.menuItem !== item.menuItem)
        : [...prev, item]
    );
  };

  const handleAddItems = () => {
    onAddItems(selectedItems);
    console.log('Selected items:', selectedItems); // Debug log
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2>Select Items to Add</h2>
        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className={styles.category}>
            <h3>{category}</h3>
            <ul className={styles.menuList}>
              {items.map((item) => (
                <li key={item.menuItem} className={styles.menuItem}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedItems.some((selected) => selected.menuItem === item.menuItem)}
                      onChange={() => toggleItemSelection(item)}
                    />
                    {item.menuItem} - ${item.price ?? 'N/A'}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className={styles.actions}>
          <button onClick={handleAddItems} className={styles.addButton}>
            Add Items
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemsOverlay;
