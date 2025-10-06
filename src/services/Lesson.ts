import axios from 'axios';
// Importe a interface de Aula que você definiu
import { LessonType } from '@interfaces/Lesson'; 
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
// Endpoint correto para as aulas
const LESSONS_URL = `${API_URL}/api/Lessons`; 

/**
 * Busca a lista completa de aulas (ou as primeiras 1000) para uso em Selects, etc.
 * @returns Promessa com a resposta paginada contendo o array de aulas.
 */
export const getLessons = (): Promise<{ data: PaginatedResponse<LessonType> }> => {
  return axios.get(LESSONS_URL, {
    // Configuração para buscar um número grande de itens para simular "todos"
    params: { PageNumber: 1, PageSize: 1000 }, 
  });
};

/**
 * Busca uma única aula pelo ID.
 * @param id O ID da aula.
 * @returns Promessa com a resposta contendo os dados da aula.
 */
export const getLessonById = (id: string): Promise<{ data: LessonType }> => {
  return axios.get(`${LESSONS_URL}/${id}`);
};