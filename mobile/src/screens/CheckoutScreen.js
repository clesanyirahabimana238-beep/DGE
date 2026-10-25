import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

export const CheckoutScreen = ({ navigation }) => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login', { returnTo: 'Checkout' });
    }
  }, [isAuthenticated, navigation]);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      setAddressError('Please enter your delivery address in Rwamagana.');
      return;
    }
    setAddressError('');

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        delivery_address: deliveryAddress.trim(),
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const result = await orderService.createOrder(payload);

      // ONLY clear cart after successful order creation
      await clearCart();

      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Order #${result.order.id} has been registered.\n\nTotal: ${Number(
          result.order.total_amount
        ).toLocaleString()} RWF\n\nPayment will be collected upon delivery in Rwamagana.`,
        [
          {
            text: 'View My Orders',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Orders' }],
              });
            },
          },
        ]
      );
    } catch (err) {
      // DO NOT clear cart if checkout fails
      const msg = err.response?.data?.error?.message || 'Failed to place order. Please try again.';
      Alert.alert('Checkout Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Order Checkout</Text>

        {/* Delivery Address Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>📍 Delivery Address</Text>
          <Text style={styles.helperText}>
            Enter your destination within Rwamagana (e.g. Kigabiro, Muhazi, Rwamagana Market):
          </Text>
          <TextInput
            style={[styles.addressInput, addressError ? styles.inputError : null]}
            placeholder="Street address, building, or landmark..."
            placeholderTextColor="#9E9E9E"
            multiline
            numberOfLines={3}
            value={deliveryAddress}
            onChangeText={(txt) => {
              setDeliveryAddress(txt);
              if (addressError) setAddressError('');
            }}
          />
          {addressError ? (
            <Text style={styles.errorText}>{addressError}</Text>
          ) : null}
        </View>

        {/* Order Summary Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>📋 Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.product.id} style={styles.summaryRow}>
              <View style={styles.summaryItemInfo}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.summaryItemQty}>
                  {item.quantity} x {Number(item.product.price).toLocaleString()} RWF
                </Text>
              </View>
              <Text style={styles.summaryItemTotal}>
                {(Number(item.product.price) * item.quantity).toLocaleString()} RWF
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Authoritative Amount:</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString()} RWF
            </Text>
          </View>
        </View>

        {/* Notice on Payment */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Payment on Delivery</Text>
            <Text style={styles.noticeBody}>
              Placing this order sends your request to the seller. Payment will be collected in cash or mobile money upon delivery. No upfront payment is required.
            </Text>
          </View>
        </View>

        {/* Confirm Button */}
        <Pressable
          style={[styles.confirmButton, submitting && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirm & Place Order ({totalAmount.toLocaleString()} RWF)
            </Text>
          )}
        </Pressable>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 10,
    lineHeight: 18,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#212121',
    backgroundColor: '#FAFAFA',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  summaryItemQty: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  summaryItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
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
  noticeCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  noticeBody: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: '#E65100',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
