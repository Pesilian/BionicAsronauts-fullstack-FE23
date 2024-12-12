import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './menu.css';

interface MenuItem {
  menuItem: string;
  category: string;
}

interface Special {
  specialsName: string;
  description: string;
}

interface MenuPopupProps {
  onClose: () => void;
}

const MenuPopup: React.FC<MenuPopupProps> = ({ onClose }) => {
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [specials, setSpecials] = useState<Special[]>([]);
  const [selectedItems, setSelectedItems] = useState<(MenuItem | Special)[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categoryOrder = [
    'Potatoes',
    'Butter',
    'Protein',
    'Toppings',
    'Cheese',
    'Sauce',
    'Drinks',
  ];

  const sortedCategories = Object.entries(menuItems).sort(
    ([categoryA], [categoryB]) => {
      const indexA = categoryOrder.indexOf(categoryA);
      const indexB = categoryOrder.indexOf(categoryB);
      return (
        (indexA === -1 ? Infinity : indexA) -
        (indexB === -1 ? Infinity : indexB)
      );
    }
  );

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

      setSelectedItems([]);
    } catch (error) {
      console.error('Kunde inte lägga till i kundvagnen:', error);
      alert('Ett fel inträffade vid tillägg.');
    }
  };

  const isSpecial = (item: MenuItem | Special): item is Special => {
    return (item as Special).specialsName !== undefined;
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="menu-popup-overlay" onClick={handleOverlayClick}>
      <div className="menu-popup-content" onClick={e => e.stopPropagation()}>
        <h2 className="menu-popup-header">Our specials</h2>
        <p className="menu-popup-price">Price incl drink: 80:-</p>
        {specials.length > 0 ? (
          specials.map((special, index) => (
            <div className="menu-popup-itemContainer" key={index}>
              <p className="menu-popup-item">{special.specialsName}</p>
              <input
                className="menu-popup-checkbox"
                type="checkbox"
                checked={selectedItems.includes(special)}
                onChange={e => handleCheckboxChange(special, e.target.checked)}
              />
            </div>
          ))
        ) : (
          <p>No specials available</p>
        )}

        <h2 className="menu-popup-header">Or choose your own creation:</h2>

        <p className="menu-popup-price">Price incl drink 85:-</p>

        {isLoading ? (
          <p>Loading</p>
        ) : (
          sortedCategories.map(([category, items]) => (
            <div key={category}>
              <h3 className="menu-popup-itemHeader">{category}</h3>
              {items.map((item: MenuItem) => (
                <div className="menu-popup-itemContainer" key={item.menuItem}>
                  <p className="menu-popup-item">{item.menuItem}</p>
                  <input
                    className="menu-popup-checkbox"
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={e => handleCheckboxChange(item, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          ))
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <button className="addToCartBtn" onClick={handleAddAllToCart}>
        Add to cart
      </button>
    </div>
  );
};
export default MenuPopup;
