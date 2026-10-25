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
  const { user, logout, isSeller, isAuthenticated } = useAuth();

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
        {/* Header / User Card */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {isSeller ? 'SELLER (Umucuruzi)' : 'CLIENT (Umukiriya)'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>D&G</Text>
            </View>
            <Text style={styles.guestTitle}>Welcome to D&G E-Commerce</Text>
            <Text style={styles.guestLocation}>📍 Rwamagana, Rwanda</Text>
            <Text style={styles.guestDesc}>
              Sign in to view your order history, manage saved delivery addresses, and enjoy full customer benefits.
            </Text>

            <View style={styles.authButtonRow}>
              <Pressable
                style={styles.signInButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </Pressable>

              <Pressable
                style={styles.signUpButton}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.signUpButtonText}>Create Account</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Orders Quick Link (Available to logged-in clients) */}
        {isAuthenticated && !isSeller && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📦 {t('orders.title')}</Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate('Orders')}
            >
              <Text style={styles.menuText}>View My Order History</Text>
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          </View>
        )}

        {/* Seller Quick Links */}
        {isAuthenticated && isSeller && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚙️ {t('profile.accountDetails')}</Text>
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
          </View>
        )}

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

        {/* Store Location Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLocation}>📍 D&G E-Commerce</Text>
          <Text style={styles.infoLocationSub}>
            Rwamagana Retail Store, Eastern Province, Rwanda
          </Text>
          <Text style={styles.infoCategories}>
            Sells: Clothes • Shoes • Bags • Household equipment • Jewellery • Cosmetics
          </Text>
        </View>

        {/* Logout Button (Logged in users only) */}
        {isAuthenticated && (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </Pressable>
        )}
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  roleText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '700',
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  guestBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  guestBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 2,
  },
  guestLocation: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
    marginBottom: 10,
  },
  guestDesc: {
    fontSize: 13,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  authButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  signInButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  signUpButton: {
    flex: 1,
    backgroundColor: '#E65100',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row',
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FAFAFA',
  },
  langChipActive: {
    borderColor: '#1B5E20',
    backgroundColor: '#E8F5E9',
  },
  langChipText: {
    fontSize: 13,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 18,
    color: '#BDBDBD',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E20',
  },
  infoLocation: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 2,
  },
  infoLocationSub: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoCategories: {
    fontSize: 11,
    color: '#2E7D32',
    lineHeight: 15,
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
