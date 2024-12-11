import { get } from "@aws-amplify/api";
import { Order } from "../types/order";

export const fetchOrders = async (
  criteria: { [key: string]: string } = {},
  lastEvaluatedKey?: string
): Promise<{ items: Order[]; lastEvaluatedKey?: string }> => {
  try {
    const queryParams = new URLSearchParams(criteria);
    if (lastEvaluatedKey) {
      queryParams.append("lastEvaluatedKey", lastEvaluatedKey);
    }

    const response = await get({
      path: `/order?${queryParams.toString()}`,
      apiName: "potatogoapi", // Replace with your actual API name
    });

    // Ensure the response is correctly typed
    const { items, lastEvaluatedKey: nextKey } = response as unknown as {
      items: Order[];
      lastEvaluatedKey?: string;
    };

    return { items, lastEvaluatedKey: nextKey };
  } catch (error) {
    console.error(`[fetchOrders]: An error occurred while fetching orders with criteria (${JSON.stringify(criteria)}):`, error);
    throw error;
  }
};
