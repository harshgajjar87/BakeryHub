import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [productCart, setProductCart] = useState(() => {
    const savedCart = localStorage.getItem('productCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Remove course cart functionality
  // const [courseCart, setCourseCart] = useState(() => {
  //   const savedCart = localStorage.getItem('courseCart');
  //   return savedCart ? JSON.parse(savedCart) : [];
  // });

  const [checkoutInProgress, setCheckoutInProgress] = useState(() => {
    const saved = localStorage.getItem('checkoutInProgress');
    return saved ? JSON.parse(saved) : false;
  });

  // Save product cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('productCart', JSON.stringify(productCart));
  }, [productCart]);

  // Remove course cart localStorage saving
  // useEffect(() => {
  //   localStorage.setItem('courseCart', JSON.stringify(courseCart));
  // }, [courseCart]);

  // Save checkoutInProgress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkoutInProgress', JSON.stringify(checkoutInProgress));
  }, [checkoutInProgress]);

  const addToCart = (item) => {
    if (item.type === 'product') {
      setProductCart(prevCart => {
        const existingItem = prevCart.find(cartItem =>
          cartItem.type === item.type && cartItem.id === item.id
        );

        if (existingItem) {
          return prevCart.map(cartItem =>
            cartItem.type === item.type && cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
              : cartItem
          );
        } else {
          return [...prevCart, { ...item, quantity: item.quantity || 1 }];
        }
      });
    }
    // Remove course cart functionality
    // else if (item.type === 'course') {
    //   setCourseCart(prevCart => {
    //     const existingItem = prevCart.find(cartItem =>
    //       cartItem.type === item.type && cartItem.id === item.id
    //     );

    //     if (existingItem) {
    //       return prevCart.map(cartItem =>
    //         cartItem.type === item.type && cartItem.id === item.id
    //           ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
    //           : cartItem
    //       );
    //     } else {
    //       return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    //     }
    //   });
    // }
  };

  const removeFromCart = (itemId, type) => {
    if (type === 'product') {
      setProductCart(prevCart => prevCart.filter(item => !(item.id === itemId && item.type === type)));
    }
    // Remove course cart functionality
    // else if (type === 'course') {
    //   setCourseCart(prevCart => prevCart.filter(item => !(item.id === itemId && item.type === type)));
    // }
  };

  const updateQuantity = (itemId, type, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, type);
      return;
    }

    if (type === 'product') {
      setProductCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId && item.type === type
            ? { ...item, quantity }
            : item
        )
      );
    }
    // Remove course cart functionality
    // else if (type === 'course') {
    //   setCourseCart(prevCart =>
    //     prevCart.map(item =>
    //       item.id === itemId && item.type === type
    //         ? { ...item, quantity }
    //         : item
    //     )
    //   );
    // }
  };

  const clearCart = () => {
    setProductCart([]);
    // Remove course cart clearing
    // setCourseCart([]);
  };

  const getCartTotal = () => {
    const productTotal = productCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Remove course total calculation
    // const courseTotal = courseCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    // return productTotal + courseTotal;
    return productTotal;
  };

  const getCartItemsCount = () => {
    const productCount = productCart.reduce((total, item) => total + item.quantity, 0);
    // Remove course count calculation
    // const courseCount = courseCart.reduce((total, item) => total + item.quantity, 0);
    // return productCount + courseCount;
    return productCount;
  };

  // Combined cart for backward compatibility - remove course cart
  const cart = [...productCart];

  const value = {
    cart,
    productCart,
    // Remove courseCart from value
    // courseCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    checkoutInProgress,
    setCheckoutInProgress
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
