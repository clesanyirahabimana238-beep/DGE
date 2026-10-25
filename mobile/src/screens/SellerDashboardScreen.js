import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import sellerService from '../services/sellerService';

export const SellerDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuickStats = useCallback(async () => {
    try {
      const data = await sellerService.getSalesSummary();
      setSummary(data);
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchQuickStats();
    });
    return unsubscribe;
  }, [navigation, fetchQuickStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuickStats();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1B5E20']}
          />
        }
      >
        {/* Welcome Header */}
        <View style={styles.headerBox}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.sellerName}>{user?.name || 'Seller'} 👋</Text>
          <Text style={styles.storeBadge}>📍 D&G E-Commerce • Rwamagana Branch</Text>
        </View>

        {/* Quick Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>
              {summary?.deliveredOrdersCount ?? 0}
            </Text>
            <Text style={styles.statLabel}>Delivered Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>
              {Number(summary?.totalSalesAmount ?? 0).toLocaleString()} RWF
            </Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
        </View>

        {/* Action Menu Cards */}
        <Text style={styles.sectionTitle}>Management Shortcuts</Text>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('ManageProducts')}
        >
          <View style={[styles.iconCircle, styles.greenCircle]}>
            <Text style={styles.cardEmoji}>📦</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Manage Products</Text>
            <Text style={styles.cardDesc}>
              Add, update prices, adjust stock, or remove products from catalog
            </Text>
          </View>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('SellerOrders')}
        >
          <View style={[styles.iconCircle, styles.orangeCircle]}>
            <Text style={styles.cardEmoji}>📋</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Customer Orders</Text>
            <Text style={styles.cardDesc}>
              Review pending requests, confirm, ship, and mark delivered
            </Text>
          </View>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('SalesSummary')}
        >
          <View style={[styles.iconCircle, styles.blueCircle]}>
            <Text style={styles.cardEmoji}>📊</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sales Summary</Text>
            <Text style={styles.cardDesc}>
              View delivered revenue, order volume, and performance reports
            </Text>
          </View>
          <Text style={styles.arrowText}>›</Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    backgroundColor: '#1B5E20',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  greeting: {
    color: '#C8E6C9',
    fontSize: 14,
    fontWeight: '500',
  },
  sellerName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 6,
  },
  storeBadge: {
    color: '#A5D6A7',
    fontSize: 12,
    fontWeight: '600',
  },
  statsBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  greenCircle: {
    backgroundColor: '#E8F5E9',
  },
  orangeCircle: {
    backgroundColor: '#FFF3E0',
  },
  blueCircle: {
    backgroundColor: '#E3F2FD',
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 16,
  },
  arrowText: {
    fontSize: 22,
    color: '#BDBDBD',
    marginLeft: 8,
  },
});

export default SellerDashboardScreen;
