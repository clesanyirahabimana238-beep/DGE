import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import sellerService from '../services/sellerService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const SalesSummaryScreen = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setError(null);
      const data = await sellerService.getSalesSummary();
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load sales summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading && !refreshing) {
    return <Loading message="Calculating sales metrics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSummary} />;
  }

  const deliveredCount = summary?.deliveredOrdersCount || 0;
  const totalSales = summary?.totalSalesAmount || 0;
  const avgOrderValue =
    deliveredCount > 0 ? Math.round(totalSales / deliveredCount) : 0;

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
        <Text style={styles.headerTitle}>Sales Summary</Text>
        <Text style={styles.subtitle}>
          Performance summary from delivered orders in Rwamagana
        </Text>

        {/* Total Revenue Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Revenue (Delivered)</Text>
          <Text style={styles.heroValue}>
            {Number(totalSales).toLocaleString()} RWF
          </Text>
          <Text style={styles.heroSubtext}>
            Authoritative sales from completed client deliveries
          </Text>
        </View>

        {/* Metric Cards Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📦</Text>
            <Text style={styles.metricValue}>{deliveredCount}</Text>
            <Text style={styles.metricLabel}>Delivered Orders</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📈</Text>
            <Text style={styles.metricValue}>
              {avgOrderValue.toLocaleString()} RWF
            </Text>
            <Text style={styles.metricLabel}>Avg. Order Value</Text>
          </View>
        </View>

        {/* Calculation & Documentation Note */}
        <View style={styles.documentationCard}>
          <Text style={styles.docHeader}>📊 Sales Calculation Methodology</Text>
          <Text style={styles.docBody}>
            • Only orders with status <Text style={styles.boldText}>"Delivered"</Text> are counted toward total sales and completed orders.
          </Text>
          <Text style={styles.docBody}>
            • Each qualifying order is counted exactly once.
          </Text>
          <Text style={styles.docBody}>
            • Item values are computed from unit prices locked at the moment of order placement.
          </Text>
          <Text style={styles.docBody}>
            • Orders in Pending, Confirmed, Shipped, or Cancelled statuses are excluded until delivered.
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 18,
  },
  heroCard: {
    backgroundColor: '#1B5E20',
    borderRadius: 14,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1B5E20',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C8E6C9',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtext: {
    fontSize: 12,
    color: '#A5D6A7',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  metricIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    fontWeight: '500',
  },
  documentationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  docHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 10,
  },
  docBody: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 6,
  },
  boldText: {
    fontWeight: '700',
    color: '#1B5E20',
  },
});

export default SalesSummaryScreen;
