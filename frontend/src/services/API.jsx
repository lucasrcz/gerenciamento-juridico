import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
export const api = axios.create({baseURL: API_URL});

const TEMP_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJKdXJpcy1BUEkiLCJzdWIiOiIwMDAwMDAwMDAwMCIsImV4cCI6MTc2ODE4Nzc4Nn0.j04PnoqjZi9J5MMeuiUeJ6yqRNUOa37N18ka7-coA0E";

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || TEMP_TOKEN;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);