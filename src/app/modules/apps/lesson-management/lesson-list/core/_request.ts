import axios, { AxiosResponse } from "axios";
import { ID, Response } from '@metronic/helpers'
// Substitua ClientType por LessonType. Crie este tipo se ainda não existir.
import { LessonType } from '@interfaces/Lesson' 
import { PaginatedResponse } from "@contexts/PaginationContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;
// URL corrigida para o endpoint de Aulas
const LESSONS_URL = `${API_URL}/api/Lessons`; 

// Tipo de resposta para a lista de aulas
export type LessonsQueryResponse = PaginatedResponse<LessonType>;

// Função para buscar a lista de aulas com paginação, ordenação e filtros
export const getList = async (
  PageNumber: number,
  PageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<LessonsQueryResponse> => {
  const response: AxiosResponse<LessonsQueryResponse> = await axios.get(LESSONS_URL, {
    params: { PageNumber, PageSize, sortBy, sortOrder, filter, search },
  });
  return response.data;
};

// Deleta uma única aula
export const deleteLesson = (lessonId: ID): Promise<void> => {
  return axios.delete(`${LESSONS_URL}/${lessonId}`).then(() => {});
};

// Deleta múltiplas aulas
export const deleteSelectedLessons = (lessonIds: Array<ID>): Promise<void> => {
  const requests = lessonIds.map((id) => axios.delete(`${LESSONS_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

// Cria uma nova aula
export const createLesson = (lesson: LessonType): Promise<LessonType> => {
  return axios.post<LessonType>(LESSONS_URL, lesson).then((response) => response.data);
};

// Atualiza uma aula existente
export const updateLesson = (lesson: LessonType): Promise<LessonType> => {
  return axios.put<LessonType>(`${LESSONS_URL}/${lesson.id}`, lesson).then((response) => response.data);
};

// Busca uma aula pelo ID
export const getLessonById = (lessonId: ID): Promise<LessonType> => {
  return axios.get<LessonType>(`${LESSONS_URL}/${lessonId}`).then((response) => response.data);
};