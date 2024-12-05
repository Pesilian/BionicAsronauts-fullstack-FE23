import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  menuItem: string;
  menuId: string;
}

interface Special {
  specialsName: string;
  price: string;
}

const MenuList: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [specials, setSpecials] = useState<Special[]>([]); // För specials
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const menuResponse = await axios.get<{
          statusCode: number;
          headers: any;
          body: string;
        }>('https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/menu');

        const menuData = JSON.parse(menuResponse.data.body);
        if (menuData && menuData.menuItems) {
          setMenuItems(menuData.menuItems);
        } else {
          setError('Ingen menydata tillgänglig.');
        }

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
          setError('Ingen specialsdata tillgänglig.');
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.message);
        } else {
          console.error('Unknown error:', error);
        }
        setError('Misslyckades med att hämta data. Försök igen senare.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems(prevItems =>
      prevItems.includes(itemId)
        ? prevItems.filter(id => id !== itemId)
        : [...prevItems, itemId]
    );
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

      {menuItems.length === 0 && !isLoading ? (
        <p>Inga menyalternativ tillgängliga för tillfället.</p>
      ) : (
        <form>
          {menuItems.map(item => (
            <div key={item.menuId}>
              <label>
                {item.menuItem}{' '}
                <input
                  type="checkbox"
                  value={item.menuId}
                  checked={selectedItems.includes(item.menuId)}
                  onChange={() => handleCheckboxChange(item.menuId)}
                />
              </label>
            </div>
          ))}
        </form>
      )}
    </div>
  );
};

export default MenuList;
