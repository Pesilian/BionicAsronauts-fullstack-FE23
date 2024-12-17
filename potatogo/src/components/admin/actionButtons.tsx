import React, { useState } from 'react';
import { updateOrders, deleteOrders } from '../../api/ordersApi';
import styles from '../../styles/admin/actionButtons.module.css';

interface ActionButtonsProps {
  orderId: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ orderId }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Placeholder: Update order logic (can add form state here)
      await updateOrders(orderId, { orderStatus: 'updated' });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteOrders(orderId);
      alert(`Order ${orderId} deleted successfully`);
    } catch (err) {
      setError('Failed to delete order');
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
