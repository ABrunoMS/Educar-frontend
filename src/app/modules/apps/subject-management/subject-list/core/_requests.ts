import axios, { AxiosResponse } from "axios";
import { ID, Response } from '@metronic/helpers'
import { Subject } from "@interfaces/Subject";
import { PaginatedResponse } from "@contexts/PaginationContext";

export type DeleteResponse = {}

const API_URL = import.meta.env.VITE_API_BASE_URL;
const GET_SUBJECT_LIST_URL = `${API_URL}/Subjects`;

export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<Subject>> => {
  const response: AxiosResponse<PaginatedResponse<Subject>> = await axios.get(`${GET_SUBJECT_LIST_URL}`, {
    params: { 'page_number': page, 'page_size': pageSize },
  })
  return { ...response.data, pageNumber: page }
}

export const deleteItem = (id: ID): Promise<void> => {
  return axios.delete(`${GET_SUBJECT_LIST_URL}/${id}`);
};
