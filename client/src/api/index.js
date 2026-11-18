import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not on login page, can handle redirect or dispatch event
    return Promise.reject(error);
  }
);

export default api;

