import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import axiosInstance from '../axiosInstance';
import { getItem } from '../utils/secureStore';

const DentistProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [token, setToken] = useState(null);
  const [dentistId, setDentistId] = useState(null);

  useEffect(() => {
    const fetchTokenAndDentistId = async () => {
      try {
        const storedToken = await getItem('authToken');
        const storedDentistId = await getItem('dentistId');

        if (storedToken && storedDentistId) {
          setToken(storedToken);
          setDentistId(storedDentistId);
          fetchProfile(storedToken, storedDentistId);
        } else {
          Alert.alert('Erro', 'Token ou ID do dentista não encontrado');
          setLoading(false);
        }
      } catch (error) {
        console.error('Falha ao carregar o token ou ID do dentista:', error);
        Alert.alert('Erro', 'Falha ao carregar o token ou ID do dentista');
        setLoading(false);
      }
    };

    fetchTokenAndDentistId();
  }, []);

  const fetchProfile = async (token, dentistId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/dentista/${dentistId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        setProfile(response.data);
      } else {
        Alert.alert('Erro', 'Formato de resposta inesperado');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Erro', `Falha ao buscar perfil: ${error.response.data.error}`);
      } else {
        Alert.alert('Erro', `Falha ao buscar perfil: ${error.message}`);
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
        <View style={styles.profileContainer}>
          <Image source={require('../assets/dentista.png')} style={styles.profileImage} />
          <Text style={styles.profileName}>{profile.nome}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7cc5bd',
    padding: 16,
  },
  profileContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFC0CB',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 18,
    color: '#555',
  },
});

export default DentistProfileScreen;
