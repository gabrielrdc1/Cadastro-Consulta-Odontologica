import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
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
      } if (response.status === 404) {
        setEspecializacoes([]);
      }
      else {
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
        <ActivityIndicator size="large" color="#DC143C" />
      ) : (
        <View style={styles.innerContainer}>
          <Text style={styles.label}>Selecione uma Especialização</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={especializacaoId}
              onValueChange={(itemValue) => setEspecializacaoId(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {especializacoes.map((especializacao) => (
                <Picker.Item key={especializacao.id} label={especializacao.nome} value={especializacao.id} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => onSelectSpecialty(especializacaoId)}
          >
            <Text style={styles.buttonText}>Próximo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 0,
    backgroundColor: '#7cc5bd',
  },
  innerContainer: {
    padding: 16,
    backgroundColor: '#7cc5bd',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#080000',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  pickerItem: {
    fontSize: 16,
    color: '#800080', 
  },
  button: {
    backgroundColor: '#800080',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SelectSpecialtyScreen;
