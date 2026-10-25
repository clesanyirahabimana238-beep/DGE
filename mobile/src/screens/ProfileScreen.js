import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { changeAppLanguage } from '../localization/i18n';

export const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isSeller } = useAuth();

  const handleLanguageChange = async (langCode) => {
    await changeAppLanguage(langCode);
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const currentLang = i18n.language || 'en';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'seller' ? 'SELLER (Umucuruzi)' : 'CLIENT (Umukiriya)'}
            </Text>
          </View>
        </View>

        {/* Language Selection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 {t('profile.language')}</Text>
          <View style={styles.langRow}>
            <Pressable
              style={[
                styles.langChip,
                currentLang === 'en' && styles.langChipActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text
                style={[
                  styles.langChipText,
                  currentLang === 'en' && styles.langChipTextActive,
                ]}
              >
                🇬🇧 English
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.langChip,
                currentLang === 'rw' && styles.langChipActive,
              ]}
              onPress={() => handleLanguageChange('rw')}
            >
              <Text
                style={[
                  styles.langChipText,
                  currentLang === 'rw' && styles.langChipTextActive,
                ]}
              >
                🇷🇼 Ikinyarwanda
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Role Quick Links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ {t('profile.accountDetails')}</Text>
          
          {isSeller ? (
            <>
              <Pressable
                style={styles.menuItem}
                onPress={() => navigation.navigate('ManageProducts')}
              >
                <Text style={styles.menuText}>📦 {t('seller.myProducts')}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => navigation.navigate('SellerOrders')}
              >
                <Text style={styles.menuText}>📋 {t('seller.customerOrders')}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => navigation.navigate('SalesSummary')}
              >
                <Text style={styles.menuText}>📊 {t('seller.salesSummary')}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate('Orders')}
            >
              <Text style={styles.menuText}>📦 {t('orders.title')}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          )}
        </View>

        {/* Location Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLocation}>📍 D&G E-Commerce</Text>
          <Text style={styles.infoLocationSub}>Rwamagana Retail Store, Eastern Province, Rwanda</Text>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B5E20',
    textTransform: 'uppercase',
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row',
    gap: 12,
  },
  langChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  langChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B5E20',
  },
  langChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#616161',
  },
  langChipTextActive: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  menuArrow: {
    fontSize: 20,
    color: '#BDBDBD',
  },
  infoBox: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  infoLocation: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  infoLocationSub: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#C62828',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
