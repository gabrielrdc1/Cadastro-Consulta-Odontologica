import axios from 'axios';
import { BACKEND_URL } from '@env';

const axiosInstance = axios.create({
  baseURL: 'https://cadastro-consulta-odontologica-svbq.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
