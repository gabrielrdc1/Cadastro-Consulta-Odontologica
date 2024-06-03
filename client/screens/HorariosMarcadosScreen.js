import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore';

const HorariosMarcadosScreen = () => {
  const [loading, setLoading] = useState(true);
  const [horariosMarcados, setHorariosMarcados] = useState([]);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchTokenAndUserId = async () => {
      try {
        const storedToken = await getItem('authToken');
        const storedUserId = await getItem('userId');

        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(storedUserId);
        } else {
          Alert.alert('Erro', 'Token ou ID do usuário não encontrado');
          setLoading(false);
        }
      } catch (error) {
        console.error('Falha ao carregar o token ou ID do usuário:', error);
        Alert.alert('Erro', 'Falha ao carregar o token ou ID do usuário');
        setLoading(false);
      }
    };

    fetchTokenAndUserId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (token && userId) {
        fetchHorariosMarcados(token, userId);
      }
    }, [token, userId])
  );

  const fetchHorariosMarcados = async (token, userId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/consulta/${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        setHorariosMarcados(response.data);
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

  const renderHorario = ({ item }) => (
    <View style={styles.horarioContainer}>
      <Text style={styles.horarioText}>{`Data: ${item.data_consulta}`}</Text>
      <Text style={styles.horarioText}>{`Hora: ${item.hora_consulta}`}</Text>
      <Text style={styles.horarioText}>{`Dentista: ${item.dentista}`}</Text>
      <Text style={styles.horarioText}>{`Especialização: ${item.especializacao}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={horariosMarcados}
          renderItem={renderHorario}
          keyExtractor={(item) => item.id.toString()}
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
  horarioContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  horarioText: {
    fontSize: 16,
  },
});

export default HorariosMarcadosScreen;
