import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Typ för ett menyalternativ (menyobjekt)
interface MenuItem {
  menuItem: string; // Namnet på menyalternativet
  menuId: string; // ID för menyalternativet
}

const MenuList: React.FC = () => {
  // Typisera state för menuItems och selectedItems
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Anta att selectedItems är en lista med ID:n för de valda artiklarna
  const [error, setError] = useState<string | null>(null); // För att hantera felmeddelanden

  // Hämta menyalternativen från backend (DynamoDB)
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get<{ menuItems: MenuItem[] }>(
          'https://rbbc71unf6.execute-api.eu-north-1.amazonaws.com/default/testmenu'
        );
        setMenuItems(response.data.menuItems); // Förutsatt att svaren innehåller en lista med MenuItem-objekt
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError(
          'Misslyckades med att hämta menyalternativ. Försök igen senare.'
        );
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
      // Eventuellt visa ett bekräftelsemeddelande för användaren
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Det gick inte att skicka beställningen. Försök igen.');
    }
  };

  return (
    <div>
      <h2>Select Items</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}{' '}
      {/* Visa eventuella felmeddelanden */}
      {menuItems.length === 0 ? (
        <p>Inga menyalternativ tillgängliga för tillfället.</p>
      ) : (
        <form>
          {menuItems.map(item => (
            <div key={item.menuId}>
              <label>
                <input
                  type="checkbox"
                  value={item.menuId}
                  onChange={() => handleCheckboxChange(item.menuId)}
                />
                {item.menuItem}
              </label>
            </div>
          ))}
        </form>
      )}
      <button onClick={handleOrder} disabled={selectedItems.length === 0}>
        Skicka beställning
      </button>
    </div>
  );
};

export default MenuList;
