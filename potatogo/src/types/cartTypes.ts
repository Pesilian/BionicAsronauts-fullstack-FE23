export interface SubItem {
    name: string;
    price: number;
}

export interface Special {
  specialsName: string;
  ingridients: string;
  price: number;
}

export interface MenuItem {
    name?: string;
    menuItem: string;
    category: string;
    price?: number | null;
    toppings?: string[];
}