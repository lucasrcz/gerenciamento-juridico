import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'multipart/form-data' }
});

export async function getFunction() {
    const response = await api.get(`/processos`);
    return response.data;
}

export async function postFunction() {
    const response = await api.post(`/processos`, {
        numero: "12345/2024",
        status: "EM_ANDAMENTO",
        observacoes: "Teste via frontend",
        estado: "SP"
    });
    return response.data;
}