import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
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
      } if (response.status === 404) {
        setDentistas([]);
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
        <ActivityIndicator size="large" color="#DC143C" />
      ) : (
        <View style={styles.innerContainer}>
          <Text style={styles.label}>Selecione um Dentista</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dentEspId}
              onValueChange={(itemValue) => setDentEspId(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {dentistas.map((dentista) => (
                <Picker.Item key={dentista.id} label={dentista.dentista} value={dentista.id} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => onSelectDentist(dentEspId)}
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

export default SelectDentistScreen;
