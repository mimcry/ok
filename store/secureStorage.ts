import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth-token';

export const saveToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('🔐 Error saving token:', error);
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('🔐 Error getting token:', error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('🔐 Error clearing token:', error);
  }
};
