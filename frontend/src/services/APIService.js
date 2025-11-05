import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getFunction() {
    const response = await axios.get(`${API_URL}/processos`);
    return response.data;
}

// export async function postFunction() {
//     const response = await axios.post(`${API_URL}/processos`, {status: 'Em andamento', numero: 99});
//     return response.data;
// }