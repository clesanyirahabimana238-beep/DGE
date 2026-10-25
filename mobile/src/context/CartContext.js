import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@dg_cart_items';

export const CartContext = createContext({
  cartItems: [],
  totalAmount: 0,
  totalItems: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load saved cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const saved = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          setCartItems(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load cart from storage:', e);
      }
    };
    loadCart();
  }, []);

  // Save cart changes to AsyncStorage
  const saveCart = async (items) => {
    setCartItems(items);
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage:', e);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + quantity;
      // Cap at available stock
      updated[existingIndex].quantity = Math.min(newQty, product.stock_quantity);
      saveCart(updated);
    } else {
      const initialQty = Math.min(quantity, product.stock_quantity);
      if (initialQty > 0) {
        saveCart([...cartItems, { product, quantity: initialQty }]);
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updated = cartItems.map((item) => {
      if (item.product.id === productId) {
        const cappedQty = Math.min(newQuantity, item.product.stock_quantity);
        return { ...item, quantity: cappedQty };
      }
      return item;
    });

    saveCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    saveCart(updated);
  };

  const clearCart = async () => {
    setCartItems([]);
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear cart storage:', e);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
