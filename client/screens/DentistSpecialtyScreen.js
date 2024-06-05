import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore';

const DentistSpecialtyScreen = () => {
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
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
          fetchSpecialties(storedToken, storedDentistId);
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

  const fetchSpecialties = async (token, dentistId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/dentista/${dentistId}/especialidades`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        setSpecialties(response.data);
      } if (response.status === 404) {
        setSpecialties([]);
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao buscar especialidades: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao buscar especialidades: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSpecialty = ({ item }) => (
    <View style={styles.specialtyContainer}>
      <Text style={styles.specialtyText}>{`Especialidade: ${item.especializacao_nome}`}</Text>
      <Text style={styles.specialtyText}>{`Tempo: ${item.tempo} minutos`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#DC143C" />
      ) : (
        <FlatList
          data={specialties}
          renderItem={renderSpecialty}
          keyExtractor={(item) => item.dent_espec_id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma especialidade encontrada</Text>}
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
  specialtyContainer: {
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
  specialtyText: {
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

export default DentistSpecialtyScreen;
