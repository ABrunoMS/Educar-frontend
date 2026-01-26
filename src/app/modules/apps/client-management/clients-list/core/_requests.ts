import axios, { AxiosResponse } from "axios";
import { ID, Response } from '@metronic/helpers'
import { ClientType } from '@interfaces/Client'
import { PaginatedResponse } from "@contexts/PaginationContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const CLIENTS_URL = `${API_URL}/api/Clients`; // URL correta para o endpoint de 


export interface ProductDto {
  id: string 
  name: string
}

export interface ContentDto {
  id: string 
  name: string
}


export const getAllProducts = (): Promise<PaginatedResponse<ProductDto>> => {
  return axios
    .get<PaginatedResponse<ProductDto>>(`${API_URL}/api/Products?pageNumber=1&pageSize=9999`)
    .then((response: AxiosResponse<PaginatedResponse<ProductDto>>) => response.data);
}

export const getCompatibleContents = (productId: string): Promise<ContentDto[]> => {
  return axios
    .get<ContentDto[]>(`${API_URL}/api/Products/${productId}/contents`)
    .then((response: AxiosResponse<ContentDto[]>) => response.data);
}


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
  console.log('📡 API Request - Params:', { PageNumber, PageSize, search });
  const response: AxiosResponse<ClientsQueryResponse> = await axios.get(CLIENTS_URL, {
    params: { 
      PageNumber, 
      PageSize, 
      search 
    },
  });
  console.log('📥 API Response - Total items:', response.data?.payload?.pagination?.totalCount);
  return response.data;
};


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

export const getClientById = (clientId: ID): Promise<ClientType> => {
  return axios.get<ClientType>(`${CLIENTS_URL}/${clientId}`).then((response) => response.data);
};