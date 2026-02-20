import axios, { AxiosResponse } from 'axios';
import { ID } from '@metronic/helpers';
import { SchoolType } from '@interfaces/School';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const GET_SCHOOL_LIST_URL = `${API_URL}/api/Schools`;

export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string,
  clientId?: string,
  regionalId?: string,
  subsecretariaId?: string
): Promise<PaginatedResponse<SchoolType>> => {
  const response: AxiosResponse<PaginatedResponse<SchoolType>> = await axios.get(
    `${GET_SCHOOL_LIST_URL}`,
    {
      params: { 
        PageNumber: page, 
        PageSize: pageSize,
        search,
        ...(clientId && { ClientId: clientId }),
        ...(regionalId && { RegionalId: regionalId }),
        ...(subsecretariaId && { SubsecretariaId: subsecretariaId })
      },
    }
  );
  return { ...response.data, pageNumber: page };
};

export const deleteItem = (id: ID): Promise<void> =>
  axios.delete(`${GET_SCHOOL_LIST_URL}/${id}`).then(() => {});

export const deleteSchool = (id: ID): Promise<void> =>
  axios.delete(`${GET_SCHOOL_LIST_URL}/${id}`).then(() => {});

export type { SchoolType };
export type SchoolsQueryResponse = PaginatedResponse<SchoolType>;
