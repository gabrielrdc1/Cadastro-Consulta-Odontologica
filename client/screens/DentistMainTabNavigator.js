import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DentistAppointmentsScreen from './DentistAppointmentsScreen';
import DentistSpecialtyScreen from './DentistSpecialtyScreen';
import DentistProfileScreen from './DentistProfileScreen';

const Tab = createBottomTabNavigator();

const DentistMainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Horários Marcados') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Especialidade') {
            iconName = focused ? 'medkit' : 'medkit-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          display: 'flex',
        },
      })}
    >
      <Tab.Screen name="Horários Marcados" component={DentistAppointmentsScreen} />
      <Tab.Screen name="Especialidade" component={DentistSpecialtyScreen} />
      <Tab.Screen name="Perfil" component={DentistProfileScreen} />
    </Tab.Navigator>
  );
};

export default DentistMainTabNavigator;
