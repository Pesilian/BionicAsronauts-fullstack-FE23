import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  menuItem: string;
  menuId: string;
  category?: string;
}

interface Special {
  specialsName: string;
  price: string;
}

const MenuList: React.FC = () => {
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [specials, setSpecials] = useState<Special[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Hämta menyalternativ
        const menuResponse = await axios.get<{
          statusCode: number;
          headers: any;
          body: string;
        }>(
          'https://c7d8k8kv2g.execute-api.eu-north-1.amazonaws.com/default/linasTest'
        );

        const menuData = JSON.parse(menuResponse.data.body);
        if (menuData && menuData.menuItems) {
          setMenuItems(menuData.menuItems);
        } else {
          console.log('No menu data available');
        }

        // Hämta specials
        const specialsResponse = await axios.get<{
          statusCode: number;
          headers: any;
          body: string;
        }>(
          'https://c7d8k8kv2g.execute-api.eu-north-1.amazonaws.com/default/linasTest'
        );

        const specialsData = JSON.parse(specialsResponse.data.body);
        if (specialsData && specialsData.specials) {
          setSpecials(specialsData.specials);
        } else {
          console.log('Error: No available specials');
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.message);
        } else {
          console.error('Unknown error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems(prevItems => {
      // Lägg till eller ta bort itemId baserat på om det redan finns i listan
      if (prevItems.includes(itemId)) {
        return prevItems.filter(id => id !== itemId);
      } else {
        return [...prevItems, itemId];
      }
    });
  };

  // Funktion för att lägga till valda artiklar till kundvagnen
  const handleAddToCart = () => {
    const selectedItemsDetails = Object.values(menuItems)
      .flat()
      .filter(item => selectedItems.includes(item.menuId));

    setCart(prevCart => [...prevCart, ...selectedItemsDetails]);
    setSelectedItems([]); // Rensa de valda artiklarna
  };

  return (
    <div>
      <h2>Specials</h2>
      {specials.length > 0 ? (
        <form>
          {specials.map((special, index) => (
            <div key={index}>
              <h3>{special.specialsName}</h3>
              <p>Price: {special.price}</p>
              <input type="checkbox" />
            </div>
          ))}
        </form>
      ) : (
        <p>Inga specials tillgängliga för tillfället.</p>
      )}

      <h2>Menyalternativ</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {isLoading && <p>Laddar...</p>}

      {!isLoading && Object.keys(menuItems).length === 0 ? (
        <p>Inga menyalternativ tillgängliga för tillfället.</p>
      ) : (
        Object.entries(menuItems).map(([category, items]) => (
          <div key={category}>
            <h3>{category}</h3>
            <form>
              {items.map(item => (
                <div key={item.menuId}>
                  <label>
                    {item.menuItem}{' '}
                    <input
                      type="checkbox"
                      value={item.menuId}
                      checked={selectedItems.includes(item.menuId)} // Gör så att endast de valda items är markerade
                      onChange={() => handleCheckboxChange(item.menuId)} // Kalla handleCheckboxChange när användaren klickar
                    />
                  </label>
                </div>
              ))}
            </form>
          </div>
        ))
      )}

      <button onClick={handleAddToCart}>Lägg i kundvagn</button>

      {/* Visa kundvagnen */}
      <h3>Kundvagn</h3>
      {cart.length > 0 ? (
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.menuItem} - {item.category}
            </li>
          ))}
        </ul>
      ) : (
        <p>Din kundvagn är tom.</p>
      )}
    </div>
  );
};

export default MenuList;
