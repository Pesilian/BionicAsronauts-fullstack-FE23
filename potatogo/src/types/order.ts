export interface Order {
  id: string; // Use string to match API IDs
  customerName: string;
  items: string[];
  status: string;
  totalCost: number;
  createdAt: string;
}
