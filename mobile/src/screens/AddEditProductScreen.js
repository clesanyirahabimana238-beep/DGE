import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import productService from '../services/productService';

const CATEGORIES = [
  'Clothes',
  'Shoes',
  'Bags',
  'Household equipment',
  'Jewellery',
  'Cosmetics',
];

export const AddEditProductScreen = ({ route, navigation }) => {
  const existingProduct = route.params?.product;
  const isEditing = !!existingProduct;

  const [name, setName] = useState(existingProduct?.name || '');
  const [category, setCategory] = useState(existingProduct?.category || 'Clothes');
  const [price, setPrice] = useState(existingProduct ? String(existingProduct.price) : '');
  const [stockQuantity, setStockQuantity] = useState(
    existingProduct ? String(existingProduct.stock_quantity) : '10'
  );
  const [imageUrl, setImageUrl] = useState(existingProduct?.image_url || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!category.trim()) errs.category = 'Category is required';

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice < 0) {
      errs.price = 'Valid non-negative price is required';
    }

    const numStock = Number(stockQuantity);
    if (!stockQuantity || isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      errs.stock = 'Valid non-negative integer stock is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        stock_quantity: Number(stockQuantity),
        image_url: imageUrl.trim() || null,
        description: description.trim() || null,
      };

      if (isEditing) {
        await productService.updateProduct(existingProduct.id, payload);
        Alert.alert('Success', 'Product updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await productService.createProduct(payload);
        Alert.alert('Success', 'Product added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Submission Failed',
        err.response?.data?.error?.message || 'Could not save product.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </Text>

        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Rwandan Arabica Coffee (250g)"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9E9E9E"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Category Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <Pressable
                  key={cat}
                  style={[styles.catChip, selected && styles.catChipSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      selected && styles.catChipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Price & Stock Row */}
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flexHalf, styles.colLeft]}>
            <Text style={styles.label}>Price (RWF) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              placeholderTextColor="#9E9E9E"
            />
            {errors.price && (
              <Text style={styles.errorText}>{errors.price}</Text>
            )}
          </View>

          <View style={[styles.formGroup, styles.flexHalf, styles.colRight]}>
            <Text style={styles.label}>Stock Quantity *</Text>
            <TextInput
              style={[styles.input, errors.stock && styles.inputError]}
              placeholder="e.g. 25"
              keyboardType="number-pad"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              placeholderTextColor="#9E9E9E"
            />
            {errors.stock && (
              <Text style={styles.errorText}>{errors.stock}</Text>
            )}
          </View>
        </View>

        {/* Image URL */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            placeholderTextColor="#9E9E9E"
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide specifications, origin, details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9E9E9E"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Save Changes' : 'Publish Product'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  flexHalf: {
    flex: 1,
  },
  colLeft: {
    marginRight: 8,
  },
  colRight: {
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
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
  inputError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  catChipSelected: {
    backgroundColor: '#1B5E20',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
  },
  catChipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#E65100',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddEditProductScreen;
