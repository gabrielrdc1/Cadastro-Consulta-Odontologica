import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import axiosInstance from '../axiosInstance';
import SelectSpecialtyScreen from './SelectSpecialtyScreen';
import SelectDentistScreen from './SelectDentistScreen';
import SelectDateScreen from './SelectDateScreen';
import { getItem } from '../utils/secureStore';

const HomeScreen = () => {
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [especializacaoId, setEspecializacaoId] = useState('');
  const [dentId, setDentId] = useState('');
  const [dentEspId, setDentEspId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [horaConsulta, setHoraConsulta] = useState('');
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
          Alert.alert('Erro', 'Usuário não encontrado');
        }
      } catch (error) {
        console.error('Falha ao carregar o token ou ID do usuário:', error);
        Alert.alert('Erro', 'Falha ao carregar o token ou ID do usuário');
      }
    };

    fetchTokenAndUserId();
  }, []);

  const handleNextStage = async (data) => {
    if (stage === 1) {
      setEspecializacaoId(data);
      setStage(2);
    } else if (stage === 2) {
      setDentId(data);
      setStage(3);
    } else if (stage === 3) {
      const [date, time] = data.split(' ');
      const formattedDate = date; 
      const formattedTime = `${time}:00`; 
      setSelectedDate(formattedDate);
      setHoraConsulta(formattedTime);
      await handleDentEspecId(especializacaoId, dentId, formattedDate, formattedTime);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleDentEspecId = async (especializacaoId, dentId, date, time) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/especializacao/${especializacaoId}/dentista/${dentId}`, {
        headers: {
          Authorization: `${token}`
        }
      });

      if (response.status === 200) {
        setDentEspId(response.data.dent_espec_id);
        handleCreateConsulta(response.data.dent_espec_id, date, time);
      } else {
        Alert.alert('Erro', 'Erro ao buscar a especialização do dentista');
      }
    } catch (error) {
      console.error('Erro ao buscar especialização do dentista:', error);
      Alert.alert('Erro', 'Erro ao buscar a especialização do dentista');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateConsulta = async (dentEspId, date, time) => {
    if (!userId || !dentEspId || !date || !time) {
      Alert.alert('Erro', 'Dados incompletos para agendamento.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        paciente_id: userId,
        dent_esp_id: dentEspId,
        data_consulta: date,
        hora_consulta: time,
      };

      const response = await axiosInstance.post('/api/consulta', payload, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 201) {
        setStage(4);
      } else {
        Alert.alert('Erro', 'Erro ao agendar a consulta');
      }
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      if (error.response) {
        Alert.alert('Erro', `Erro ao criar consulta: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', 'Erro ao criar consulta');
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
        <>
          {stage === 1 && <SelectSpecialtyScreen onSelectSpecialty={handleNextStage} />}
          {stage === 2 && <SelectDentistScreen especializacaoId={especializacaoId} onSelectDentist={handleNextStage} />}
          {stage === 3 && <SelectDateScreen dentEspId={dentEspId} token={token} onSelectDate={handleNextStage} />}
          {stage === 4 && (
            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationText}>Consulta agendada para {formatDate(selectedDate)} às {horaConsulta}!</Text>
              <TouchableOpacity style={styles.button} onPress={() => setStage(1)}>
                <Text style={styles.buttonText}>Voltar ao Início</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
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
  confirmationContainer: {
    alignItems: 'center',
  },
  confirmationText: {
    fontSize: 30,
    marginBottom: 20,
    color: '#080000',
    textAlign: 'center',
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

export default HomeScreen;
