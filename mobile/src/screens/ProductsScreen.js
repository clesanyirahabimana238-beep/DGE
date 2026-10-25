import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';

export const ProductsScreen = ({ navigation }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await productService.getProducts({ search });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter catalog..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.countBar}>
        <Text style={styles.countText}>
          Available Products ({products.length})
        </Text>
      </View>

      {loading && !refreshing ? (
        <Loading message="Fetching catalog..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadProducts} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1B5E20']}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetails', { productId: item.id })
              }
              onAddToCart={() => addToCart(item, 1)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Catalog Empty"
              description="No products available matching your search."
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
  searchHeader: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#212121',
  },
  countBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#616161',
  },
  list: {
    paddingHorizontal: 4,
    paddingBottom: 24,
  },
});

export default ProductsScreen;
