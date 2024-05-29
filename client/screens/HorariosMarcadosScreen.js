import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HorariosMarcadosScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Horários Marcados</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HorariosMarcadosScreen;
