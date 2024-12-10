import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  menuItem: string;
  category: string;
}

interface Special {
  specialsName: string;
  item1: string;
  totalPrice: number;
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
        const menuResponse = await axios.get(
          'https://c7d8k8kv2g.execute-api.eu-north-1.amazonaws.com/default/linasTest'
        );

        const menuData = JSON.parse(menuResponse.data.body);
        if (menuData && menuData.menuItems) {
          setMenuItems(menuData.menuItems);
        }

        const specialsResponse = await axios.get(
          'https://c7d8k8kv2g.execute-api.eu-north-1.amazonaws.com/default/linasTest'
        );

        const specialsData = JSON.parse(specialsResponse.data.body);
        if (specialsData && specialsData.specials) {
          setSpecials(specialsData.specials);
        }
      } catch (error: unknown) {
        setError('Kunde inte ladda data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (menuItem: string) => {
    setSelectedItems(prevItems =>
      prevItems.includes(menuItem)
        ? prevItems.filter(item => item !== menuItem)
        : [...prevItems, menuItem]
    );
  };

  const handleAddToCart = () => {
    const selectedItemsDetails = Object.values(menuItems)
      .flat()
      .filter(item => selectedItems.includes(item.menuItem));

    setCart(prevCart => [...prevCart, ...selectedItemsDetails]);
    setSelectedItems([]);
  };

  const sendCartToAPI = async () => {
    try {
      const payload = {
        cartId: null,
        menuItems: cart.map(item => ({
          potatoe: item.menuItem,
          category: item.category,
          price: 20,
        })),
      };

      const response = await axios.post(
        'https://din-api-url.amazonaws.com/default/addToCart',
        payload
      );

      console.log('Lyckades skicka kundvagn:', response.data);
      alert('Kundvagnen har skickats!');
    } catch (error) {
      console.error('Kunde inte skicka kundvagn:', error);
      alert('Ett fel inträffade när kundvagnen skulle skickas.');
    }
  };

  return (
    <div>
      <h2>Specials</h2>
      {specials.length > 0 ? (
        specials.map((special, index) => (
          <div key={index}>
            <h3>{special.specialsName}</h3>
            <p>Price: {special.totalPrice}</p>
            <input type="checkbox" />
          </div>
        ))
      ) : (
        <p>Inga specials tillgängliga för tillfället.</p>
      )}

      <h2>Menyalternativ</h2>
      {isLoading ? (
        <p>Laddar...</p>
      ) : (
        Object.entries(menuItems).map(([category, items]) => (
          <div key={category}>
            <h3>{category}</h3>
            {items.map(item => (
              <label key={item.menuItem}>
                {item.menuItem}
                <input
                  type="checkbox"
                  value={item.menuItem}
                  checked={selectedItems.includes(item.menuItem)}
                  onChange={() => handleCheckboxChange(item.menuItem)}
                />
              </label>
            ))}
          </div>
        ))
      )}

      <button onClick={handleAddToCart}>Lägg i kundvagn</button>
      <button onClick={sendCartToAPI}>Skicka kundvagn</button>

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
