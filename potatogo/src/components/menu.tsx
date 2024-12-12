import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  menuItem: string;
  category: string;
  price?: number;
}

interface Special {
  specialsName: string;
  price: number;
}

const MenuList: React.FC = () => {
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [specials, setSpecials] = useState<Special[]>([]);
  const [selectedItems, setSelectedItems] = useState<(MenuItem | Special)[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const menuResponse = await axios.get(
          'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/menu'
        );

        const menuData = JSON.parse(menuResponse.data.body);
        if (menuData && menuData.menuItems) {
          setMenuItems(menuData.menuItems);
        }

        const specialsResponse = await axios.get(
          'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/specials'
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

  const handleCheckboxChange = (
    item: MenuItem | Special,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedItems(prevItems => [...prevItems, item]);
    } else {
      setSelectedItems(prevItems =>
        prevItems.filter(selectedItem => selectedItem !== item)
      );
    }
  };

  const handleAddAllToCart = async () => {
    try {
      const payload: any = {};

      if (selectedItems.length === 1 && isSpecial(selectedItems[0])) {
        const special = selectedItems[0] as Special;
        payload.menuItems = {
          Specials: special.specialsName,
        };
      } else {
        payload.menuItems = {
          cartItems: selectedItems
            .map(item => {
              if (isSpecial(item)) {
                return item.specialsName;
              } else {
                return item.menuItem;
              }
            })
            .filter((value, index, self) => self.indexOf(value) === index),
        };
      }

      console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart',
        payload
      );

      console.log('Lyckades skicka:', response.data);
      alert('Alla valda objekt har lagts till i kundvagnen!');
      setSelectedItems([]);
    } catch (error) {
      console.error('Kunde inte lägga till i kundvagnen:', error);
      alert('Ett fel inträffade vid tillägg.');
    }
  };

  const isSpecial = (item: MenuItem | Special): item is Special => {
    return (item as Special).specialsName !== undefined;
  };

  return (
    <div>
      <h2>Specials</h2>
      {specials.length > 0 ? (
        specials.map((special, index) => (
          <div key={index}>
            <input
              type="checkbox"
              onChange={e => handleCheckboxChange(special, e.target.checked)}
            />
            <h3>{special.specialsName}</h3>
            <p>Price: {special.price} SEK</p>
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
              <div key={item.menuItem}>
                <input
                  type="checkbox"
                  onChange={e => handleCheckboxChange(item, e.target.checked)}
                />
                {item.menuItem} -{' '}
                {item.price ? `${item.price} SEK` : 'Pris ej tillgängligt'}
              </div>
            ))}
          </div>
        ))
      )}

      {selectedItems.length > 0 && (
        <button onClick={handleAddAllToCart}>
          Lägg alla valda i kundvagnen
        </button>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default MenuList;
