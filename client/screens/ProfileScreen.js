// ProfileScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../middleware/AuthContext';
import { jwtDecode } from "jwt-decode";
import { getToken } from '../utils/secureStore';
import base64 from 'react-native-base64';

const ProfileScreen = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const loadTokenAndFetchPacientes = async () => {
      try {
        const storedToken = await getToken('authToken');
        console.log('Stored token:', storedToken);
        if (storedToken) {
          let teste = base64.decode(storedToken);
          const decodedToken = jwtDecode(teste);
          console.log('Decoded token:', decodedToken);
          setPatientId(decodedToken.id);
          fetchPacientes(decodedToken.id, storedToken);
        } else {
          Alert.alert('Error', 'Token não encontrado');
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        Alert.alert('Error', 'Failed to decode token');
        setLoading(false);
      }
    };

    loadTokenAndFetchPacientes();
  }, []);

  const fetchPacientes = async (patientId, authToken) => {
    try {
      console.log('Token being sent:', authToken);
      const response = await axiosInstance.get(`/api/pacientes/${patientId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setPacientes(response.data);
      } else {
        Alert.alert('Error', 'Unexpected response format');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', `Failed to fetch patients: ${error.response.data.error}`);
      } else {
        Alert.alert('Error', `Failed to fetch patients: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPaciente = ({ item }) => (
    <View style={styles.pacienteContainer}>
      <Text style={styles.label}>ID: {item.id}</Text>
      <Text style={styles.label}>Nome: {item.nome}</Text>
      <Text style={styles.label}>CPF: {item.cpf}</Text>
      <Text style={styles.label}>Email: {item.email}</Text>
      <Text style={styles.label}>Data de Criação: {item.data_criacao}</Text>
      <Text style={styles.label}>Ativo: {item.ativo}</Text>
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
      <FlatList
        data={pacientes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPaciente}
        ListEmptyComponent={<Text style={styles.label}>Nenhum paciente encontrado</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  pacienteContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginVertical: 2,
  },
});

export default ProfileScreen;
