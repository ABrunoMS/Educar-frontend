import axios, { AxiosResponse } from 'axios';
import { Account } from '@interfaces/Account';
import { PaginatedResponse } from '@contexts/PaginationContext'; // Importe a interface de paginação

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ACCOUNTS_URL = `${API_URL}/api/Accounts`; // Boa prática ter uma URL base para a entidade

/**
 * Busca uma lista paginada de todas as contas.
 */
export function getAccounts(page = 1, pageSize = 10) {
  return axios.get<PaginatedResponse<Account>>(ACCOUNTS_URL, {
    params: { PageNumber: page, PageSize: pageSize },
  });
}

/**
 * Busca uma única conta pelo seu ID.
 */
export function getAccountById(id: string): Promise<Account> {
  return axios.get<Account>(`${ACCOUNTS_URL}/${id}`).then(res => res.data);
}

/**
 * CORRIGIDO: Busca uma lista paginada de contas que pertencem a uma ESCOLA específica.
 * A URL agora é `/api/Accounts/school/{schoolId}`.
 */
export const getAccountsBySchool = (
  schoolId: string, 
  page: number, 
  pageSize: number, 
  search: string
): Promise<PaginatedResponse<Account>> => {
  return axios.get<PaginatedResponse<Account>>(`${ACCOUNTS_URL}/school/${schoolId}`, {
    params: { 
      PageNumber: page, 
      PageSize: pageSize,
      Search: search
    },
  })
  .then((response: AxiosResponse<PaginatedResponse<Account>>) => response.data);
};

/**
 * NOVO: Busca uma lista paginada de contas que pertencem a uma SECRETARIA (Cliente) específica.
 * Esta é a função que usaremos no formulário de turmas.
 */
export function getAccountsByClient(clientId: string, page = 1, pageSize = 1000) { // PageSize alto para popular dropdowns
  return axios.get<PaginatedResponse<Account>>(`${ACCOUNTS_URL}/client/${clientId}`, {
    params: { PageNumber: page, PageSize: pageSize },
  });
}

export const createAccount = (accountData: Account): Promise<any> => {
  return axios.post(ACCOUNTS_URL, accountData);
};

export const updateAccount = ( accountData: Account): Promise<any> => {
  return axios.put(`${ACCOUNTS_URL}/${accountData.id}`, accountData);
}

/**
 * Busca uma lista de contas filtradas por role.
 * Usa o endpoint /api/Accounts/role/{role}
 * @param role - A role para filtrar (ex: 'AgenteComercial', 'Distribuidor')
 */
export function getAccountsByRole(role: string, page = 1, pageSize = 1000) {
  return axios.get<PaginatedResponse<Account>>(`${ACCOUNTS_URL}/role/${role}`, {
    params: { 
      PageNumber: page, 
      PageSize: pageSize,
    },
  });
}