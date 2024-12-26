import React, { useState } from 'react';
import { updateOrders, deleteOrders } from '../../api/ordersApi';
import styles from '../../styles/admin/actionButtons.module.css';

interface ActionButtonsProps {
  orderId: string;
  onDelete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ orderId, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateOrders({
        orderId, // Corrected: orderId is now part of the payload
        orderStatus: 'updated',
      });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this order?');
    if (!confirmed) {
      return; // Exit if the user cancels
    }
  
    try {
      setLoading(true);
      await deleteOrders(orderId);
      alert(`Order ${orderId} deleted successfully`);
      onDelete(); // Notify the parent to refresh the order list
    } catch (err) {
      setError('Failed to delete order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.buttons}>
      {error && <p className={styles.error}>{error}</p>}
      {isEditing ? (
        <>
          <button className={styles.save} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button className={styles.cancel} onClick={() => setIsEditing(false)} disabled={loading}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <button className={styles.edit} onClick={() => setIsEditing(true)}>
            Edit
          </button>
          <button className={styles.delete} onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
