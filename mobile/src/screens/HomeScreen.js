import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  'All',
  'Clothes',
  'Shoes',
  'Bags',
  'Household equipment',
  'Jewellery',
  'Cosmetics',
];

export const HomeScreen = ({ navigation }) => {
  const { totalItems, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bannerMessage, setBannerMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await productService.getProducts({
        search,
        category: selectedCategory,
      });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const handleQuickAdd = (product) => {
    addToCart(product, 1);
    setBannerMessage(`✓ Added "${product.name}" to cart`);
    setTimeout(() => {
      setBannerMessage('');
    }, 2500);
  };

  // Extract featured products (either marked as featured or top products)
  const featuredProducts = products.filter((p) => p.is_featured);
  const displayFeatured =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  // Render header elements inside FlatList for optimal scrolling performance
  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Banner / Success Toast */}
      {bannerMessage ? (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{bannerMessage}</Text>
        </View>
      ) : null}

      {/* Hero Welcome Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Text style={styles.heroBadge}>RWAMAGANA ONLINE STORE</Text>
          <Text style={styles.heroTitle}>Quality Retail Products at Best Prices</Text>
          <Text style={styles.heroSub}>
            Clothes • Shoes • Bags • Home Equipment • Jewellery • Cosmetics
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products by name or description..."
          placeholderTextColor="#9E9E9E"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Text style={styles.clearSearchIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Categories Horizontal Pills */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionHeaderTitle}>Categories</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <Pressable
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Featured Products Carousel (visible when browsing All and no search) */}
      {!search && selectedCategory === 'All' && displayFeatured.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>⭐ Featured Products</Text>
            <Pressable onPress={() => navigation.navigate('ProductsTab')}>
              <Text style={styles.seeAllText}>View All →</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={displayFeatured}
            keyExtractor={(item) => `featured-${item.id}`}
            contentContainerStyle={styles.featuredList}
            renderItem={({ item }) => (
              <View style={styles.featuredCard}>
                <Pressable
                  onPress={() => handleProductPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${item.name}`}
                >
                  <View style={styles.featuredImageContainer}>
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderIcon}>🛍️</Text>
                      </View>
                    )}
                    <View style={styles.featuredTagBadge}>
                      <Text style={styles.featuredTagText}>FEATURED</Text>
                    </View>
                  </View>
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.featuredPrice}>
                      {Number(item.price).toLocaleString()} RWF
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.featuredActionRow}>
                  <Pressable
                    style={styles.featuredAddButton}
                    onPress={() => handleQuickAdd(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${item.name} to cart`}
                  >
                    <Text style={styles.featuredAddText}>+ Add to Cart</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* Products Grid Title */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderTitle}>
          {selectedCategory === 'All'
            ? '🛍️ Available Products'
            : `🛍️ ${selectedCategory}`}
        </Text>
        <Text style={styles.itemCountText}>
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.brandGroup}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>D&G</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>D&G E-COMMERCE</Text>
            <Text style={styles.locationSubtitle}>📍 Rwamagana, Rwanda</Text>
          </View>
        </View>

        {/* Cart Header Button with Dynamic Counter */}
        <Pressable
          style={styles.cartHeaderButton}
          onPress={() => navigation.navigate('Cart')}
          accessibilityLabel={`Shopping cart with ${totalItems} items`}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalItems > 99 ? '99+' : totalItems}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Product List Content */}
      {loading && !refreshing ? (
        <Loading message="Loading fresh products..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchProducts} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.productList}
          ListHeaderComponent={renderHeader}
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
              onPress={() => handleProductPress(item)}
              onAddToCart={() => handleQuickAdd(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No products found"
              description={
                search
                  ? `No items matching "${search}".`
                  : 'No products available in this category yet.'
              }
              actionText="Reset filters"
              onAction={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoBadgeText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  locationSubtitle: {
    color: '#A5D6A7',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  cartHeaderButton: {
    backgroundColor: '#E65100',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E65100',
  },
  cartBadgeText: {
    color: '#E65100',
    fontSize: 11,
    fontWeight: '800',
  },
  listHeaderContainer: {
    paddingBottom: 6,
  },
  toastBanner: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  heroBanner: {
    backgroundColor: '#2E7D32',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroBadge: {
    backgroundColor: '#E65100',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSub: {
    color: '#C8E6C9',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
    paddingVertical: 4,
  },
  clearSearchIcon: {
    fontSize: 14,
    color: '#757575',
    padding: 4,
  },
  categoriesSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#1B5E20',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  featuredSection: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#212121',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  seeAllText: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: '700',
  },
  itemCountText: {
    color: '#757575',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredList: {
    paddingHorizontal: 12,
  },
  featuredCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featuredImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#EEEEEE',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 36,
  },
  featuredTagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E65100',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredContent: {
    padding: 10,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 8,
  },
  featuredActionRow: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  featuredAddButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  featuredAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  productList: {
    paddingHorizontal: 4,
    paddingBottom: 24,
  },
});

export default HomeScreen;
