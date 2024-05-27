import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ScheduleScreen = () => {
  const [selectedTime, setSelectedTime] = useState(null);
  const times = [
    '09:00 am', '10:00 am', '01:00 pm',
    '02:00 pm', '04:00 pm', '05:00 pm',
    '06:00 pm', '07:00 pm'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.calendar}>
        <Text style={styles.monthText}>September 2020</Text>
        {/* Implemente aqui seu componente de calendário */}
      </View>
      <View style={styles.times}>
        {times.map(time => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeButton,
              selectedTime === time && styles.selectedTimeButton
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text style={styles.timeText}>{time}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>BOOK NOW</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  calendar: {
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  times: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '48%',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  selectedTimeButton: {
    backgroundColor: '#4B0082',
  },
  timeText: {
    color: '#4B0082',
  },
  bookButton: {
    marginTop: 16,
    backgroundColor: '#4B0082',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ScheduleScreen;
