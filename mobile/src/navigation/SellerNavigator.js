import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';

import SellerDashboardScreen from '../screens/SellerDashboardScreen';
import ManageProductsScreen from '../screens/ManageProductsScreen';
import SellerOrdersScreen from '../screens/SellerOrdersScreen';
import SalesSummaryScreen from '../screens/SalesSummaryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddEditProductScreen from '../screens/AddEditProductScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardIcon = () => <Text style={styles.tabIcon}>📊</Text>;
const InventoryIcon = () => <Text style={styles.tabIcon}>📦</Text>;
const OrdersIcon = () => <Text style={styles.tabIcon}>📋</Text>;
const SalesIcon = () => <Text style={styles.tabIcon}>📈</Text>;
const ProfileIcon = () => <Text style={styles.tabIcon}>👤</Text>;

const SellerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={SellerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: DashboardIcon,
        }}
      />
      <Tab.Screen
        name="ManageProductsTab"
        component={ManageProductsScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: InventoryIcon,
        }}
      />
      <Tab.Screen
        name="SellerOrdersTab"
        component={SellerOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: OrdersIcon,
        }}
      />
      <Tab.Screen
        name="SalesSummaryTab"
        component={SalesSummaryScreen}
        options={{
          tabBarLabel: 'Sales',
          tabBarIcon: SalesIcon,
        }}
      />
      <Tab.Screen
        name="SellerProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export const SellerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1B5E20' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="SellerTabs"
        component={SellerTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddEditProduct"
        component={AddEditProductScreen}
        options={{ title: 'Product Form' }}
      />
      <Stack.Screen
        name="ManageProducts"
        component={ManageProductsScreen}
        options={{ title: 'My Inventory' }}
      />
      <Stack.Screen
        name="SellerOrders"
        component={SellerOrdersScreen}
        options={{ title: 'Customer Orders' }}
      />
      <Stack.Screen
        name="SalesSummary"
        component={SalesSummaryScreen}
        options={{ title: 'Sales Performance' }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EEEEEE',
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default SellerNavigator;
