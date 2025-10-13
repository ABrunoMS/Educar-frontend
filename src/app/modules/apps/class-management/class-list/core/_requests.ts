import axios, { AxiosResponse } from 'axios';
import { ID } from '@metronic/helpers';
// Importação da interface para a Turma (Classe)
import { Class } from '@interfaces/Class'; 
import { PaginatedResponse } from '@contexts/PaginationContext';

// Define a URL base da API
const API_URL = import.meta.env.VITE_API_BASE_URL;
// Endpoint específico para as Classes
const GET_CLASS_LIST_URL = `${API_URL}/api/Classes`; 

// Tipo estendido para incluir pageNumber, para uso no frontend
export interface PaginatedResponseWithPage<T> extends PaginatedResponse<T> {
  pageNumber: number;
}

/**
 * Busca a lista de Classes (Turmas) com paginação, ordenação e filtros.
 * @returns Promise<PaginatedResponseWithPage<Class>>
 */
export const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponseWithPage<Class>> => {
  // A tipagem da resposta da API é PaginatedResponse<Class>
  const response: AxiosResponse<PaginatedResponse<Class>> = await axios.get(
    `${GET_CLASS_LIST_URL}`,
    {
      params: { 
        PageNumber: page, 
        PageSize: pageSize,
        SortBy: sortBy,
        SortOrder: sortOrder,
        Filter: filter,
        Search: search
      },
    }
  );

  // Retornando a resposta da API, adicionando o pageNumber para manter o estado do frontend
  return { ...response.data, pageNumber: page };
};

/**
 * Exclui uma Turma (Classe) pelo ID.
 * @param id O ID da Turma a ser excluída.
 * @returns Promise<void>
 */
export const deleteItem = (id: ID): Promise<void> => {
  // Chamada DELETE para o endpoint específico da Turma
  return axios.delete(`${GET_CLASS_LIST_URL}/${id}`);
};

/*
 * Observação: Se você tiver um serviço de getClassesBySchools que retorna 
 * a lista de turmas para o formulário de criação de conta, ele deve ser:
 * * export const getClassesBySchools = (schoolIds: string[]): Promise<AxiosResponse<MetronicResponse<Class>>> => {
 * return axios.get(`${API_URL}/api/Classes/bySchools`, { params: { schoolIds } });
 * };
 * * E a listagem no formulário deve ser ajustada para buscar em 'res.data.data'.
*/