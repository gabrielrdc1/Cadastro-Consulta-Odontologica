import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore';

const SelectSpecialtyScreen = ({ onSelectSpecialty }) => {
  const [especializacoes, setEspecializacoes] = useState([]);
  const [especializacaoId, setEspecializacaoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadTokenAndFetchData = async () => {
      try {
        const storedToken = await getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          fetchEspecializacoes(storedToken);
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

  const fetchEspecializacoes = async (token) => {
    try {
      const response = await axiosInstance.get('/api/especializacoes', {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        setEspecializacoes(response.data);
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao buscar especializações: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao buscar especializações: ${error.message}`);
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
          <Text style={styles.label}>Selecione uma Especialização</Text>
          <Picker
            selectedValue={especializacaoId}
            onValueChange={(itemValue) => setEspecializacaoId(itemValue)}
          >
            {especializacoes.map((especializacao) => (
              <Picker.Item key={especializacao.id} label={especializacao.nome} value={especializacao.id} />
            ))}
          </Picker>
          <Button title="Próximo" onPress={() => onSelectSpecialty(especializacaoId)} />
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

export default SelectSpecialtyScreen;
