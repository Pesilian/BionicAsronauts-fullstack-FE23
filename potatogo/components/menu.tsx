import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  menuItem: string;
  menuId: string;
}

const MenuList: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<{
          statusCode: number;
          headers: any;
          body: string;
        }>(
          'https://rbbc71unf6.execute-api.eu-north-1.amazonaws.com/default/testmenu'
        );

        console.log('API Response:', response.data);

        const parsedData = JSON.parse(response.data.body);

        if (parsedData && parsedData.menuItems) {
          setMenuItems(parsedData.menuItems);
        } else {
          setError('Ingen menydata tillgänglig.');
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.message);
        } else {
          console.error('Unknown error:', error);
        }
        setError(
          'Misslyckades med att hämta menyalternativ. Försök igen senare.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
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
