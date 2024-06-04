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
        <ActivityIndicator size="large" color="#DC143C" />
      ) : (
        <FlatList
          data={horariosMarcados}
          renderItem={renderHorario}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum horário marcado</Text>}
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
  horarioContainer: {
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
  horarioText: {
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

export default HorariosMarcadosScreen;
