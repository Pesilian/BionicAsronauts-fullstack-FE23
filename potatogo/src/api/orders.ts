import { ApiError, get } from "@aws-amplify/api";
import { Order } from "../types/order";

/**
 * Fetch all orders from the backend.
 *
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 * @throws Will throw an error if the API call fails.
 */
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const restOperation = get({
      apiName: "getOrders", // Replace with your API name
      path: "/getOrders", // Replace with your endpoint path
    });

    const { body } = await restOperation.response;

    // Parse the response body as JSON and assert its type to Order[]
    const orders = (await body.json()) as unknown as Order[];
    return orders;
  } catch (error) {
    if (error instanceof ApiError && error.response) {
      const { statusCode, body } = error.response;
      console.error(`[fetchOrders]: Received ${statusCode} with payload: ${body}`);
    } else {
      console.error("[fetchOrders]: An unknown error occurred:", error);
    }
    throw error;
  }
};
