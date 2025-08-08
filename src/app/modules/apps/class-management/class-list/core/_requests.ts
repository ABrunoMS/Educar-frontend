import axios, { AxiosResponse } from 'axios';
import { ID } from '@metronic/helpers';
import { Class } from '@interfaces/Class';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const GET_CLASS_LIST_URL = `${API_URL}/Classes`;

export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<Class>> => {
  const response: AxiosResponse<PaginatedResponse<Class>> = await axios.get(
    `${GET_CLASS_LIST_URL}`,
    {
      params: { page_number: page, page_size: pageSize },
    }
  );
  return { ...response.data, pageNumber: page };
};

export const deleteItem = (id: ID): Promise<void> => {
  return axios.delete(`${GET_CLASS_LIST_URL}/${id}`);
};