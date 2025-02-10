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

  const toggleCheckbox = (item: string, isTopping: boolean = false, parentItemId?: string) => {
    if (isTopping && parentItemId) {
      setCheckedToppings((prev) => {
        const currentToppings = prev[parentItemId] || [];
        return {
          ...prev,
          [parentItemId]: currentToppings.includes(item)
            ? currentToppings.filter((topping) => topping !== item)
            : [...currentToppings, item],
        };
      });
    } else {
      setCheckedItems((prev) =>
        prev.includes(item)
          ? prev.filter((checkedItem) => checkedItem !== item)
          : [...prev, item]
      );
    }
  };

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

  const handleAddItems = (selectedItems: MenuItem[]) => {
    const newToppings = selectedItems.map((item) => item.menuItem);

    let currentKey = currentItemId || '';
    if (!currentKey) {
      currentKey = generateNextOrderItemId();
      order.numberedOrderItems.push({ id: currentKey, name: 'New Dish', price: 0, toppings: [] });
    }

    const updatedOrderItems = order.numberedOrderItems.map((item) => {
      if (item.id === currentKey) {
        return {
          ...item,
          toppings: [...item.toppings, ...newToppings],
        };
      }
      return item;
    });

    setToppingsUpdates((prev) => {
      const current = prev[currentKey] || { add: [], remove: [] };
      return {
        ...prev,
        [currentKey]: {
          add: [...current.add, ...newToppings],
          remove: current.remove,
        },
      };
    });

    order.numberedOrderItems = updatedOrderItems;
    setIsOverlayOpen(false);
  };

  const handleSaveChanges = async () => {
    try {
      const updates: Record<string, any> = {};
      const remove: string[] = [];

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

      checkedItems.forEach((itemId) => {
        remove.push(itemId);
      });

      if (editedOrderNote !== order.orderNote) {
        updates.orderNote = editedOrderNote;
      }

      const payload = {
        orderId: order.orderId,
        updates,
        remove,
      };

      console.log('Submitting order update:', payload);

      await updateOrders(payload);

      alert('Order updated successfully.');
      onClose();
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Error updating order. Please try again.');
    }
  };

  const handleRemoveMarkedToppings = () => {
    const updatedOrderItems = order.numberedOrderItems.filter((item) => {
      if (checkedItems.includes(item.id)) {
        setToppingsUpdates((prev) => {
          const updated = { ...prev };
          delete updated[item.id];
          return updated;
        });
        return false;
      }

      if (checkedToppings[item.id]?.length) {
        const removedToppings = checkedToppings[item.id];

        setToppingsUpdates((prev) => {
          const current = prev[item.id] || { add: [], remove: [] };
          const filteredAdd = current.add.filter(
            (topping) => !removedToppings.includes(topping)
          );
          const updatedRemove = [...current.remove, ...removedToppings].filter(
            (topping) => !current.add.includes(topping)
          );

          return {
            ...prev,
            [item.id]: {
              add: filteredAdd,
              remove: updatedRemove,
            },
          };
        });

        item.toppings = item.toppings.filter(
          (topping) => !removedToppings.includes(topping)
        );
      }

      return true;
    });

    setCheckedToppings({});
    order.numberedOrderItems = updatedOrderItems;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Edit Order</h2>
        <div className={styles.items}>
          {order.numberedOrderItems.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <p>
                  <strong>{item.name}</strong> - ${item.price}
                </p>
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
                <button onClick={() => openOverlay(item.id)}>Add to item</button>
                <button onClick={handleRemoveMarkedToppings}>Remove checked items</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => openOverlay(null)} className={styles.addNewCard}>
          + Add from Menu
        </button>
        <textarea
          className={styles.orderNote}
          value={editedOrderNote}
          onChange={(e) => setEditedOrderNote(e.target.value)}
        />
        <div className={styles.actionButtonsRow}>
          <button onClick={handleSaveChanges}>Save Changes</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
      {isOverlayOpen && <AddItemsOverlay menu={menu} onAddItems={handleAddItems} onClose={() => setIsOverlayOpen(false)} />}
    </div>
  );
};

export default OrderEditOverlay;
