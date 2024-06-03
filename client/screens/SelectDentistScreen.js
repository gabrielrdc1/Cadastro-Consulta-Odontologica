import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore';

const SelectDentistScreen = ({ especializacaoId, onSelectDentist }) => {
  const [dentistas, setDentistas] = useState([]);
  const [dentEspId, setDentEspId] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadTokenAndFetchData = async () => {
      try {
        const storedToken = await getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          fetchDentistasPorEspecializacao(storedToken);
        } else {
          Alert.alert('Erro', 'Token não encontrado');
          setLoading(false);
        }
      } catch (error) {
        console.error('Falha ao carregar o token:', error);
        Alert.alert('Erro', 'Falha ao carregar o token');
        setLoading(false);
      }
    };

    loadTokenAndFetchData();
  }, []);

  const fetchDentistasPorEspecializacao = async (token) => {
    try {
      const response = await axiosInstance.get(`/api/dentista-especializacao/${especializacaoId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      if (response.status === 200 && response.data) {
        setDentistas(response.data);
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao buscar dentistas: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao buscar dentistas: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <Text style={styles.label}>Selecione um Dentista</Text>
          <Picker
            selectedValue={dentEspId}
            onValueChange={(itemValue) => setDentEspId(itemValue)}
          >
            {dentistas.map((dentista) => (
              <Picker.Item key={dentista.id} label={dentista.dentista} value={dentista.id} />
            ))}
          </Picker>
          <Button title="Próximo" onPress={() => onSelectDentist(dentEspId)} />
        </View>
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
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default SelectDentistScreen;
