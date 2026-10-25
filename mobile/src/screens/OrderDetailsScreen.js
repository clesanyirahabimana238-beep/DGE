import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import orderService from '../services/orderService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_COLORS = {
  Pending: { bg: '#FFF3E0', text: '#E65100' },
  Confirmed: { bg: '#E3F2FD', text: '#1565C0' },
  Shipped: { bg: '#F3E5F5', text: '#7B1FA2' },
  Delivered: { bg: '#E8F5E9', text: '#2E7D32' },
  Cancelled: { bg: '#FFEBEE', text: '#C62828' },
};

export const OrderDetailsScreen = ({ route }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchDetails();
    }
  }, [orderId]);

  if (loading) {
    return <Loading message="Loading order details..." />;
  }

  if (error || !order) {
    return <ErrorMessage message={error || 'Order not found'} />;
  }

  const statusStyle = STATUS_COLORS[order.status] || {
    bg: '#EEEEEE',
    text: '#424242',
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {order.status}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>Placed on {formattedDate}</Text>
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Information</Text>
          <Text style={styles.addressText}>{order.delivery_address}</Text>
          {order.client_name && (
            <Text style={styles.clientText}>Recipient: {order.client_name}</Text>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Ordered Items</Text>
          {order.items &&
            order.items.map((item, idx) => (
              <View key={item.id || idx} style={styles.itemRow}>
                <View style={styles.itemImageBox}>
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.itemImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.itemImgPlaceholder}>🛍️</Text>
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemQtyPrice}>
                    {item.quantity} x {Number(item.unit_price).toLocaleString()} RWF
                  </Text>
                  {item.seller_name && (
                    <Text style={styles.sellerName}>Seller: {item.seller_name}</Text>
                  )}
                </View>

                <Text style={styles.itemSubtotal}>
                  {(Number(item.unit_price) * item.quantity).toLocaleString()} RWF
                </Text>
              </View>
            ))}

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total Authoritative Cost:</Text>
            <Text style={styles.totalValue}>
              {Number(order.total_amount).toLocaleString()} RWF
            </Text>
          </View>
        </View>

        {/* Cash Notice */}
        <View style={styles.paymentNotice}>
          <Text style={styles.paymentNoticeIcon}>💵</Text>
          <Text style={styles.paymentNoticeText}>
            Payment method: Pay on Delivery in Rwamagana. Please have the exact amount ready upon arrival.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 13,
    color: '#757575',
    marginTop: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 4,
  },
  clientText: {
    fontSize: 13,
    color: '#757575',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemImageBox: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemImgPlaceholder: {
    fontSize: 22,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  itemQtyPrice: {
    fontSize: 12,
    color: '#757575',
  },
  sellerName: {
    fontSize: 11,
    color: '#1B5E20',
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B5E20',
  },
  paymentNotice: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentNoticeIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  paymentNoticeText: {
    fontSize: 13,
    color: '#F57F17',
    flex: 1,
    lineHeight: 18,
  },
});

export default OrderDetailsScreen;
