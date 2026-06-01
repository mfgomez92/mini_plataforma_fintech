import api from "./api";

export interface User {
    id: string;
    nombre: string;
    email: string;
    saldo: number;
}

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.data;
};
