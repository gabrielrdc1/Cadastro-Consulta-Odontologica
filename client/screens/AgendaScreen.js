import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore';

const AgendaScreen = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [pacienteId, setPacienteId] = useState('');
  const [especializacaoId, setEspecializacaoId] = useState('');
  const [dentEspId, setDentEspId] = useState('');
  const [horaConsulta, setHoraConsulta] = useState('');
  const [especializacoes, setEspecializacoes] = useState([]);
  const [dentistas, setDentistas] = useState([]);
  const [stage, setStage] = useState(1); 

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
          Authorization: `eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkNjE3N2E5Mjg2ZDI1Njg0NTI2OWEzMTM2ZDNmNjY0MjZhNGQ2NDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcHJvamV0by10ZXN0ZS1hNTk0NSIsImF1ZCI6InByb2pldG8tdGVzdGUtYTU5NDUiLCJhdXRoX3RpbWUiOjE3MTcwMjcwMTIsInVzZXJfaWQiOiJXSHRqVTdCTU1WV0RJbU1KbTdKQWZRdnowbGQyIiwic3ViIjoiV0h0alU3Qk1NVldESW1NSm03SkFmUXZ6MGxkMiIsImlhdCI6MTcxNzAyNzAxMiwiZXhwIjoxNzE3MDMwNjEyLCJlbWFpbCI6InZpY3RvckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidmljdG9yQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.vExusAod10TQCGNsRVRh0T5iirxETABS75xWwZ3VChM3QenKd-DWEt51dqHQkNHyDPem2JgnHgDSuUhk_dJ5t35a2IDJNJIKhun6D46BES2w084XDEIXGVDuCsc31jUvBLM7ciuEMrNIAKKY275a5Vfa4txRzN5znSzRZu9Yp3u8-l3ChHgrRll-hyPi8tFDNTTxMl313aBHZjR1d_hcpGGDl4osuOm8gG5PpLgvbvY8ieTZ_oIyqOvTJWYGSlPfFEYGndPIbsi3si5Bshd100eZcprqYBrrrDFhSfqvgL-tQitwPv_QYF5JFKGpdCEM-ADrOzc2hJAeSNJKwbaTjQ`,
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

  const fetchDentistasPorEspecializacao = async (especializacaoId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/dentista-especializacao/${especializacaoId}`, {
        headers: {
          Authorization: `eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkNjE3N2E5Mjg2ZDI1Njg0NTI2OWEzMTM2ZDNmNjY0MjZhNGQ2NDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcHJvamV0by10ZXN0ZS1hNTk0NSIsImF1ZCI6InByb2pldG8tdGVzdGUtYTU5NDUiLCJhdXRoX3RpbWUiOjE3MTcwMjcwMTIsInVzZXJfaWQiOiJXSHRqVTdCTU1WV0RJbU1KbTdKQWZRdnowbGQyIiwic3ViIjoiV0h0alU3Qk1NVldESW1NSm03SkFmUXZ6MGxkMiIsImlhdCI6MTcxNzAyNzAxMiwiZXhwIjoxNzE3MDMwNjEyLCJlbWFpbCI6InZpY3RvckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidmljdG9yQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.vExusAod10TQCGNsRVRh0T5iirxETABS75xWwZ3VChM3QenKd-DWEt51dqHQkNHyDPem2JgnHgDSuUhk_dJ5t35a2IDJNJIKhun6D46BES2w084XDEIXGVDuCsc31jUvBLM7ciuEMrNIAKKY275a5Vfa4txRzN5znSzRZu9Yp3u8-l3ChHgrRll-hyPi8tFDNTTxMl313aBHZjR1d_hcpGGDl4osuOm8gG5PpLgvbvY8ieTZ_oIyqOvTJWYGSlPfFEYGndPIbsi3si5Bshd100eZcprqYBrrrDFhSfqvgL-tQitwPv_QYF5JFKGpdCEM-ADrOzc2hJAeSNJKwbaTjQ`,
        }
      });
      console.log(response);

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

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/consultas', {
        headers: {
          Authorization: `eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkNjE3N2E5Mjg2ZDI1Njg0NTI2OWEzMTM2ZDNmNjY0MjZhNGQ2NDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcHJvamV0by10ZXN0ZS1hNTk0NSIsImF1ZCI6InByb2pldG8tdGVzdGUtYTU5NDUiLCJhdXRoX3RpbWUiOjE3MTcwMjcwMTIsInVzZXJfaWQiOiJXSHRqVTdCTU1WV0RJbU1KbTdKQWZRdnowbGQyIiwic3ViIjoiV0h0alU3Qk1NVldESW1NSm03SkFmUXZ6MGxkMiIsImlhdCI6MTcxNzAyNzAxMiwiZXhwIjoxNzE3MDMwNjEyLCJlbWFpbCI6InZpY3RvckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidmljdG9yQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.vExusAod10TQCGNsRVRh0T5iirxETABS75xWwZ3VChM3QenKd-DWEt51dqHQkNHyDPem2JgnHgDSuUhk_dJ5t35a2IDJNJIKhun6D46BES2w084XDEIXGVDuCsc31jUvBLM7ciuEMrNIAKKY275a5Vfa4txRzN5znSzRZu9Yp3u8-l3ChHgrRll-hyPi8tFDNTTxMl313aBHZjR1d_hcpGGDl4osuOm8gG5PpLgvbvY8ieTZ_oIyqOvTJWYGSlPfFEYGndPIbsi3si5Bshd100eZcprqYBrrrDFhSfqvgL-tQitwPv_QYF5JFKGpdCEM-ADrOzc2hJAeSNJKwbaTjQ`,
        },
      });

      if (response.status === 200 && response.data) {
        const consultas = response.data;
        const marked = {};
        consultas.forEach(consulta => {
          marked[consulta.data_consulta] = { marked: true, dotColor: 'red' };
        });
        setMarkedDates(marked);
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao buscar consultas: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao buscar consultas: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEspecializacaoChange = (value) => {
    setEspecializacaoId(value);
    fetchDentistasPorEspecializacao(value);
    setStage(2);
  };

  const handleDentistaChange = (value) => {
    setDentEspId(value);
    fetchConsultas();
    setStage(3);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Erro', 'Token de autenticação não disponível');
      return;
    }

    const consultaData = {
      paciente_id: pacienteId,
      dent_esp_id: dentEspId,
      data_consulta: selectedDate,
      hora_consulta: horaConsulta,
    };

    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/consulta', consultaData, {
        headers: {
          Authorization: `eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkNjE3N2E5Mjg2ZDI1Njg0NTI2OWEzMTM2ZDNmNjY0MjZhNGQ2NDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcHJvamV0by10ZXN0ZS1hNTk0NSIsImF1ZCI6InByb2pldG8tdGVzdGUtYTU5NDUiLCJhdXRoX3RpbWUiOjE3MTcwMjcwMTIsInVzZXJfaWQiOiJXSHRqVTdCTU1WV0RJbU1KbTdKQWZRdnowbGQyIiwic3ViIjoiV0h0alU3Qk1NVldESW1NSm03SkFmUXZ6MGxkMiIsImlhdCI6MTcxNzAyNzAxMiwiZXhwIjoxNzE3MDMwNjEyLCJlbWFpbCI6InZpY3RvckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidmljdG9yQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.vExusAod10TQCGNsRVRh0T5iirxETABS75xWwZ3VChM3QenKd-DWEt51dqHQkNHyDPem2JgnHgDSuUhk_dJ5t35a2IDJNJIKhun6D46BES2w084XDEIXGVDuCsc31jUvBLM7ciuEMrNIAKKY275a5Vfa4txRzN5znSzRZu9Yp3u8-l3ChHgrRll-hyPi8tFDNTTxMl313aBHZjR1d_hcpGGDl4osuOm8gG5PpLgvbvY8ieTZ_oIyqOvTJWYGSlPfFEYGndPIbsi3si5Bshd100eZcprqYBrrrDFhSfqvgL-tQitwPv_QYF5JFKGpdCEM-ADrOzc2hJAeSNJKwbaTjQ`,
        },
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Consulta criada com sucesso');
        // Atualiza as datas marcadas após a criação da consulta
        fetchConsultas();
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao criar consulta: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao criar consulta: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {stage === 1 && (
        <View>
          <Text style={styles.label}>Selecione uma Especialização</Text>
          <Picker
            selectedValue={especializacaoId}
            onValueChange={(itemValue) => handleEspecializacaoChange(itemValue)}
          >
            {especializacoes.map((especializacao) => (
              <Picker.Item key={especializacao.id} label={especializacao.nome} value={especializacao.id} />
            ))}
          </Picker>
        </View>
      )}
      {stage === 2 && (
        <View>
          <Text style={styles.label}>Selecione um Dentista</Text>
          <Picker
            selectedValue={dentEspId}
            onValueChange={(itemValue) => handleDentistaChange(itemValue)}
          >
            {dentistas.map((dentista) => (
              <Picker.Item key={dentista.id} label={dentista.nome} value={dentista.id} />
            ))}
          </Picker>
        </View>
      )}
      {stage === 3 && (
        <View>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#00adf5',
              todayTextColor: '#00adf5',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: 'orange',
              monthTextColor: 'purple',
            }}
          />
          {selectedDate && (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Agendar Consulta para: {selectedDate}</Text>
              <TextInput
                style={styles.input}
                placeholder="Paciente ID"
                value={pacienteId}
                onChangeText={setPacienteId}
              />
              <TextInput
                style={styles.input}
                placeholder="Hora da Consulta"
                value={horaConsulta}
                onChangeText={setHoraConsulta}
              />
              <Button title="Agendar Consulta" onPress={handleSubmit} disabled={loading} />
              {loading && <ActivityIndicator size="large" color="#0000ff" />}
            </View>
          )}
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
  formContainer: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default AgendaScreen;
