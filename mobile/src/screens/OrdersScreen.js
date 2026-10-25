import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import orderService from '../services/orderService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const STATUS_COLORS = {
  Pending: { bg: '#FFF3E0', text: '#E65100' },
  Confirmed: { bg: '#E3F2FD', text: '#1565C0' },
  Shipped: { bg: '#F3E5F5', text: '#7B1FA2' },
  Delivered: { bg: '#E8F5E9', text: '#2E7D32' },
  Cancelled: { bg: '#FFEBEE', text: '#C62828' },
};

export const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load order history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item }) => {
    const statusStyle = STATUS_COLORS[item.status] || {
      bg: '#EEEEEE',
      text: '#424242',
    };
    const dateFormatted = new Date(item.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('OrderDetails', { orderId: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderIdText}>Order #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>{dateFormatted}</Text>

        <View style={styles.addressRow}>
          <Text style={styles.addressIcon}>📍</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.delivery_address}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.itemsCount}>
            {item.item_count || 1} item(s)
          </Text>
          <Text style={styles.totalAmount}>
            {Number(item.total_amount).toLocaleString()} RWF
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading && !refreshing ? (
        <Loading message="Loading your orders..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchOrders} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1B5E20']}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📦"
              title="No Orders Yet"
              description="You have not placed any orders yet. Visit our shop and order fresh products delivered in Rwamagana!"
              actionText="Explore Products"
              onAction={() => navigation.navigate('Home')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  listContent: {
    padding: 14,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#424242',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  itemsCount: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
  },
});

export default OrdersScreen;
