import { get, put, del } from '@aws-amplify/api';
import {
  FetchOrdersRequestParams,
  FetchOrdersResponse,
  FetchOrdersApiResponseBody,
  UpdateOrdersApiResponseBody,
  UpdateOrderRequestParams,
  UpdateOrderResponse,
  DeleteOrderResponse,
} from '../types/apiTypes';
import { parseOrder } from '../utils/parseOrder';
// import { parseUpdateResponse } from '../utils/parseUpdateResponse';

// Fetch orders
export const fetchOrders = async (params: FetchOrdersRequestParams): Promise<FetchOrdersResponse> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    

    const restOperation = get({
      apiName: 'potatogoapi',
      path: `/order?${queryString}`,
    });
    // console.log(`Fetching orders with query: /order?${queryString}`);


    const { body } = await restOperation.response;

    const responseBody = (await body.json()) as FetchOrdersApiResponseBody;
    console.log('ResponseBody:', responseBody);

    const parsedItems = (responseBody.body?.items || []).map((item) => {
      // console.log('Parsing item:', item);
      return parseOrder(item);
    });

    console.log('Parsed items:', parsedItems);

    return {
      items: parsedItems,
      lastEvaluatedKey: responseBody.body?.lastEvaluatedKey || null,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};




// Update an order


export const updateOrders = async (params: UpdateOrderRequestParams): Promise<UpdateOrderResponse> => {
  try {
    const { orderId, updates, remove } = params;

    if (!orderId || (!updates && !remove)) {
      throw new Error('Invalid request: orderId, updates, or remove must be provided.');
    }

    // Construct the API call
    const restOperation = put({
      apiName: 'potatogoapi',
      path: `/order`,
      options: {
        headers: {
          'Content-Type': 'application/json',
          // 'x-user-role': 'employee',
        },
        body: JSON.stringify({ orderId, updates, remove }),
      },
    });

    console.log('Updating order:', { orderId, updates, remove });

    // Parse the response
    const { body } = await restOperation.response;
    const responseBody = (await body.json()) as UpdateOrdersApiResponseBody;

    console.log('ResponseBody:', responseBody);

    return {
      message: responseBody.body?.message || 'Order updated successfully',
      changes: responseBody.body?.changes || {},
      statusChange: responseBody.body?.statusChange || null,
      modifiedAt: responseBody.body?.modifiedAt || '',
    };
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update the order.');
  }
};












// Delete an order

export const deleteOrders = async (orderId: string): Promise<DeleteOrderResponse> => {
  try {
    const restOperation = del({
      apiName: 'potatogoapi',
      path: `/order/${orderId}`,
      options: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      
    });

    
    await restOperation.response;

    console.log(`DELETE call succeeded for order ID: ${orderId}`);

    
    return { success: true, message: `Order ${orderId} deleted successfully.` };
  } catch (error: any) { // Temporarily cast error to 'any'
    console.error(`Error deleting order with ID ${orderId}:`, error);
  
    const errorMessage =
      error.response?.body ? JSON.parse(error.response.body).message : 'Unknown error occurred';
  
    throw new Error(errorMessage || `Failed to delete order ${orderId}`);
  }  
};



//Menu interfaces and Api calls
interface MenuItem {
  menuItem: string;
  category: string;
  price?: number | null;
}

interface FetchMenuApiResponseBody {
  body?: {
    message?: string;
    menuItems?: Record<string, MenuItem[]>;
  };
}

interface FetchMenuResponse {
  Menu: Record<string, MenuItem[]>;
}


export const fetchMenu = async (): Promise<FetchMenuResponse> => {
  try {
    const restOperation = get({
      apiName: 'potatogoapi',
      path: '/menu',
    });

    const { body } = await restOperation.response;

    const responseBody = (await body.json()) as FetchMenuApiResponseBody;

    const parsedResponseBody = typeof responseBody.body === "string"
      ? JSON.parse(responseBody.body)
      : responseBody.body;

    const menuItems = parsedResponseBody?.menuItems;

    if (!menuItems || Object.keys(menuItems).length === 0) {
      console.error('No menu items found:', parsedResponseBody);
      throw new Error(parsedResponseBody?.message || 'No menu items found.');
    }

    return {
      Menu: menuItems,
    };
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw new Error('Failed to fetch menu. Please try again later.');
  }
};
