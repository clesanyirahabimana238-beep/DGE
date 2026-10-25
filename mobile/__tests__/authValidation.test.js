describe('Authentication Form Validation & Logic', () => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateRegistration = (name, email, password) => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Name is required' };
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return { isValid: false, error: 'A valid email address is required' };
    }
    if (!password || password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long' };
    }
    return { isValid: true, error: null };
  };

  const validateLogin = (email, password) => {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }
    return { isValid: true, error: null };
  };

  it('should accept valid registration inputs', () => {
    const res = validateRegistration('Jean Paul', 'jean.paul@example.rw', 'SecurePass123');
    expect(res.isValid).toBe(true);
    expect(res.error).toBeNull();
  });

  it('should reject empty or whitespace-only name', () => {
    const res = validateRegistration('   ', 'test@test.com', 'password123');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Name is required');
  });

  it('should reject malformed email addresses', () => {
    const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain'];
    invalidEmails.forEach((email) => {
      const res = validateRegistration('User', email, 'password123');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('A valid email address is required');
    });
  });

  it('should reject passwords shorter than 6 characters', () => {
    const res = validateRegistration('User', 'user@example.com', '12345');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('Password must be at least 6 characters long');
  });

  it('should validate login inputs requiring both email and password', () => {
    expect(validateLogin('', 'password').isValid).toBe(false);
    expect(validateLogin('user@example.com', '').isValid).toBe(false);
    expect(validateLogin('user@example.com', 'password').isValid).toBe(true);
  });
});
