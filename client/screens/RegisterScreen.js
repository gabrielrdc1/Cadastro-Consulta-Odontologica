import React, { useState, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../middleware/AuthContext';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setToken } = useContext(AuthContext);

  const cpfRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleRegister = async () => {
    const payload = {
      paciente_nome: name,
      cpf: cpf,
      email: email,
      password: password,
    };

    try {
      const response = await axiosInstance.post('/api/pacientes', payload);

      if (response.status === 201) {
        Alert.alert('Cadastro realizado com sucesso');
        navigation.replace('Login');
      } if (response.status === 400) {
        Alert.alert('Erro', 'CPF ou email já cadastrado');
      }
      else {
        Alert.alert('Registration Failed');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Registration Failed', `Error: ${error.response.data.error}`);
      } else {
        Alert.alert('Registration Failed', `Error: ${error.message}`);
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
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholderTextColor="#ccc"
        onSubmitEditing={() => cpfRef.current.focus()}
      />
      <TextInput
        ref={cpfRef}
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
        placeholderTextColor="#ccc"
        onSubmitEditing={() => emailRef.current.focus()}
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
        onSubmitEditing={() => passwordRef.current.focus()}
      />
      <TextInput
        ref={passwordRef}
        style={styles.input}
        placeholder="Password"
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
