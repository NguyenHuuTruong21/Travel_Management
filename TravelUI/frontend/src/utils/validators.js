export const validateEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = password =>
  password.length >= 6;

export const validateFullName = fullName =>
  fullName.trim().length > 0;
