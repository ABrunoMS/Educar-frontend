import axios, { AxiosResponse } from "axios";
import { ID, Response } from '@metronic/helpers'
import { ClientType } from '@interfaces/Client'
import { PaginatedResponse } from "@contexts/PaginationContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const CLIENTS_URL = `${API_URL}/api/Clients`; // URL correta para o endpoint de clientes

// Tipo de resposta para a lista de clientes
export type ClientsQueryResponse = PaginatedResponse<ClientType>;

// Função para buscar a lista de clientes com paginação, ordenação e filtros
export const getList = async (
  PageNumber: number,
  PageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<ClientsQueryResponse> => {
  const response: AxiosResponse<ClientsQueryResponse> = await axios.get(CLIENTS_URL, {
    params: { PageNumber, PageSize, sortBy, sortOrder, filter, search },
  });
  return response.data;
};

// Como este arquivo é específico para a listagem, as funções de criação,
// atualização e exclusão podem ser movidas para outros arquivos, como
// um `_requests.ts` na pasta `client-create`.

// No entanto, se você precisar delas aqui, a implementação seria:
export const deleteClient = (clientId: ID): Promise<void> => {
  return axios.delete(`${CLIENTS_URL}/${clientId}`).then(() => {});
};

export const deleteSelectedClients = (clientIds: Array<ID>): Promise<void> => {
  const requests = clientIds.map((id) => axios.delete(`${CLIENTS_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

export const createClient = (client: ClientType): Promise<ClientType> => {
  return axios.post<ClientType>(CLIENTS_URL, client).then((response) => response.data);
};

export const updateClient = (client: ClientType): Promise<ClientType> => {
  return axios.put<ClientType>(`${CLIENTS_URL}/${client.id}`, client).then((response) => response.data);
};