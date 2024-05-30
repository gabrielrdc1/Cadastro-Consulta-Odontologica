import axios from 'axios';
import { BACKEND_URL } from '@env';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.28.44:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
