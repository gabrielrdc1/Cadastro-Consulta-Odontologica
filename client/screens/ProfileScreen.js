import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image, Button } from 'react-native';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore'; 

const ProfileScreen = () => {
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadTokenAndFetchPaciente = async () => {
      try {
        const token = await getItem('authToken');
        const storedUserId = await getItem('userId');

        if (token && storedUserId) {
          setUserId(storedUserId);
          fetchPaciente(storedUserId, token);
        } else {
          Alert.alert('Erro', 'Token ou ID do usuário não encontrado');
          setLoading(false);
        }
      } catch (error) {
        console.error('Falha ao carregar o token:', error);
        Alert.alert('Erro', 'Falha ao carregar o token');
        setLoading(false);
      }
    };

    loadTokenAndFetchPaciente();
  }, []);

  const fetchPaciente = async (userId, token) => {
    try {
      const response = await axiosInstance.get(`/api/paciente/${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        setPaciente(response.data);
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao buscar paciente: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao buscar paciente: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPaciente = (paciente) => (
    <View style={styles.pacienteContainer}>
      <Image 
        source={require('../assets/usuario.png')}
        style={styles.profileImage} 
      />
      <Text style={styles.name}>{paciente.nome}</Text>
      <Text style={styles.label}>ID: {paciente.id}</Text>
      <Text style={styles.label}>CPF: {paciente.cpf}</Text>
      <Text style={styles.label}>Email: {paciente.email}</Text>
      <Text style={styles.label}>Data de Criação: {paciente.data_criacao}</Text>
      <Text style={styles.label}>Ativo: {paciente.ativo}</Text>
      <Button
        title="Editar Perfil"
        onPress={() => Alert.alert('Editar Perfil', 'Funcionalidade em desenvolvimento')}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {paciente ? (
        renderPaciente(paciente)
      ) : (
        <Text style={styles.label}>Nenhum paciente encontrado</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  pacienteContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center', // Center the content
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
});

export default ProfileScreen;
