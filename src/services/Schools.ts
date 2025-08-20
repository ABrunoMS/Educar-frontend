import axios from 'axios';
import { SchoolType } from '@interfaces/School';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const SCHOOLS_URL = `${API_URL}/api/Schools`;

export const getSchools = (): Promise<{ data: PaginatedResponse<SchoolType> }> => {
  return axios.get(SCHOOLS_URL, {
    params: { PageNumber: 1, PageSize: 1000 }, // Buscar todas as escolas
  });
};

export const getSchoolById = (id: string): Promise<{ data: SchoolType }> => {
  return axios.get(`${SCHOOLS_URL}/${id}`);
};

// ===============================================
// ## NOVA FUNÇÃO ADICIONADA AQUI ##
// ===============================================
/**
 * Busca a lista de escolas que pertencem a uma SECRETARIA (Cliente) específica.
 * @param clientId O ID da Secretaria (Cliente)
 * @returns Uma lista de escolas.
 */
export const getSchoolsByClient = (
  clientId: string,
  // PageSize alto para carregar todas as escolas no dropdown
): Promise<{ data: PaginatedResponse<SchoolType> }> => { // <-- 1. TIPO DE RESPOSTA CORRIGIDO
  return axios.get(`${SCHOOLS_URL}/client/${clientId}`, {
    // 2. PARÂMETROS DE PAGINAÇÃO ADICIONADOS
    params: { PageNumber: 1, PageSize: 1000},
  });
};

export const createSchool = (school: SchoolType): Promise<{ data: { id: string } }> => {
  return axios.post(SCHOOLS_URL, school);
};

export const updateSchool = (id: string, school: SchoolType): Promise<void> => {
  return axios.put(`${SCHOOLS_URL}/${id}`, school);
};

export const deleteSchool = (id: string): Promise<void> => {
  return axios.delete(`${SCHOOLS_URL}/${id}`);
};