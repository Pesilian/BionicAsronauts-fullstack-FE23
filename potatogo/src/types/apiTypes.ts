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

//UpdateOrders

export interface UpdateOrderRequestParams {
  orderId: string;
  orderStatus?: string;
  [key: string]: any;
}


export interface UpdateOrderResponse {
  message: string;
  changes?: string[];
  statusChange?: string | null;
  modifiedAt?: string;
}

export interface UpdateOrdersApiResponseBody {
  body?: {
    message: string;
    changes?: string[];
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
