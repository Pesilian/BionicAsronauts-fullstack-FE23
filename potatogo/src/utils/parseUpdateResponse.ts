import { UpdateOrderResponse } from '../types/apiTypes';

export const parseUpdateResponse = (data: any): UpdateOrderResponse => {
  return {
    message: data.message || 'Update completed',
    changes: data.changes || [],
    statusChange: data.statusChange || null,
    modifiedAt: data.modifiedAt || '',
  };
};
