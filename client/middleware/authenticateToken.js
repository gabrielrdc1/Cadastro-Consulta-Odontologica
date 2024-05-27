import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para armazenar o token
const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('@userToken', token);
  } catch (e) {
    console.error('Failed to save the token to the storage', e);
  }
};

// Função para recuperar o token
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@userToken');
  } catch (e) {
    console.error('Failed to fetch the token from storage', e);
  }
};
