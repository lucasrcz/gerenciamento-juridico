import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
export const api = axios.create({baseURL: API_URL});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

// Função de login
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

// Função de logout
export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
};

// Verificar se está autenticado
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};