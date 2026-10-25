import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import SellerNavigator from './SellerNavigator';
import Loading from '../components/Loading';

export const AppNavigator = () => {
  const { isLoading, isAuthenticated, isSeller } = useAuth();

  if (isLoading) {
    return <Loading message="Initializing D&G E-Commerce..." />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : isSeller ? (
        <SellerNavigator />
      ) : (
        <ClientNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
