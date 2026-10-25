import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export const CartScreen = ({ navigation }) => {
  const { cartItems, totalAmount, totalItems, updateQuantity, removeFromCart } =
    useCart();
  const { isAuthenticated } = useAuth();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to proceed with checkout and provide your delivery address in Rwamagana.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () =>
              navigation.navigate('Login', { returnTo: 'Checkout' }),
          },
        ]
      );
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }) => {
    const { product, quantity } = item;
    const itemTotal = Number(product.price) * quantity;

    return (
      <View style={styles.itemCard}>
        <View style={styles.imageBox}>
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.itemImagePlaceholder}>🛍️</Text>
          )}
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.itemUnitPrice}>
            {Number(product.price).toLocaleString()} RWF each
          </Text>
          <Text style={styles.itemSubtotal}>
            Subtotal: {itemTotal.toLocaleString()} RWF
          </Text>

          <View style={styles.quantityRow}>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => updateQuantity(product.id, quantity - 1)}
              >
                <Text style={styles.stepperButtonText}>-</Text>
              </Pressable>

              <Text style={styles.quantityText}>{quantity}</Text>

              <Pressable
                style={[
                  styles.stepperButton,
                  quantity >= product.stock_quantity && styles.stepperDisabled,
                ]}
                onPress={() => updateQuantity(product.id, quantity + 1)}
                disabled={quantity >= product.stock_quantity}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.removeButton}
              onPress={() => removeFromCart(product.id)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {cartItems.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your Cart is Empty"
          description="Browse products and add your favorite items to your shopping cart."
          actionText="Start Shopping"
          onAction={() => navigation.navigate('HomeTab')}
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Shopping Cart ({totalItems} items)</Text>
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(item.product.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />

          {/* Checkout Footer */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>
                {totalAmount.toLocaleString()} RWF
              </Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={handleProceedToCheckout}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        </>
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
    paddingBottom: 110,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#EAEAEA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 6,
    padding: 2,
  },
  stepperButton: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  stepperButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 10,
    color: '#212121',
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#616161',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
  },
  checkoutButton: {
    backgroundColor: '#E65100',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;
