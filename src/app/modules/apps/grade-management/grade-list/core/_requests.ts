import axios, { AxiosResponse } from 'axios';
import { ID } from '@metronic/helpers';
import { Grade } from '@interfaces/Grade';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const GET_GRADE_LIST_URL = `${API_URL}/Grades`;

export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<Grade>> => {
  const response: AxiosResponse<PaginatedResponse<Grade>> = await axios.get(
    `${GET_GRADE_LIST_URL}`,
    {
      params: { page_number: page, page_size: pageSize },
    }
  );
  return { ...response.data, pageNumber: page };
};

export const deleteItem = (id: ID): Promise<void> => {
  return axios.delete(`${GET_GRADE_LIST_URL}/${id}`);
};