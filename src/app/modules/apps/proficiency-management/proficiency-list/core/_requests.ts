import axios, { AxiosResponse } from 'axios';
import { ID } from '@metronic/helpers';
import { Proficiency } from '@interfaces/Proficiency';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const GET_PROFICIENCY_LIST_URL = `${API_URL}/Proficiencies`;

export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<Proficiency>> => {
  const response: AxiosResponse<PaginatedResponse<Proficiency>> = await axios.get(
    `${GET_PROFICIENCY_LIST_URL}`,
    {
      params: { page_number: page, page_size: pageSize },
    }
  );
  return { ...response.data, pageNumber: page };
};

export const deleteItem = (id: ID): Promise<void> => {
  return axios.delete(`${GET_PROFICIENCY_LIST_URL}/${id}`);
};