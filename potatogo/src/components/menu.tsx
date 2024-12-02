import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Typ för ett menyalternativ (menyobjekt)
interface MenuItem {
  id: string;
  name: string;
}

const MenuList: React.FC = () => {
  // Typisera state för menuItems och selectedItems
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Anta att selectedItems är en lista med ID:n för de valda artiklarna

  // Hämta menyalternativen från backend (DynamoDB)
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get<{ items: MenuItem[] }>(
          'https://your-api-url.com/get-menu-items'
        );
        setMenuItems(response.data.items); // Förutsatt att svaren innehåller en lista med MenuItem-objekt
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  // Funktion för att hantera val av artiklar med checkboxes
  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems(
      prevItems =>
        prevItems.includes(itemId)
          ? prevItems.filter(id => id !== itemId) // Ta bort item om det redan finns
          : [...prevItems, itemId] // Lägg till item om det inte finns
    );
  };

  // Skicka de valda artiklarna till backend för att uppdatera kundkorgen
  const handleOrder = async () => {
    try {
      const cartId = 'your-cart-id'; // Kan genereras eller hämtas dynamiskt
      const response = await axios.post(
        'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/testorders/cart',
        {
          cartId,
          menuItems: selectedItems, // Skicka de valda artiklarna
        }
      );
      console.log('Order placed:', response.data);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div>
      <h2>Select Items</h2>
      <form>
        {menuItems.map(item => (
          <div key={item.id}>
            <label>
              <input
                type="checkbox"
                value={item.id}
                onChange={() => handleCheckboxChange(item.id)}
              />
              {item.name}
            </label>
          </div>
        ))}
      </form>
      <button onClick={handleOrder} disabled={selectedItems.length === 0}>
        Beställ
      </button>
    </div>
  );
};

export default MenuList;
