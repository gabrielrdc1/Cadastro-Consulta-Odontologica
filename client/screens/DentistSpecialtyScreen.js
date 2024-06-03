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
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={specialties}
          renderItem={renderSpecialty}
          keyExtractor={(item) => item.dent_espec_id.toString()}
          ListEmptyComponent={<Text>Nenhuma especialidade encontrada</Text>}
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
  specialtyContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  specialtyText: {
    fontSize: 16,
  },
});

export default DentistSpecialtyScreen;
