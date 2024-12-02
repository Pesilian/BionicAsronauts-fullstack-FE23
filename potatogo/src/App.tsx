import { useEffect, useState } from "react";
import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';
import { fetchOrders } from "./api/orders"; // Ensure this points to the correct file
import { Order } from "./types/order"; // Ensure this is correctly defined
import "./App.css";

Amplify.configure(amplifyconfig);

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Orders</h1>
      </header>
      <main>
        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p>No orders available.</p>
        )}
        {!loading && !error && orders.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.status}</td>
                  <td>${order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default App;
