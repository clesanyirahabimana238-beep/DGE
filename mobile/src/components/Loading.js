import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export const Loading = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1B5E20" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F7',
  },
  text: {
    marginTop: 12,
    fontSize: 15,
    color: '#424242',
    fontWeight: '500',
  },
});

export default Loading;
