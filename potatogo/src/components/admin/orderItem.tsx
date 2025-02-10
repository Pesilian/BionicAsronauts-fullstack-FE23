import React, { useState, useEffect } from 'react';
import { Order } from '../../types/orderTypes';
import { updateOrders } from '../../api/ordersApi';
import styles from '../../styles/admin/orderItem.module.css';
import { fetchMenu } from '../../api/ordersApi';
import AddItemsOverlay from './addItemsOverlay';
import { MenuItem } from '../../types/cartTypes';
import { deleteOrders } from '../../api/ordersApi';

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Order | null>(null);




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
  

  const handleOrderNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedOrderNote(e.target.value);
  };

  const handleAddItems = (selectedItems: MenuItem[]) => {
    const newToppings = selectedItems.map((item) => item.menuItem);
  
    let currentKey = currentItemId || ''; 
    if (!currentKey) {
      currentKey = generateNextOrderItemId();
      order.numberedOrderItems.push({ id: currentKey, name: 'New Dish', price: 0, toppings: [] });//logic front or backend needed for price
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

  const handleDeleteOrder = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
  
    setLoading(true);
    try {
      console.log("Deleting order:", order.orderId);
  
      await deleteOrders(order.orderId);  // ✅ Calls API
      console.log("Order deleted successfully!");
  
      onDelete(); // ⚠️ Does `onDelete` exist when OrderItem is used?
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order');
    } finally {
      setLoading(false);
    }
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
                  <div className={styles.itemHeader}>
                    <p>
                      <strong>{item.name}</strong> - ${item.price}
                    </p>
                    {isEditing && (
                      <input
                        className={styles.itemCheckbox}
                        type="checkbox"
                        checked={checkedItems.includes(item.id)}
                        onChange={() => toggleCheckbox(item.id)}
                      />
                    )}
                  </div>
                  <ul title="Toppings:" className={styles.toppings}>
                    {item.toppings.map((topping, idx) => (
                      <li key={idx} className={styles.topping}>
                        {isEditing && (
                          <input
                            className={styles.toppingCheckbox}
                            type="checkbox"
                            checked={(checkedToppings[item.id] || []).includes(topping)}
                            onChange={() => toggleCheckbox(topping, true, item.id)}
                          />
                        )}
                        <span>{topping}</span>
                      </li>
                    ))}
                  </ul>
                  {isEditing && (
                    <div className={styles.cardButtonsContainer}>
                      <button
                        onClick={() => openOverlay(item.id)}
                        className={styles.addToppingButton}
                      >
                        Add to item
                      </button>
                      <button onClick={handleRemoveMarkedToppings}>
                        Remove checked items
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isEditing && (
                <div
                  className={`${styles.itemCard} ${styles.addNewCard}`}
                  onClick={() => openOverlay(null)}
                >
                  <p>Add New Dish or Drink</p>
                </div>
              )}
            </div>
          </div>
          <div className={styles.orderNote}>
            <textarea
              value={editedOrderNote}
              onChange={handleOrderNoteChange}
              placeholder="Add a note to the order"
              className={styles.editableTextarea}
              readOnly={!isEditing}
            />
          </div>
          <div className={styles.actionButtonsRow}>
            {error && <p className={styles.error}>{error}</p>}
            {isEditing ? (
              <>
                <button
                  className={styles.cancel}
                  onClick={() => {
                    if (snapshot) {
                      Object.assign(order, snapshot);
                      setEditedOrderNote(snapshot.orderNote || '');
                      setCheckedItems([]);
                      setCheckedToppings({});
                      setNewStatus(snapshot.orderStatus);
                      setToppingsUpdates({});
                    }
                    setIsEditing(false);
                  }}
                  disabled={loading}
                >
                  Cancel Changes
                </button>
                <button
                    className={styles.deleteButton}
                    onClick={handleDeleteOrder}  // ✅ Now calls the function inside `OrderItem`
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete Order'}
                  </button>

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
                  className={styles.saveButton}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await handleOrderUpdate();
                      setIsEditing(false);
                    } catch (err) {
                      setError('Failed to update order');
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.editButton}
                  onClick={() => {
                    setSnapshot({ ...order });
                    setIsEditing(true);
                  }}
                  disabled={loading}
                >
                  Edit Order
                </button>
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
                  className={styles.updateStatusButton}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await handleOrderUpdate();
                    } catch (err) {
                      setError('Failed to update status');
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  Update Status
                </button>
              </>
            )}
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
