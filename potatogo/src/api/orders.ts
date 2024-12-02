import { get } from "@aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Order } from "../types/order";

// Fetch orders with optional headers for authentication
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await get({
      path: "/order",
      apiName: "potatogoapi", // Match your API name in aws-exports.js or amplifyconfiguration.json
    });

    // Explicitly assert the type to Order[]
    return response as unknown as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};




// export const updateOrderStatus = async (
//   orderId: string,
//   status: "Pending" | "In Progress" | "Done"
// ): Promise<void> => {
//   try {
//     await put({
//       path: `/orders/${orderId}`,
//       apiName: "potatogoapi",
//       body: { status }, // Request payload
//     });
//   } catch (error) {
//     console.error(`Error updating order ${orderId}:`, error);
//     throw error;
//   }
// };




// export const cancelOrder = async (orderId: string): Promise<void> => {
//   try {
//     await del({
//       path: `/orders/${orderId}`,
//       apiName: "potatogoapi",
//     });
//   } catch (error) {
//     console.error(`Error canceling order ${orderId}:`, error);
//     throw error;
//   }
// };

