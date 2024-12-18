import { Order } from './orderTypes';


//fetchOrders response from API
export interface ApiResponseBody {
  body?: {
    items?: any[];
    lastEvaluatedKey?: string | null;
  };
}


// Parameters for fetchOrders API
export interface FetchOrdersParams {
    orderStatus?: string;
    orderId?: string;
    customerName?: string;
  }
  
  // Response for fetchOrders API
  export interface FetchOrdersResponse {
    items: Order[];
    lastEvaluatedKey?: string | null;
  }  
  
  
  // Request body for updateOrders API
  export interface UpdateOrderBody {
    orderStatus?: string;
    orderItems?: string[][];
    specials?: string[];
  }
  
  // Response for updateOrders API
  export interface UpdateOrderResponse {
    message: string;
    changes?: string[];
    statusChange?: string | null;
    modifiedAt?: string;
  }
  
  // Request body for deleteOrders API
  export interface DeleteOrderBody {
    orderId: string;
  }


  // Response for deleteOrders API
  export interface DeleteOrderResponse {
    success: boolean;
    message?: string;
  }
  