import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    switch (status) {
      case 401:
        if (!['/login', '/register'].includes(window.location.pathname)) {
          localStorage.setItem('redirectLoginRequired', '1');
          window.location.href = '/login';
        }
        break;
      case 403:
        if (window.location.pathname !== '/403') {
          localStorage.setItem('redirectForbidden', '1');
          window.location.href = '/403';
        }
        break;
      case 500:
        console.error('500 error:', errorMessage);
        break;
      default:
        console.error(`Request error: ${status} - ${errorMessage}`, error);
    }
    return Promise.reject(error);
  }
);

export default api;