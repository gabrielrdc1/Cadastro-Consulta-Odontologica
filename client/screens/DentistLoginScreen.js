import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../middleware/AuthContext';
import { saveToken, setItem } from '../utils/secureStore';

const DentistLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setToken } = useContext(AuthContext);

  const handleDentistLogin = async () => {
    const payload = {
      email: email,
      password: password,
    };

    try {
      const response = await axiosInstance.post('/login', payload);

      if (response.status === 200) {
        const { token, refreshToken, user } = response.data;

        if (user.type === 'paciente') {
          Alert.alert('Erro', 'Apenas dentistas podem fazer login aqui.');
          return;
        }

        await setItem('authToken', token);
        await setItem('refreshToken', refreshToken);
        await setItem('dentistId', user.dentista_id.toString());
        await setItem('userName', user.dentista_nome);
        setToken(token);
        navigation.navigate('DentistMain');
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

  const handleBack = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/dentista.png')} style={styles.image} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
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
      <TouchableOpacity style={styles.loginButton} onPress={handleDentistLogin}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.voltarButton} onPress={handleBack}>
        <Text style={styles.voltarButtonText}>VOLTAR</Text>
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
    color: '#fff',
    fontWeight: 'bold',
  },
  voltarButton: {
    backgroundColor: '#DC143C',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  voltarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DentistLoginScreen;
