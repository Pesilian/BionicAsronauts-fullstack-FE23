import React, { useState } from 'react';
import { fetchOrders } from '../../api/ordersApi';
import { Order } from '../../types/orderTypes';
import OrderItem from './orderItem';
import styles from '../../styles/admin/orderSearch.module.css';

const OrderSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const isNumeric = /^\d+$/.test(searchTerm);
      const response = await fetchOrders({
        orderId: isNumeric ? searchTerm : undefined, 
        customerName: !isNumeric ? searchTerm : undefined,
      });

      setSearchResults(response.items);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Search Input */}
      <div className={styles.searchField}>
        <input
          type="text"
          placeholder="Search by Order ID or Customer Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Search Results */}
      <div className={styles.results}>
        {searchResults.length > 0 ? (
          searchResults.map((order) => (
            <OrderItem key={order.orderId} order={order} onDelete={handleSearch} />
          ))
        ) : (
          !loading && <p>No results found for "{searchTerm}".</p>
        )}
      </div>
    </div>
  );
};

export default OrderSearch;
