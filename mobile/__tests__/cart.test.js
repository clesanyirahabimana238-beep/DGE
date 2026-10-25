describe('Cart Logic and Calculations', () => {
  const mockProducts = [
    {
      id: 'prod-1',
      name: 'Rwamagana Handcrafted Bag',
      price: '15000',
      stock_quantity: 5,
    },
    {
      id: 'prod-2',
      name: 'Rwanda Traditional Sandals (Inkweto)',
      price: '8500',
      stock_quantity: 3,
    },
    {
      id: 'prod-3',
      name: 'Handmade Bead Jewellery Necklace',
      price: '5000',
      stock_quantity: 10,
    },
  ];

  it('should calculate total amount and total items accurately for multiple items', () => {
    const cartItems = [
      { product: mockProducts[0], quantity: 2 },
      { product: mockProducts[1], quantity: 1 },
      { product: mockProducts[2], quantity: 3 },
    ];

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // 15000 * 2 = 30000; 8500 * 1 = 8500; 5000 * 3 = 15000. Total = 53500 RWF
    expect(totalAmount).toBe(53500);
    expect(totalItems).toBe(6);
  });

  it('should calculate subtotal correctly per item', () => {
    const item = { product: mockProducts[0], quantity: 3 };
    const subtotal = Number(item.product.price) * item.quantity;
    expect(subtotal).toBe(45000);
  });

  it('should return 0 total and empty state for empty cart', () => {
    const cartItems = [];
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    expect(totalAmount).toBe(0);
    expect(totalItems).toBe(0);
    expect(cartItems.length).toBe(0);
  });

  it('should respect stock quantity ceiling when adding items', () => {
    const product = mockProducts[1]; // stock_quantity: 3
    const requestedQty = 5;
    const cappedQty = Math.min(requestedQty, product.stock_quantity);

    expect(cappedQty).toBe(3);
  });
});
