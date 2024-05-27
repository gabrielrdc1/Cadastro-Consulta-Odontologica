import axios from 'axios';
import { BACKEND_URL } from '@env';

const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
