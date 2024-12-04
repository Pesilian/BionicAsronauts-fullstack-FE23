export interface Order {
  id: string; // Use string to match API IDs
  customerName: string;
  items: string[];
  status: "Pending" | "In Progress" | "Done"; // Strict union type
  totalCost: number;
  createdAt: string;
}
