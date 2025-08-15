import axios, { AxiosResponse } from 'axios';
import { ID } from '@metronic/helpers';
import { Address } from '@interfaces/Address';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const GET_ADDRESS_LIST_URL = `${API_URL}/api/Addresses`;

export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<Address>> => {
  const response: AxiosResponse<PaginatedResponse<Address>> = await axios.get(
    `${GET_ADDRESS_LIST_URL}`,
    {
      params: { PageNumber: page, PageSize: pageSize },
    }
  );
  return { ...response.data, pageNumber: page };
};

export const deleteItem = (id: ID): Promise<void> =>
  axios.delete(`${GET_ADDRESS_LIST_URL}/${id}`);

export const getAddresses = (): Promise<{ data: PaginatedResponse<Address> }> => {
  return axios.get(GET_ADDRESS_LIST_URL, {
    params: { PageNumber: 1, PageSize: 1000 }, // Buscar todos os endereços
  });
};

export const getItem = (id: ID): Promise<Address> =>
  axios.get(`${GET_ADDRESS_LIST_URL}/${id}`).then((response) => response.data);

export const createItem = (item: Partial<Address>): Promise<Address> =>
  axios.post(`${GET_ADDRESS_LIST_URL}`, item).then((response) => response.data);

export const updateItem = (id: ID, item: Partial<Address>): Promise<Address> =>
  axios.put(`${GET_ADDRESS_LIST_URL}/${id}`, item).then((response) => response.data);
