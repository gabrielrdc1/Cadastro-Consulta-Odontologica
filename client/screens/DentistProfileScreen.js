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
          Alert.alert('Erro', 'Usuário não encontrado');
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
      }
      if (response.status === 404) {
        setProfile({});
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
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
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
    color: '#800080',
  },
  profileEmail: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DentistProfileScreen;
