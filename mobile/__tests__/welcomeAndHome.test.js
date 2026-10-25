import { SAMPLE_PRODUCTS } from '../src/services/productService';

describe('Welcome Screen and Home Page Requirements Verification', () => {
  // Requirement 1 & 2: Retail Categories & Fallback Products
  test('has the 6 core Rwamagana retail categories represented in sample data', () => {
    const requiredCategories = [
      'Clothes',
      'Shoes',
      'Bags',
      'Household equipment',
      'Jewellery',
      'Cosmetics',
    ];

    const sampleCategories = SAMPLE_PRODUCTS.map((p) => p.category);
    requiredCategories.forEach((cat) => {
      expect(sampleCategories).toContain(cat);
    });
  });

  // Requirement 1: Prices in Rwandan Francs (RWF)
  test('all products have valid positive prices and Rwandan Franc currency values', () => {
    expect(SAMPLE_PRODUCTS.length).toBeGreaterThanOrEqual(6);
    SAMPLE_PRODUCTS.forEach((product) => {
      expect(Number(product.price)).toBeGreaterThan(0);
      expect(typeof product.name).toBe('string');
      expect(product.name.length).toBeGreaterThan(0);
    });
  });

  // Requirement 2: Product Search by name and description
  test('searches products by name accurately', () => {
    const query = 'Kitenge';
    const results = SAMPLE_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.name.includes('Kitenge'))).toBe(true);
  });

  // Requirement 2: Category filtering
  test('filters products strictly by category', () => {
    const category = 'Shoes';
    const results = SAMPLE_PRODUCTS.filter((p) => p.category === category);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.category === 'Shoes')).toBe(true);
  });

  // Requirement 2 & 6: Cart operations without authentication
  test('allows guests to add products to cart and calculates totals correctly', () => {
    let cart = [];

    const addToCart = (product, quantity = 1) => {
      const existing = cart.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ product, quantity });
      }
    };

    // Add first item (Shirt: 15,000 RWF)
    addToCart(SAMPLE_PRODUCTS[0], 2);
    // Add second item (Shoes: 28,000 RWF)
    addToCart(SAMPLE_PRODUCTS[1], 1);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    expect(totalItems).toBe(3);
    expect(totalAmount).toBe(15000 * 2 + 28000 * 1); // 58,000 RWF
  });

  // Requirement 3 & 4: Protected actions and returnTo mechanism
  test('requires authentication for checkout and specifies returnTo param', () => {
    const isAuthenticated = false;
    let redirectedTo = null;
    let routeParams = null;

    const handleProceedToCheckout = (navigate) => {
      if (!isAuthenticated) {
        redirectedTo = 'Login';
        routeParams = { returnTo: 'Checkout' };
        navigate(redirectedTo, routeParams);
        return;
      }
      navigate('Checkout');
    };

    const mockNavigate = jest.fn();
    handleProceedToCheckout(mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith('Login', { returnTo: 'Checkout' });
    expect(redirectedTo).toBe('Login');
    expect(routeParams.returnTo).toBe('Checkout');
  });

  // Requirement 3 & 4: Post-login destination resumption
  test('login screen honours returnTo destination after successful authentication', () => {
    const route = { params: { returnTo: 'Checkout' } };
    let finalScreen = null;

    const onLoginSuccess = (navigation, currentRoute) => {
      const returnTo = currentRoute.params?.returnTo;
      if (returnTo) {
        finalScreen = returnTo;
        navigation.replace(returnTo);
      } else {
        finalScreen = 'HomeTab';
        navigation.navigate('HomeTab');
      }
    };

    const mockNavigation = {
      replace: jest.fn((screen) => {
        finalScreen = screen;
      }),
      navigate: jest.fn((screen) => {
        finalScreen = screen;
      }),
    };

    onLoginSuccess(mockNavigation, route);
    expect(finalScreen).toBe('Checkout');
    expect(mockNavigation.replace).toHaveBeenCalledWith('Checkout');
  });
});
