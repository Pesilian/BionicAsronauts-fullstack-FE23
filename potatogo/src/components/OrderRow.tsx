import React from "react";
import { Order } from "../types/order";

interface OrderRowProps {
  order: Order;
}

const OrderRow: React.FC<OrderRowProps> = ({ order }) => {
  const handleStatusChange = (status: "Pending" | "In Progress" | "Done") => {
    console.log(`Change status for ${order.id} to ${status}`);
    // Add logic to update the status via API
  };

  const handleCancel = () => {
    console.log(`Cancel order ${order.id}`);
    // Add logic to cancel the order via API
  };

  return (
    <tr>
      <td>{order.id}</td>
      <td>{order.customerName}</td>
      <td>{order.status}</td>
      <td>
        <button onClick={() => handleStatusChange("Pending")}>Pending</button>
        <button onClick={() => handleStatusChange("In Progress")}>In Progress</button>
        <button onClick={() => handleStatusChange("Done")}>Done</button>
        <button onClick={handleCancel}>Cancel</button>
      </td>
    </tr>
  );
};

export default OrderRow;
