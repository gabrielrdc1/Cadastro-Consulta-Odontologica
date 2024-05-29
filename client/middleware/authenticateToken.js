import AsyncStorage from '@react-native-async-storage/async-storage';

const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('@userToken', token);
  } catch (e) {
    console.error('Failed to save the token to the storage', e);
  }
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@userToken');
  } catch (e) {
    console.error('Failed to fetch the token from storage', e);
  }
};
