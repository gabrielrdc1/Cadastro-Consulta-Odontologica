import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../middleware/AuthContext';
import { saveToken } from '../utils/secureStore'; // Importe a função saveToken

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setToken } = useContext(AuthContext);

  const handleLogin = async () => {
    const payload = {
      email: username,
      password: password,
    };

    try {
      const response = await axiosInstance.post('/login', payload);

      if (response.status === 200) {
        const { token, username } = response.data;
        console.log('Token:', token); // Verifique o token no console
        await saveToken('authToken', token); // Armazena o token no armazenamento seguro
        setToken(token); // Armazena o token no contexto
        Alert.alert(`Bem Vindo(a), ${username}!`);
        navigation.navigate('Profile'); // Redireciona para a tela de perfil
      } else {
        Alert.alert('Login Failed', 'Unexpected error occurred');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Login Failed', `Error: ${error.response.data.error}`);
      } else {
        Alert.alert('Login Failed', `Error: ${error.message}`);
      }
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DENTISTRY</Text>
      <Image source={require('../assets/dente.png')} style={styles.image} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#ccc"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#ccc"
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>REGISTER</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#7cc5bd',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 25,
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#FFC0CB',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#8A2BE2',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#800080',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;