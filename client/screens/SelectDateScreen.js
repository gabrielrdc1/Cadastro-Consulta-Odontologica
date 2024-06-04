import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
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

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const renderDay = (day) => {
    const dayOfWeek = new Date(day.dateString).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return <View style={styles.hiddenDay} />;
    }
    return (
      <TouchableOpacity onPress={() => handleDayPress(day)} style={styles.dayContainer}>
        <Text style={styles.dayText}>{day.day}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#DC143C" />
      ) : (
        <View style={styles.innerContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{ [selectedDate]: { selected: true, marked: true } }}
              theme={{
                selectedDayBackgroundColor: '#800080',
                todayTextColor: '#DC143C',
                dotColor: '#800080',
                selectedDotColor: '#ffffff',
                arrowColor: '#DC143C',
                monthTextColor: '#800080',
              }}
              dayComponent={({ date, state }) => renderDay(date)}
            />
          </View>
          {selectedDate && (
            <View>
              <Text style={styles.label}>Horários Disponíveis para {formatDate(selectedDate)}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={horaConsulta}
                  onValueChange={(itemValue) => setHoraConsulta(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {horariosDisponiveis.map((horario) => (
                    <Picker.Item key={horario} label={horario} value={horario} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => onSelectDate(`${selectedDate} ${horaConsulta}`)}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
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
    padding: 0,
    backgroundColor: '#7cc5bd',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  calendarContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#080000',
    padding: 5,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
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
    marginTop: 13,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16, 
    overflow: 'hidden', 
  },
  dayText: {
    color: '#000',
    fontSize: 16,
  },
  hiddenDay: {
    width: 32,
    height: 32,
    backgroundColor: 'transparent',
  },
});

export default SelectDateScreen;
