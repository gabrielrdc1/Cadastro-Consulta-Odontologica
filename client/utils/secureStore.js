import * as SecureStore from 'expo-secure-store';

export async function saveToken(key, value) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Failed to save the token to the storage', error);
  }
}

export async function getToken(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Failed to fetch the token from storage', error);
  }
}
