import bcrypt from 'bcryptjs';
import { User } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set a fallback for random number generation
// @ts-ignore
bcrypt.setRandomFallback((len) => {
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  return buf;
});

// Constants
const USER_STORAGE_KEY = '@finance_tracker:user';
const SALT_ROUNDS = 10;

// Encrypt password
export const encryptPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Save user to storage
export const saveUserToStorage = async (user: User): Promise<void> => {
  try {
    const userWithoutPassword = { ...user };
    // @ts-ignore
    delete userWithoutPassword.password; // Don't store password in AsyncStorage

    await AsyncStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(userWithoutPassword)
    );
  } catch (error) {
    console.error('Error saving user to storage:', error);
    throw error;
  }
};

// Get user from storage
export const getUserFromStorage = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

// Remove user from storage (logout)
export const removeUserFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing user from storage:', error);
    throw error;
  }
};
