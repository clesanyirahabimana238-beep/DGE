import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const ProductDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { productId } = route.params || {};
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(productId);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleIncrease = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock_quantity <= 0) return;
    addToCart(product, quantity);
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${product.name} added to your shopping cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  if (loading) {
    return <Loading message="Loading product information..." />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} />;
  }

  const isOutOfStock = Number(product.stock_quantity) <= 0;
  const formattedPrice = Number(product.price).toLocaleString();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>🛍️</Text>
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.infoCard}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formattedPrice} RWF</Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.stockPill,
                isOutOfStock ? styles.stockPillOut : styles.stockPillIn,
              ]}
            >
              <Text
                style={[
                  styles.stockPillText,
                  isOutOfStock ? styles.stockTextOut : styles.stockTextIn,
                ]}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : `In Stock (${product.stock_quantity} available)`}
              </Text>
            </View>

            {product.seller_name && (
              <Text style={styles.sellerText}>
                Sold by: <Text style={styles.sellerBold}>{product.seller_name}</Text>
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No detailed description provided for this product.'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.quantityContainer}>
          <Pressable
            style={[styles.qtyButton, quantity <= 1 && styles.qtyButtonDisabled]}
            onPress={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </Pressable>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Pressable
            style={[
              styles.qtyButton,
              (quantity >= product.stock_quantity || isOutOfStock) &&
                styles.qtyButtonDisabled,
            ]}
            onPress={handleIncrease}
            disabled={quantity >= product.stock_quantity || isOutOfStock}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.addToCartButton,
            isOutOfStock && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.addToCartText}>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#EAEAEA',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },
  placeholderIcon: {
    fontSize: 72,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 8,
    lineHeight: 28,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stockPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockPillIn: {
    backgroundColor: '#E8F5E9',
  },
  stockPillOut: {
    backgroundColor: '#FFEBEE',
  },
  stockPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockTextIn: {
    color: '#2E7D32',
  },
  stockTextOut: {
    color: '#C62828',
  },
  sellerText: {
    fontSize: 12,
    color: '#757575',
  },
  sellerBold: {
    fontWeight: '700',
    color: '#424242',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#616161',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 14,
  },
  qtyButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  qtyButtonDisabled: {
    opacity: 0.4,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    color: '#212121',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#E65100',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductDetailsScreen;
