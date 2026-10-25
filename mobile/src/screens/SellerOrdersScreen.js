import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import sellerService from '../services/sellerService';
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

export const SellerOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await sellerService.getSellerOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load seller orders');
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    Alert.alert(
      'Update Order Status',
      `Change status of Order #${orderId} to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdatingId(orderId);
            try {
              await sellerService.updateOrderStatus(orderId, newStatus);
              fetchOrders();
            } catch (err) {
              Alert.alert('Update Failed', err.response?.data?.error?.message || 'Could not update status.');
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }) => {
    const statusStyle = STATUS_COLORS[item.status] || {
      bg: '#EEEEEE',
      text: '#424242',
    };
    const isUpdating = updatingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.clientName}>Customer: {item.client_name} ({item.client_email})</Text>
        <Text style={styles.deliveryAddress}>📍 Delivery: {item.delivery_address}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.itemCountText}>{item.item_count || 1} item(s)</Text>
          <Text style={styles.totalPrice}>
            Total: {Number(item.total_amount).toLocaleString()} RWF
          </Text>
        </View>

        {/* Transition Actions */}
        {isUpdating ? (
          <ActivityIndicator size="small" color="#1B5E20" style={styles.loader} />
        ) : (
          <View style={styles.actionsRow}>
            {item.status === 'Pending' && (
              <>
                <Pressable
                  style={[styles.actionBtn, styles.confirmBtn]}
                  onPress={() => handleUpdateStatus(item.id, 'Confirmed')}
                >
                  <Text style={styles.btnText}>✓ Confirm</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => handleUpdateStatus(item.id, 'Cancelled')}
                >
                  <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                </Pressable>
              </>
            )}

            {item.status === 'Confirmed' && (
              <>
                <Pressable
                  style={[styles.actionBtn, styles.shipBtn]}
                  onPress={() => handleUpdateStatus(item.id, 'Shipped')}
                >
                  <Text style={styles.btnText}>🚚 Ship Order</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => handleUpdateStatus(item.id, 'Cancelled')}
                >
                  <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                </Pressable>
              </>
            )}

            {item.status === 'Shipped' && (
              <>
                <Pressable
                  style={[styles.actionBtn, styles.deliverBtn]}
                  onPress={() => handleUpdateStatus(item.id, 'Delivered')}
                >
                  <Text style={styles.btnText}>📦 Mark Delivered</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => handleUpdateStatus(item.id, 'Cancelled')}
                >
                  <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                </Pressable>
              </>
            )}

            {(item.status === 'Delivered' || item.status === 'Cancelled') && (
              <Text style={styles.finalStateText}>
                Order status is finalized ({item.status})
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Orders ({orders.length})</Text>
      </View>

      {loading && !refreshing ? (
        <Loading message="Loading customer orders..." />
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
              icon="📋"
              title="No Orders Received"
              description="You have no customer orders yet. When clients buy your products, they will appear here."
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
  },
  card: {
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
    marginBottom: 8,
  },
  orderNumber: {
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
  clientName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 8,
  },
  itemCountText: {
    fontSize: 13,
    color: '#757575',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B5E20',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    backgroundColor: '#1B5E20',
  },
  shipBtn: {
    backgroundColor: '#1565C0',
  },
  deliverBtn: {
    backgroundColor: '#2E7D32',
  },
  cancelBtn: {
    backgroundColor: '#FFEBEE',
    flex: 0.6,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtnText: {
    color: '#C62828',
    fontWeight: '700',
    fontSize: 13,
  },
  finalStateText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  loader: {
    paddingVertical: 8,
  },
});

export default SellerOrdersScreen;
