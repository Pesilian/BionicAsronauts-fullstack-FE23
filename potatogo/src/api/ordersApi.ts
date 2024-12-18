import { get, put, del } from '@aws-amplify/api';
import {
  FetchOrdersParams,
  FetchOrdersResponse,
  ApiResponseBody,
  UpdateOrderBody,
  UpdateOrderResponse,
  DeleteOrderResponse,
} from '../types/apiTypes';
import { parseOrder } from '../utils/parseOrder';
import { parseUpdateResponse } from '../utils/parseUpdateResponse';

// Fetch orders function
export const fetchOrders = async (params: FetchOrdersParams): Promise<FetchOrdersResponse> => {
  try {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();

    const restOperation = get({
      apiName: 'potatogoapi',
      path: `/order?${queryString}`,
    });
    console.log(`Fetching orders with query: /order?status=${params.status}`);

    const { body } = await restOperation.response;

    // Safely parse and cast the response
    const responseBody = (await body.json()) as ApiResponseBody;

    console.log('ResponseBody:', responseBody);

    // Access nested items and lastEvaluatedKey safely
    return {
      items: (responseBody.body?.items || []).map(parseOrder),
      lastEvaluatedKey: responseBody.body?.lastEvaluatedKey || null,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};




// Update an order
export const updateOrders = async (orderId: string, data: UpdateOrderBody): Promise<UpdateOrderResponse> => {
  try {
    const restOperation = put({
      apiName: 'potatogoapi',
      path: `/order`,
      options: {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'employee',
        },
        body: JSON.stringify({ ...data, orderId }), // Include orderId in the body
      },
    });

    // Extract and parse the response body
    const { body } = await restOperation.response;
    const responseBody = (await body.json() as unknown) as { body: UpdateOrderResponse };

    console.log('API Response:', responseBody);

    // Return the parsed update response
    return parseUpdateResponse(responseBody.body);
  } catch (error) {
    console.error(`Error updating order with ID ${orderId}:`, error);
    throw error;
  }
};




// Delete an order

export const deleteOrders = async (orderId: string): Promise<DeleteOrderResponse> => {
  try {
    const restOperation = del({
      apiName: 'potatogoapi',
      path: `/order/${orderId}`,
    });

    // Trigger the DELETE request and await the response
    await restOperation.response;

    console.log(`DELETE call succeeded for order ID: ${orderId}`);

    // Return a success response
    return { success: true, message: `Order ${orderId} deleted successfully.` };
  } catch (error: any) { // Temporarily cast error to 'any'
    console.error(`Error deleting order with ID ${orderId}:`, error);
  
    const errorMessage =
      error.response?.body ? JSON.parse(error.response.body).message : 'Unknown error occurred';
  
    throw new Error(errorMessage || `Failed to delete order ${orderId}`);
  }  
};


