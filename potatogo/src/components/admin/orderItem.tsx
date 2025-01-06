import React, { useState, useEffect } from 'react';
import { Order } from '../../types/orderTypes';
import { updateOrders } from '../../api/ordersApi';
import ActionButtons from './actionButtons';
import styles from '../../styles/admin/orderItem.module.css';
import { fetchMenu } from '../../api/ordersApi';
import AddItemsOverlay from './addItemsOverlay';

interface MenuItem {
  menuItem: string;
  category: string;
  price?: number | null;
}

interface OrderItemProps {
  order: Order;
  onDelete: () => void;
  isHighlighted?: boolean;
  onStatusUpdate?: (newStatus: string, orderId: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  order,
  onDelete,
  isHighlighted = false,
  onStatusUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkedToppings, setCheckedToppings] = useState<Record<string, string[]>>({});
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [toppingsUpdates, setToppingsUpdates] = useState<Record<string, { add: string[]; remove: string[] }>>({});
  const [editedOrderNote, setEditedOrderNote] = useState(order.orderNote || '');


  useEffect(() => {
    if (isHighlighted) {
      setIsExpanded(true);
    }
  }, [isHighlighted]);

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

  const openOverlay = async (itemId: string) => {
    try {
      const { Menu } = await fetchMenu();
      setMenu(Menu);
      setCurrentItemId(itemId);
      setIsOverlayOpen(true);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const handleOrderNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedOrderNote(e.target.value);
  };
  

  const handleAddItems = (selectedItems: MenuItem[]) => {
    const newToppings = selectedItems.map((item) => item.menuItem);

    const updatedOrderItems = order.numberedOrderItems.map((item) => {
      if (item.id === currentItemId) {
        return {
          ...item,
          toppings: [...item.toppings, ...newToppings],
        };
      }
      return item;
    });

    const currentKey = currentItemId || '';

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

  const handleOrderUpdate = async () => {
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

      if (newStatus !== order.orderStatus) {
        updates.orderStatus = newStatus;
      }

      if (editedOrderNote !== order.orderNote) {
        updates.orderNote = editedOrderNote;
      }
      

      const payload = {
        orderId: order.orderId,
        updates,
        remove,
      };

      const updatedOrder = await updateOrders(payload);
      console.log('Updated order:', updatedOrder);

      if (onStatusUpdate) {
        onStatusUpdate(newStatus, order.orderId);
      }

      setCheckedItems([]);

      alert('Order updated successfully.');
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

    // 
    setCheckedToppings({});
    order.numberedOrderItems = updatedOrderItems;
  };

  return (
    <div className={`${styles.orderItem} ${isHighlighted ? styles.highlighted : ''}`}>
      <div className={styles.orderHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <span title={order.orderId}>
          {order.orderId.length > 5 ? `${order.orderId.slice(0, 5)}...` : order.orderId}
        </span>
        <span>{order.customerName}</span>
        <span title={new Date(order.createdAt).toLocaleString()}>
          @: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span title={order.modifiedAt ? new Date(order.modifiedAt).toLocaleString() : ''}>
          @: {order.modifiedAt ? new Date(order.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </span>
      </div>

      {isExpanded && (
        <div className={styles.orderDetails}>
          <div className={styles.items}>
            <div className={styles.cardContainer}>
              {order.numberedOrderItems.map((item, index) => (
                <div key={index} className={styles.itemCard}>
                  <p>
                    <strong>{item.name}</strong> - ${item.price}
                  </p>
                  <input
                    className={styles.itemCheckbox}
                    type="checkbox"
                    checked={checkedItems.includes(item.id)}
                    onChange={() => toggleCheckbox(item.id)}
                  />
                  <ul title="Toppings:" className={styles.toppings}>
                    {item.toppings.map((topping, idx) => (
                      <li key={idx} className={styles.topping}>
                        <input
                          className={styles.toppingCheckbox}
                          type="checkbox"
                          checked={(checkedToppings[item.id] || []).includes(topping)}
                          onChange={() => toggleCheckbox(topping, true, item.id)}
                        />
                        <span>{topping}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openOverlay(item.id)}
                    className={styles.addToppingButton}
                  >
                    Add More
                  </button>
                  <button onClick={handleRemoveMarkedToppings}>Log Marked Toppings</button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.orderNote}>
              <textarea
                value={editedOrderNote}
                onChange={handleOrderNoteChange}
                placeholder="Add a note to the order"
                className={styles.editableTextarea}
              />
          </div>
          <div className={styles.actionButtonsRow}>
            <ActionButtons orderId={order.orderId} onDelete={onDelete} />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={styles.statusDropdown}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={handleOrderUpdate}
              className={styles.updateOrderButton}
            >
              Update Order
            </button>
          </div>
        </div>
      )}

      {isOverlayOpen && (
        <AddItemsOverlay
          menu={menu}
          onAddItems={handleAddItems}
          onClose={() => setIsOverlayOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderItem;
