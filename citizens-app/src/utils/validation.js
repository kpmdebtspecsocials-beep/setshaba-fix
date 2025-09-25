// Validation utilities for the app

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// Email validation regex
const emailRegex = /\S+@\S+\.\S+/;

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  if (email.includes(' ')) {
    return 'Email cannot contain spaces';
  }
  
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address (e.g., user@example.com)';
  }
  
  return null; // Valid
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z)';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z)';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number (0-9)';
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*()_+[]{}|;:\'",.<>?)';
  }
  
  if (!passwordRegex.test(password)) {
    return 'Password does not meet security requirements';
  }
  
  return null; // Valid
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null; // Valid
};

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 'none', score: 0, color: '#ccc' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /(?=.*[a-z])/.test(password),
    uppercase: /(?=.*[A-Z])/.test(password),
    number: /(?=.*\d)/.test(password),
    special: /(?=.*[@$!%*?&])/.test(password)
  };
  
  Object.values(checks).forEach(check => {
    if (check) score++;
  });
  
  if (score === 5) {
    return { strength: 'strong', score: 5, color: '#4CAF50', checks };
  } else if (score >= 3) {
    return { strength: 'medium', score, color: '#FF9800', checks };
  } else if (score >= 1) {
    return { strength: 'weak', score, color: '#F44336', checks };
  } else {
    return { strength: 'none', score: 0, color: '#ccc', checks };
  }
};