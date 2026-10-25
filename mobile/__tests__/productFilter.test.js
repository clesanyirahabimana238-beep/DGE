describe('Product Filtering and Search Logic', () => {
  const products = [
    { id: '1', name: 'Cotton Kitenge Shirt', category: 'Clothes', price: 12000 },
    { id: '2', name: 'Leather Safari Shoes', category: 'Shoes', price: 25000 },
    { id: '3', name: 'Woven Sisal Basket Bag', category: 'Bags', price: 9000 },
    { id: '4', name: 'Stainless Steel Kettle', category: 'Household equipment', price: 18000 },
    { id: '5', name: 'Kazuri Ceramic Bead Necklace', category: 'Jewellery', price: 7500 },
    { id: '6', name: 'Organic Shea Butter Cream', category: 'Cosmetics', price: 6000 },
    { id: '7', name: 'Linen Casual Trousers', category: 'Clothes', price: 14000 },
  ];

  const filterProducts = (items, selectedCategory, searchQuery) => {
    return items.filter((p) => {
      const matchesCategory =
        !selectedCategory || selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  };

  it('should return all products when category is "All" and no search query', () => {
    const result = filterProducts(products, 'All', '');
    expect(result.length).toBe(7);
  });

  it('should filter correctly for each D&G business category', () => {
    const categories = [
      'Clothes',
      'Shoes',
      'Bags',
      'Household equipment',
      'Jewellery',
      'Cosmetics',
    ];

    categories.forEach((cat) => {
      const filtered = filterProducts(products, cat, '');
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((item) => {
        expect(item.category).toBe(cat);
      });
    });
  });

  it('should filter products matching case-insensitive search queries', () => {
    const result = filterProducts(products, 'All', 'kitenge');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Cotton Kitenge Shirt');

    const resultUpper = filterProducts(products, 'All', 'BASKET');
    expect(resultUpper.length).toBe(1);
    expect(resultUpper[0].name).toBe('Woven Sisal Basket Bag');
  });

  it('should return empty array when search query matches nothing', () => {
    const result = filterProducts(products, 'All', 'NonExistentItem999');
    expect(result.length).toBe(0);
  });

  it('should combine category filter and search query correctly', () => {
    const result = filterProducts(products, 'Clothes', 'linen');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Linen Casual Trousers');

    // Searching 'linen' under 'Shoes' should return empty
    const noMatch = filterProducts(products, 'Shoes', 'linen');
    expect(noMatch.length).toBe(0);
  });
});
