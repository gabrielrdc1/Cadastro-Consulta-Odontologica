import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore';

const DentistAppointmentsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [token, setToken] = useState(null);
  const [dentistId, setDentistId] = useState(null);

  useEffect(() => {
    const fetchTokenAndDentistId = async () => {
      try {
        const storedToken = await getItem('authToken');
        const storedDentistId = await getItem('dentistId');

        if (storedToken && storedDentistId) {
          setToken(storedToken);
          setDentistId(storedDentistId);
        } else {
          Alert.alert('Erro', 'Usuário não encontrado');
          setLoading(false);
        }
      } catch (error) {
        console.error('Falha ao carregar o token ou ID do dentista:', error);
        Alert.alert('Erro', 'Falha ao carregar o token ou ID do dentista');
        setLoading(false);
      }
    };

    fetchTokenAndDentistId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (token && dentistId) {
        fetchAppointments(token, dentistId);
      }
    }, [token, dentistId])
  );

  const fetchAppointments = async (token, dentistId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/dentista/${dentistId}/agendamentos`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        const data = response.data.map((item, index) => ({ ...item, key: index.toString() }));
        setAppointments(data);
      } 
      if (response.status === 404) {
        setAppointments([]);
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao buscar horários: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao buscar horários: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentContainer}>
      <Text style={styles.appointmentText}>{`Data: ${item.data_consulta}`}</Text>
      <Text style={styles.appointmentText}>{`Hora: ${item.hora_consulta}`}</Text>
      <Text style={styles.appointmentText}>{`Paciente: ${item.usuario}`}</Text>
      <Text style={styles.appointmentText}>{`Especialização: ${item.especializacao}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.key}
          ListEmptyComponent={<Text style={styles.emptyText}> Nenhum horário marcado</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#7cc5bd',
  },
  appointmentContainer: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderLeftWidth: 5,
    borderLeftColor: '#800080',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  appointmentText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#DC143C',
    marginTop: 20,
  },
});

export default DentistAppointmentsScreen;
