import axios from 'axios';
import { ClientType } from '@interfaces/Client';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const CLIENTS_URL = `${API_URL}/api/Clients`;

export const getClients = (): Promise<{ data: PaginatedResponse<ClientType> }> => {
  return axios.get(CLIENTS_URL, {
    params: { PageNumber: 1, PageSize: 1000 }, // Buscar todos os clientes
  });
};

export const getClientById = (id: string): Promise<{ data: ClientType }> => {
  return axios.get(`${CLIENTS_URL}/${id}`);
};
