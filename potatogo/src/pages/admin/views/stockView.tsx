import React, { useState, useEffect } from 'react';
import { get } from '@aws-amplify/api';
import styles from '../../../styles/admin/stockView.module.css'; // Adjust path as needed

// Interfaces
interface StockItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface FetchStockApiResponseBody {
  body?: {
    message?: string;
    stockItems?: StockItem[];
  };
}

interface FetchStockResponse {
  Stock: StockItem[];
}

// Fetch Stock Function
const fetchStock = async (): Promise<FetchStockResponse> => {
  try {
    const restOperation = get({
      apiName: 'potatogoapi',
      path: '/stock',
    });

    const { body } = await restOperation.response;

    const responseBody = (await body.json()) as FetchStockApiResponseBody;

    const parsedResponseBody =
      typeof responseBody.body === "string"
        ? JSON.parse(responseBody.body)
        : responseBody.body;

    const stockItems = parsedResponseBody?.stockItems;

    if (!stockItems || stockItems.length === 0) {
      console.error('No stock items found:', parsedResponseBody);
      throw new Error(parsedResponseBody?.message || 'No stock items found.');
    }

    return {
      Stock: stockItems,
    };
  } catch (error) {
    console.error('Error fetching stock:', error);
    throw new Error('Failed to fetch stock. Please try again later.');
  }
};

// Stocks View Component
const StocksView: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStock = async () => {
      try {
        const stockData = await fetchStock();
        setStocks(stockData.Stock);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock.');
      } finally {
        setLoading(false);
      }
    };

    loadStock();
  }, []);

  if (loading) {
    return <div>Loading stock...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.stocksView}>
      <h1>Stocks View</h1>
      <div className={styles.stockList}>
        {stocks.map((item) => (
          <div key={item.id} className={styles.stockItem}>
            <h3>{item.name}</h3>
            <p>Price: ${item.price.toFixed(2)}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StocksView;
