import axios from 'axios';
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
export function getAccountById(id: string) {
  return axios.get<Account>(`${ACCOUNTS_URL}/${id}`);
}

/**
 * CORRIGIDO: Busca uma lista paginada de contas que pertencem a uma ESCOLA específica.
 * A URL agora é `/api/Accounts/school/{schoolId}`.
 */
export function getAccountsBySchool(schoolId: string, page = 1, pageSize = 10) {
  return axios.get<PaginatedResponse<Account>>(`${ACCOUNTS_URL}/school/${schoolId}`, {
    params: { PageNumber: page, PageSize: pageSize },
  });
}

/**
 * NOVO: Busca uma lista paginada de contas que pertencem a uma SECRETARIA (Cliente) específica.
 * Esta é a função que usaremos no formulário de turmas.
 */
export function getAccountsByClient(clientId: string, page = 1, pageSize = 1000) { // PageSize alto para popular dropdowns
  return axios.get<PaginatedResponse<Account>>(`${ACCOUNTS_URL}/client/${clientId}`, {
    params: { PageNumber: page, PageSize: pageSize },
  });
}