import axios, { AxiosResponse } from 'axios';
import { ID } from '@metronic/helpers';
import { Secretary } from '@interfaces/Secretary';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const GET_SECRETARY_LIST_URL = `${API_URL}/api/Secretaries`;

export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<Secretary>> => {
  const response: AxiosResponse<PaginatedResponse<Secretary>> = await axios.get(
    `${GET_SECRETARY_LIST_URL}`,
    {
      params: { PageNumber: page, PageSize: pageSize },
    }
  );
  return { ...response.data, pageNumber: page };
};

export const deleteItem = (id: ID): Promise<void> =>
  axios.delete(`${GET_SECRETARY_LIST_URL}/${id}`);

export const getSecretaries = (): Promise<{ data: PaginatedResponse<Secretary> }> => {
  return axios.get(GET_SECRETARY_LIST_URL, {
    params: { PageNumber: 1, PageSize: 1000 }, // Buscar todas as secretarias
  });
};

export const getItem = (id: ID): Promise<Secretary> =>
  axios.get(`${GET_SECRETARY_LIST_URL}/${id}`).then((response) => response.data);

export const createItem = (item: Partial<Secretary>): Promise<Secretary> =>
  axios.post(`${GET_SECRETARY_LIST_URL}`, item).then((response) => response.data);

export const createSecretary = (item: Partial<Secretary>): Promise<{ data: { id: string } }> =>
  axios.post(`${GET_SECRETARY_LIST_URL}`, item);

export const updateItem = (id: ID, item: Partial<Secretary>): Promise<Secretary> =>
  axios.put(`${GET_SECRETARY_LIST_URL}/${id}`, item).then((response) => response.data);
