import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import productService from '../services/productService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const ManageProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await productService.getMyProducts();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load your products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyProducts();
    });
    return unsubscribe;
  }, [navigation, fetchMyProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyProducts();
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to permanently delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(product.id);
              fetchMyProducts();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }) => {
    const isOutOfStock = Number(item.stock_quantity) <= 0;
    return (
      <View style={styles.productCard}>
        <View style={styles.cardInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.categoryBadge}>{item.category}</Text>
          <Text style={styles.productPrice}>
            {Number(item.price).toLocaleString()} RWF
          </Text>
          <Text
            style={[
              styles.stockText,
              isOutOfStock ? styles.outOfStock : styles.inStock,
            ]}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : `${item.stock_quantity} units available`}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('AddEditProduct', { product: item })
            }
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>My Products ({products.length})</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEditProduct')}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </Pressable>
      </View>

      {loading && !refreshing ? (
        <Loading message="Loading inventory..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMyProducts} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
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
              title="No Products Yet"
              description="You have not added any products to your seller catalog."
              actionText="+ Add Your First Product"
              onAction={() => navigation.navigate('AddEditProduct')}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  addButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    padding: 14,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1B5E20',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E65100',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inStock: {
    color: '#2E7D32',
  },
  outOfStock: {
    color: '#C62828',
  },
  actionsContainer: {
    justifyContent: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#1B5E20',
    fontWeight: '700',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#C62828',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default ManageProductsScreen;
