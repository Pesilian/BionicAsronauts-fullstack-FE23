import { get, put, del } from '@aws-amplify/api';
import {
  FetchOrdersParams,
  FetchOrdersResponse,
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

    const { body } = await restOperation.response;

    // Parse response body
    const responseBody = await body.json();
    console.log('Parsed API Response:', responseBody);

    // Return items and lastEvaluatedKey
    return {
      items: (responseBody.items || []).map(parseOrder),
      lastEvaluatedKey: responseBody.lastEvaluatedKey || null,
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

    // Await the response and handle the readable stream
    const rawResponse = await restOperation.response;

    // Convert ReadableStream to string
    const responseText = await new Response(rawResponse.body).text();
    const responseBody = JSON.parse(responseText);

    console.log('API Response:', responseBody);

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

    // Await the response and handle the readable stream
    const rawResponse = await restOperation.response;

    // Convert ReadableStream to string
    const responseText = await new Response(rawResponse.body).text();
    const responseBody = JSON.parse(responseText);

    console.log('API Response:', responseBody);

    return responseBody.body as DeleteOrderResponse;
  } catch (error) {
    console.error(`Error deleting order with ID ${orderId}:`, error);
    throw error;
  }
};


