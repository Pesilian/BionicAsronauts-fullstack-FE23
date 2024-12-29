import { Order } from './orderTypes';


//FetchOrders
export interface FetchOrdersRequestParams {
  orderStatus?: string;
  orderId?: string;
  customerName?: string;
}

export interface FetchOrdersApiResponseBody {
  body?: {
    items?: Order[];
    lastEvaluatedKey?: string | null;
  };
}

export interface FetchOrdersResponse {
  items: Order[];
  lastEvaluatedKey?: string | null;
}

// UpdateOrderRequestParams: Request payload for the API
export interface UpdateOrderRequestParams {
  orderId: string;
  updates?: { [key: string]: any }; // Fields to update
  remove?: string[]; // Fields to remove
}

// UpdateOrderResponse: Response payload from the Lambda
export interface UpdateOrderResponse {
  message: string;
  changes?: Record<string, any>;
  statusChange?: string | null;
  modifiedAt?: string;
}

// UpdateOrdersApiResponseBody: Raw API response body
export interface UpdateOrdersApiResponseBody {
  body?: {
    message: string;
    changes?: Record<string, any>;
    statusChange?: string | null;
    modifiedAt?: string;
  };
}




// Request body for updateOrders API


// Response for updateOrders API


// Request body for deleteOrders API
export interface DeleteOrderBody {
  orderId: string;
}

// Response for deleteOrders API
export interface DeleteOrderResponse {
  success: boolean;
  message?: string;
}
