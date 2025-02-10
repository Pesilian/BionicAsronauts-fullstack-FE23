import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/menu.module.css';
import CartPopup from './cart';
import cart from '../assets/cart.svg';
import { Special } from '../types/cartTypes';
import { isSpecial, selectedItemsIntoMenuItem } from '../utils/parseOrder';


interface MenuItem {
  menuItem: string;
  category: string;
  price: number
}

interface MenuPopupProps {
  onClose: () => void;
  onCartIdChange: (newCartId: string) => void;
}

const MenuPopup: React.FC<MenuPopupProps> = ({ onClose, onCartIdChange }) => {
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

   const handleScrollToCategory = (category: string) => {
    const targetRef = categoryRefs.current[category];
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  const handleShowCartPopup = () => {
    console.log('Current cartId:', cartId);

    setShowCartPopup(true);
  };

  const handleClosePopup = () => {
    setShowCartPopup(false);
  };

  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [specials, setSpecials] = useState<Special[]>([]);
  const [selectedItems, setSelectedItems] = useState<(MenuItem | Special)[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categoryOrder = [
    'Specials',
    'Potatoes',
    'Butters',
    'Protein',
    'Toppings',
    'Cheeses',
    'Sauces',
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
        

        if (specialsData && specialsData.menuItems) {
          const normalizedSpecials = specialsData.menuItems.map((special: any) => ({
            specialsName: special.specialsName,
            ingridients: special.ingridients || special.item1 || {},
            price: special.price || 0,
          }));
          setSpecials(normalizedSpecials);
        }
      } catch (error: unknown) {
        setError('Error while loading');
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

  useEffect(() => {
    const storedCartId = localStorage.getItem('cartId');
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const handleAddAllToCart = async () => {
    try {
      let currentCartId = cartId;
  
      /* This request always fails, so why do we do it? */
      // if (!currentCartId) {
      //   const newCartResponse = await axios.post(
      //     'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart',
      //     {}
      //   );
  
      //   const newCartData = JSON.parse(newCartResponse.data.body);
      //   currentCartId = newCartData.cartId;
      //   setCartId(currentCartId);
  
      //   if (onCartIdChange && currentCartId) {
      //     onCartIdChange(currentCartId);
      //     localStorage.setItem('cartId', currentCartId);
      //   }
      // }
  
      const userDetails = localStorage.getItem('user');
      const customerName = userDetails
        ? JSON.parse(userDetails).nickname
        : 'Guest';
  
      const payload: any = {
        cartId: currentCartId,
        customerName: customerName,
      };

      const mainItem = selectedItemsIntoMenuItem(selectedItems);
      payload.menuItems = { mainItem }; 
  
  
      const response = await axios.post(
        'https://h2sjmr1rse.execute-api.eu-north-1.amazonaws.com/dev/cart',
        payload
      );
  
  
      const responseData = JSON.parse(response.data.body);
      const updatedCartId = responseData.cartId;
  
      if (updatedCartId) {
        setCartId(updatedCartId);
        localStorage.setItem('cartId', updatedCartId);
      }
  
      setSelectedItems([]);
    } catch (error) {
      console.error('Kunde inte lägga till i kundvagnen:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };



  return (
    <div className={styles.menuPopupOverlay} onClick={handleOverlayClick}>
      <div className={styles.menuPopupContent} onClick={e => e.stopPropagation()}>
        <div className={styles.categoryNavigation}>
          <select
            className={styles.categorySelect}
            onChange={e => handleScrollToCategory(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Select a category
            </option>
            {categoryOrder.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {showCartPopup && (
            <CartPopup onClose={handleClosePopup} cartId={cartId} />
          )}
          <img
            src={cart}
            alt="Cart"
            className={styles.cartBtn}
            onClick={handleShowCartPopup}
          />
        </div>
        <h2 ref={el => (categoryRefs.current['Specials'] = el)} className={styles.menuPopupHeader}>Our specials</h2>

        <div className={styles.categoryContainer}>
          {specials.length > 0 ? (
            specials.map((special, index) => (
              <div className={styles.menuPopupItemContainer} key={index}>
                <p className={styles.menuPopupItem}>{special.specialsName} <span className={styles.menuPopupPrice}>{special.price} kr</span></p>
                <input
                  className={styles.menuPopupCheckbox}
                  type="checkbox"
                  checked={selectedItems.includes(special)}
                  onChange={e => handleCheckboxChange(special, e.target.checked)}
                />
              </div>
            ))
          ) : (
            <p>No specials available</p>
          )}
        </div>
        <h2 className={styles.menuPopupHeader}>Or choose your own creation:</h2>

        {isLoading ? (
          <p>Loading</p>
        ) : (
          sortedCategories.map(([category, items]) => (
            <div key={category} ref={el => (categoryRefs.current[category] = el)} className={styles.categoryContainer}>
              <h3 className={styles.menuPopupItemHeader}>{category}</h3>
              {category === 'Potatoes' && items.map((item: MenuItem) => (
                <div className={styles.menuPopupItemContainer} key={item.menuItem}>
                  <p className={styles.menuPopupItem}>
                    {item.menuItem} - <span className={styles.menuPopupPrice}>{item.price} kr</span>
                  </p>
                  <input
                    className={styles.menuPopupCheckbox}
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={e => handleCheckboxChange(item, e.target.checked)}
                  />
                </div>
              ))}

              {category !== 'Potatoes' && items.map((item: MenuItem) => (
                <div className={styles.menuPopupItemContainer} key={item.menuItem}>
                  <p className={styles.menuPopupItem}>{item.menuItem}</p>
                  <input
                    className={styles.menuPopupCheckbox}
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

      <button className={styles.addToCartBtn} onClick={handleAddAllToCart}>
        Add to cart
      </button>
    </div>
  );
};

export default MenuPopup;
