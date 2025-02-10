import React, { useState, useEffect } from 'react';
import { Order } from '../types/orderTypes';
import styles from '../styles/OrderEditOverlay.module.css';
import { fetchMenu, updateOrders } from '../api/ordersApi';
import AddItemsOverlay from './admin/addItemsOverlay';
import { MenuItem } from '../types/cartTypes';

interface OrderEditOverlayProps {
  order: Order;
  onClose: () => void;
}

const OrderEditOverlay: React.FC<OrderEditOverlayProps> = ({ order, onClose }) => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkedToppings, setCheckedToppings] = useState<Record<string, string[]>>({});
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [toppingsUpdates, setToppingsUpdates] = useState<Record<string, { add: string[]; remove: string[] }>>({});
  const [editedOrderNote, setEditedOrderNote] = useState(order.orderNote || '');
  const [snapshot, setSnapshot] = useState<Order | null>(null);

  useEffect(() => {
    if (!snapshot) {
      setSnapshot({ ...order });
    }
  }, [order, snapshot]);

  // Toggle checkboxes for removing items/toppings
  const toggleCheckbox = (itemId: string, isTopping: boolean = false, parentItemId?: string) => {
    if (isTopping && parentItemId) {
      setCheckedToppings((prev) => ({
        ...prev,
        [parentItemId]: prev[parentItemId]?.includes(itemId)
          ? prev[parentItemId].filter((t) => t !== itemId)
          : [...(prev[parentItemId] || []), itemId],
      }));
    } else {
      setCheckedItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    }
  };

  // Open overlay for adding items
  const openOverlay = async (itemId: string | null) => {
    try {
      const { Menu } = await fetchMenu();
      setMenu(Menu);
      setCurrentItemId(itemId);
      setIsOverlayOpen(true);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  // Generate a new item ID
  const generateNextOrderItemId = () => {
    const existingIds = order.numberedOrderItems.map((item) => item.id);
    let maxId = 0;

    existingIds.forEach((id) => {
      const match = id.match(/orderItem(\d+)/);
      if (match) {
        maxId = Math.max(maxId, parseInt(match[1], 10));
      }
    });

    return `orderItem${maxId + 1}`;
  };

  // Handle adding new items/toppings
  const handleAddItems = (selectedItems: MenuItem[]) => {
    let updatedOrderItems = [...order.numberedOrderItems];

    selectedItems.forEach((newItem) => {
      let itemExists = false;

      updatedOrderItems = updatedOrderItems.map((item) => {
        if (item.id === currentItemId) {
          itemExists = true;
          return {
            ...item,
            toppings: [...new Set([...item.toppings, newItem.menuItem])],
          };
        }
        return item;
      });

      if (!itemExists) {
        updatedOrderItems.push({
          id: generateNextOrderItemId(),
          name: newItem.menuItem,
          price: newItem.price || 0,
          toppings: [],
        });
      }
    });

    order.numberedOrderItems = updatedOrderItems;
    setIsOverlayOpen(false);
  };

  // Remove selected items/toppings
  const handleRemoveMarkedItems = () => {
    const updatedOrderItems = order.numberedOrderItems.filter((item) => {
      if (checkedItems.includes(item.id)) return false;
      if (checkedToppings[item.id]) {
        item.toppings = item.toppings.filter((t) => !checkedToppings[item.id].includes(t));
      }
      return true;
    });

    setCheckedItems([]);
    setCheckedToppings({});
    order.numberedOrderItems = updatedOrderItems;
  };

  // Save order changes
  const handleSaveChanges = async () => {
    try {
      const updates: Record<string, any> = {};
      const remove: string[] = checkedItems;
  
      // Ensure toppings are updated in the same structure as OrderItem
      Object.keys(toppingsUpdates).forEach((key) => {
        const { add, remove: removeToppings } = toppingsUpdates[key];
        if (add.length > 0 || removeToppings.length > 0) {
          updates[key] = {
            toppings: {
              ...(add.length > 0 ? { add } : {}),
              ...(removeToppings.length > 0 ? { remove: removeToppings } : {}),
            },
          };
        }
      });
  
      // Include order note if changed
      if (editedOrderNote !== order.orderNote) {
        updates.orderNote = editedOrderNote;
      }
  
      console.log("Submitting order update:", { orderId: order.orderId, updates, remove });
  
      await updateOrders({ orderId: order.orderId, updates, remove });
  
      alert('Order updated successfully.');
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };
  

  // Cancel changes and revert to original state
  const handleCancelChanges = () => {
    if (snapshot) {
      Object.assign(order, snapshot);
    }
    setCheckedItems([]);
    setCheckedToppings({});
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Edit Order</h2>
        <div className={styles.items}>
          {order.numberedOrderItems.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <p><strong>{item.name}</strong> - ${item.price}</p>
                <input
                  type="checkbox"
                  checked={checkedItems.includes(item.id)}
                  onChange={() => toggleCheckbox(item.id)}
                />
              </div>
              <ul>
                {item.toppings.map((topping) => (
                  <li key={topping} className={styles.topping}>
                    <input
                      type="checkbox"
                      checked={checkedToppings[item.id]?.includes(topping) || false}
                      onChange={() => toggleCheckbox(topping, true, item.id)}
                    />
                    {topping}
                  </li>
                ))}
              </ul>
              <div className={styles.cardButtonsContainer}>
                <button onClick={() => openOverlay(item.id)}>Add Toppings</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleRemoveMarkedItems} className={styles.removeButton}>Remove Checked Items</button>
        <button onClick={() => openOverlay(null)} className={styles.addNewCard}>+ Add from Menu</button>
        <textarea className={styles.orderNote} value={editedOrderNote} onChange={(e) => setEditedOrderNote(e.target.value)} />
        <div className={styles.actionButtonsRow}>
          <button onClick={handleSaveChanges}>Save Changes</button>
          <button onClick={handleCancelChanges}>Cancel Changes</button>
        </div>
      </div>
      {isOverlayOpen && <AddItemsOverlay menu={menu} onAddItems={handleAddItems} onClose={() => setIsOverlayOpen(false)} />}
    </div>
  );
};

export default OrderEditOverlay;
