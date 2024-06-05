import React, { useState, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../middleware/AuthContext';
import { TextInputMask } from 'react-native-masked-text';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setToken } = useContext(AuthContext);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validateCpf = (cpf) => {
    const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return cpfPattern.test(cpf);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleRegister = async () => {
    if (!validateCpf(cpf)) {
      Alert.alert('Dados incorretos', 'CPF está incorreto');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Dados incorretos', 'Email está incorreto');
      return;
    }

    const formattedCpf = cpf.replace(/[^\d]/g, '');

    const payload = {
      paciente_nome: name,
      cpf: formattedCpf,
      email: email,
      password: password,
    };

    try {
      const response = await axiosInstance.post('/api/pacientes', payload);
      if (response.status === 201) {
        Alert.alert('Cadastro realizado com sucesso');
        navigation.replace('Login');
      } else if (response.status === 400) {
        Alert.alert('Erro', 'CPF ou email já cadastrado');
      } else {
        Alert.alert('Falha no cadastro');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Falha no cadastro', `Erro: ${error.response.data.error}`);
      } else {
        Alert.alert('Falha no cadastro', `Erro: ${error.message}`);
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholderTextColor="#ccc"
      />
      <TextInputMask
        type={'cpf'}
        value={cpf}
        onChangeText={setCpf}
        style={styles.input}
        placeholder="CPF"
        keyboardType="numeric"
        placeholderTextColor="#ccc"
      />
      <TextInput
        ref={emailRef}
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#ccc"
      />
      <TextInput
        ref={passwordRef}
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#ccc"
        onSubmitEditing={handleRegister}
      />
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>REGISTRAR</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#4B0082',
  },
  input: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#800080',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#FF00FF',
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
