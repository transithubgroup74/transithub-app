import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://transithub-backend-production.up.railway.app/api';

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

/**
 * The server sends { message, code } on a rejection. If there's no response at
 * all we genuinely couldn't reach it — that's the only case worth wording as a
 * connection problem, and it must never be treated as a successful sign-in.
 */
export const errorMessage = (e: any, fallback: string): string => {
  if (e?.response) return e.response.data?.message || fallback;
  return "Couldn't reach TransitHub. Check your internet connection and try again.";
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
  create: (scheduleId: string, seatNumber: number, qrCode?: string) =>
    api.post('/bookings', { scheduleId, seatNumber, qrCode }),
  // Full-detail booking that doesn't need a real schedule (demo/mock buses).
  createCustom: (data: {
    origin: string; destination: string; seatNumber: number; totalAmount: number;
    departsAt?: string; operator?: string; busClass?: string; qrCode?: string; status?: string;
  }) => api.post('/bookings/custom', data),
  getMine: () => api.get('/bookings/my'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  getBookedSeats: (scheduleId: string) => api.get(`/bookings/seats/${scheduleId}`),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
  sendReceipt: (id: string) => api.post(`/bookings/${id}/receipt`),
};

export const profile = {
  get: () => api.get('/profile'),
  update: (data: { name?: string; phone?: string; photoUrl?: string }) =>
    api.put('/profile', data),
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
