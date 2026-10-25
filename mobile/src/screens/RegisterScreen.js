import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../services/api';
import ServerConfigModal from '../components/ServerConfigModal';

export const RegisterScreen = ({ route, navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeServerUrl, setActiveServerUrl] = useState('');
  const [serverModalVisible, setServerModalVisible] = useState(false);

  useEffect(() => {
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    const url = await getApiBaseUrl();
    setActiveServerUrl(url);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      const returnTo = route?.params?.returnTo;
      const returnParams = route?.params?.returnParams;
      if (returnTo) {
        navigation.replace(returnTo, returnParams);
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('ClientTabs', { screen: 'HomeTab' });
      }
    } catch (err) {
      if (!err.response) {
        setErrorMessage(
          `⚠️ Cannot connect to backend server at:\n${activeServerUrl || 'the configured address'}\n\nPlease check your Wi-Fi or tap "Server Settings" below.`
        );
      } else {
        setErrorMessage(
          err.response?.data?.error?.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>D&G</Text>
            </View>
            <Text style={styles.appTitle}>D&G E-COMMERCE</Text>
            <Text style={styles.locationSubtitle}>📍 Rwamagana, Rwanda</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardHeader}>Create Account</Text>
            <Text style={styles.cardSub}>
              Register as a customer to browse and purchase items in Rwamagana
            </Text>

            <View style={styles.roleNotice}>
              <Text style={styles.roleNoticeText}>
                ℹ️ New accounts are registered as <Text style={styles.boldText}>Clients</Text>.
              </Text>
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Marie Claire Uwase"
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholderTextColor="#9E9E9E"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9E9E9E"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <Pressable
                onPress={() =>
                  navigation.navigate('Login', {
                    returnTo: route?.params?.returnTo,
                    returnParams: route?.params?.returnParams,
                  })
                }
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>

          {/* Server Config Footer */}
          <Pressable
            style={styles.serverFooter}
            onPress={() => setServerModalVisible(true)}
          >
            <Text style={styles.serverFooterText}>
              🌐 Server: {activeServerUrl || 'Detecting...'}
            </Text>
            <Text style={styles.serverChangeText}>⚙️ Tap to test / change</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <ServerConfigModal
        visible={serverModalVisible}
        onClose={() => setServerModalVisible(false)}
        onServerChanged={(newUrl) => {
          setActiveServerUrl(newUrl);
          setErrorMessage('');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#616161',
    fontWeight: '500',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 12,
    lineHeight: 18,
  },
  roleNotice: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
    marginBottom: 14,
  },
  roleNoticeText: {
    fontSize: 12,
    color: '#2E7D32',
  },
  boldText: {
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeText: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginPrompt: {
    color: '#616161',
    fontSize: 14,
  },
  loginLink: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '700',
  },
  serverFooter: {
    alignItems: 'center',
    marginTop: 18,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  serverFooterText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  serverChangeText: {
    fontSize: 11,
    color: '#1B5E20',
    fontWeight: '800',
    marginTop: 2,
  },
});

export default RegisterScreen;
