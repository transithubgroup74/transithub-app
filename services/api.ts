import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.20.10.4:8081/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  register: (data: { name: string; email: string; password: string; phone: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const routes = {
  getAll: () => api.get('/routes'),
  search: (origin: string, destination: string) =>
    api.get('/routes/search', { params: { origin, destination } }),
};

export const schedules = {
  search: (routeId: string, date: string) =>
    api.get('/schedules/search', { params: { routeId, date } }),
  getById: (id: string) => api.get(`/schedules/${id}`),
};

export const bookings = {
  create: (scheduleId: string, seatNumber: number) =>
    api.post('/bookings', { scheduleId, seatNumber }),
  getMine: () => api.get('/bookings/my'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  getBookedSeats: (scheduleId: string) => api.get(`/bookings/seats/${scheduleId}`),
};

export const payments = {
  initiate: (bookingId: string, momoReference: string) =>
    api.post('/payments/initiate', { bookingId, momoReference }),
  confirm: (momoReference: string) =>
    api.post('/payments/confirm', { momoReference }),
};

export const tickets = {
  issue: (bookingId: string) => api.post('/tickets/issue', { bookingId }),
  scan: (qrCodeHash: string) => api.post('/tickets/scan', { qrCodeHash }),
};

export default api;
