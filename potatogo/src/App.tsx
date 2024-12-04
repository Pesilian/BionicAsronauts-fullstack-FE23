import { useEffect, useState } from "react";
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports'; // Import Amplify configuration
import { Order } from './types/order'; // Import the Order type from the types folder

Amplify.configure(awsconfig); // Ensure Amplify is configured

function App() {
  const [orders, setOrders] = useState<Order[]>([]); // Use the Order type for orders state
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchOrders = async () => {
      const apiUrl = "https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/getOrders"; // Replace with your actual API URL

      try {
        setLoading(true); // Set loading state to true
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "your-auth-token", // Optional: Add if using AWS Auth
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.statusText}`);
        }

        const data = await response.json(); // Parse JSON data
        setOrders(data); // Set the orders state
        setLoading(false); // Set loading state to false
      } catch (err) {
        setError("Failed to fetch orders.");
        setLoading(false); // Set loading state to false even if an error occurs
      }
    };

    fetchOrders(); // Fetch the orders when the component mounts
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className="App">
      <header className="App-header">
        <h1>Orders</h1>
      </header>
      <main>
        {loading && <p>Loading orders...</p>} {/* Show loading message */}
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error message */}
        {!loading && !error && orders.length === 0 && (
          <p>No orders available.</p> // Show if no orders are available
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
                  <td>${order.totalCost.toFixed(2)}</td>
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
