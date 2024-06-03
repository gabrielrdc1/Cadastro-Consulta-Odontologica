import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import axiosInstance from '../axiosInstance';

const SelectDateScreen = ({ dentEspId, token, onSelectDate }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horaConsulta, setHoraConsulta] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHorariosDisponiveis = async (date) => {
    try {
      setLoading(true);
      const payload = { data: date };
      const response = await axiosInstance.post('/api/consultas/horario-livres', payload, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 200 && response.data) {
        setHorariosDisponiveis(response.data.available_slots);
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

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    fetchHorariosDisponiveis(day.dateString);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{ [selectedDate]: { selected: true, marked: true } }}
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
            <View>
              <Text style={styles.label}>Horários Disponíveis para {selectedDate}</Text>
              <Picker
                selectedValue={horaConsulta}
                onValueChange={(itemValue) => setHoraConsulta(itemValue)}
              >
                {horariosDisponiveis.map((horario) => (
                  <Picker.Item key={horario} label={horario} value={horario} />
                ))}
              </Picker>
              <Button title="Confirmar" onPress={() => onSelectDate(`${selectedDate} ${horaConsulta}`)} />
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
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default SelectDateScreen;
