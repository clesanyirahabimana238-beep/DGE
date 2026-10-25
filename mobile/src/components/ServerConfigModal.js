import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  testServerConnection,
} from '../services/api';
import {
  DEFAULT_DEV_URL,
  EMULATOR_DEV_URL,
  PROD_API_URL,
} from '../config/environment';

export const ServerConfigModal = ({ visible, onClose, onServerChanged }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (visible) {
      loadCurrent();
    }
  }, [visible]);

  const loadCurrent = async () => {
    const url = await getApiBaseUrl();
    setCurrentUrl(url);
    setCustomInput(url);
    setTestResult(null);
  };

  const handleTest = async (urlToTest) => {
    const target = (urlToTest || customInput).trim();
    if (!target) {
      Alert.alert('Invalid URL', 'Please enter a valid server URL to test.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testServerConnection(target);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = async (urlToSave) => {
    const target = (urlToSave || customInput).trim();
    if (!target) {
      Alert.alert('Invalid URL', 'Please enter a valid server URL.');
      return;
    }
    await setApiBaseUrl(target);
    setCurrentUrl(target);
    if (onServerChanged) {
      onServerChanged(target);
    }
    Alert.alert('Server Updated', `Active API URL set to:\n${target}`, [
      { text: 'OK', onPress: onClose },
    ]);
  };

  const handleReset = async () => {
    const defaultUrl = await resetApiBaseUrl();
    setCurrentUrl(defaultUrl);
    setCustomInput(defaultUrl);
    setTestResult(null);
    if (onServerChanged) {
      onServerChanged(defaultUrl);
    }
    Alert.alert('Reset Complete', `API URL reverted to build default:\n${defaultUrl}`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>⚙️ Backend Server Settings</Text>
              <Text style={styles.modalSub}>
                Connect physical phone to local PC or cloud
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Current URL Box */}
          <View style={styles.currentUrlBox}>
            <Text style={styles.currentLabel}>ACTIVE SERVER URL:</Text>
            <Text style={styles.currentValue}>{currentUrl}</Text>
          </View>

          {/* Quick Preset Buttons */}
          <Text style={styles.presetsLabel}>Quick Switch Presets:</Text>
          <View style={styles.presetButtonsRow}>
            <Pressable
              style={[
                styles.presetChip,
                currentUrl === DEFAULT_DEV_URL && styles.presetChipActive,
              ]}
              onPress={() => {
                setCustomInput(DEFAULT_DEV_URL);
                handleTest(DEFAULT_DEV_URL);
              }}
            >
              <Text
                style={[
                  styles.presetChipText,
                  currentUrl === DEFAULT_DEV_URL && styles.presetChipTextActive,
                ]}
              >
                🏠 Wi-Fi PC ({DEFAULT_DEV_URL.replace('http://', '')})
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.presetChip,
                currentUrl === PROD_API_URL && styles.presetChipActive,
              ]}
              onPress={() => {
                setCustomInput(PROD_API_URL);
                handleTest(PROD_API_URL);
              }}
            >
              <Text
                style={[
                  styles.presetChipText,
                  currentUrl === PROD_API_URL && styles.presetChipTextActive,
                ]}
              >
                🌐 Render Cloud
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.presetChip,
                currentUrl === EMULATOR_DEV_URL && styles.presetChipActive,
              ]}
              onPress={() => {
                setCustomInput(EMULATOR_DEV_URL);
                handleTest(EMULATOR_DEV_URL);
              }}
            >
              <Text
                style={[
                  styles.presetChipText,
                  currentUrl === EMULATOR_DEV_URL && styles.presetChipTextActive,
                ]}
              >
                💻 Android Emulator (10.0.2.2)
              </Text>
            </Pressable>
          </View>

          {/* Custom Input */}
          <Text style={styles.inputLabel}>Custom Server URL:</Text>
          <TextInput
            style={styles.textInput}
            value={customInput}
            onChangeText={(val) => {
              setCustomInput(val);
              setTestResult(null);
            }}
            placeholder="http://192.168.x.x:5000"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9E9E9E"
          />

          {/* Test Status Banner */}
          {testing && (
            <View style={styles.testStatusBox}>
              <ActivityIndicator size="small" color="#1B5E20" />
              <Text style={styles.testStatusText}>
                Testing connection to {customInput}...
              </Text>
            </View>
          )}

          {testResult && (
            <View
              style={[
                styles.testStatusBox,
                testResult.success ? styles.testSuccess : styles.testFailed,
              ]}
            >
              <Text
                style={[
                  styles.testResultText,
                  testResult.success
                    ? styles.testResultSuccessText
                    : styles.testResultFailedText,
                ]}
              >
                {testResult.success
                  ? `✅ Connected! (HTTP ${testResult.status} • ${testResult.latencyMs}ms)`
                  : `❌ Connection failed (${testResult.error})`}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.testButton}
              onPress={() => handleTest()}
              disabled={testing}
            >
              <Text style={styles.testButtonText}>🔍 Test Ping</Text>
            </Pressable>

            <Pressable
              style={styles.saveButton}
              onPress={() => handleSave()}
              disabled={testing}
            >
              <Text style={styles.saveButtonText}>💾 Save & Apply</Text>
            </Pressable>
          </View>

          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Revert to Default URL</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B5E20',
  },
  modalSub: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#757575',
    fontWeight: '700',
  },
  currentUrlBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  currentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 2,
  },
  currentValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B5E20',
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 6,
  },
  presetButtonsRow: {
    gap: 6,
    marginBottom: 14,
  },
  presetChip: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  presetChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  presetChipText: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#1B5E20',
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  testStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  testStatusText: {
    fontSize: 12,
    color: '#424242',
    marginLeft: 8,
  },
  testSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
    borderWidth: 1,
  },
  testFailed: {
    backgroundColor: '#FFEBEE',
    borderColor: '#E57373',
    borderWidth: 1,
  },
  testResultText: {
    fontSize: 12,
    fontWeight: '700',
  },
  testResultSuccessText: {
    color: '#2E7D32',
  },
  testResultFailedText: {
    color: '#C62828',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#424242',
    fontWeight: '700',
    fontSize: 13,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resetButtonText: {
    color: '#757575',
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});

export default ServerConfigModal;
