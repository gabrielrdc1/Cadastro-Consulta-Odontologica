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
          Alert.alert('Erro', 'Token ou ID do dentista não encontrado');
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
        setAppointments(response.data);
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
      <Text style={styles.appointmentText}>{`Paciente ID: ${item.paciente_id}`}</Text>
      <Text style={styles.appointmentText}>{`Especialização ID: ${item.dent_esp_id}`}</Text>
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
          keyExtractor={(item) => item.agenda_id.toString()}
          ListEmptyComponent={<Text>Nenhum horário marcado</Text>}
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
  },
  appointmentContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  appointmentText: {
    fontSize: 16,
  },
});

export default DentistAppointmentsScreen;
