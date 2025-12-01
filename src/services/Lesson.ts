import axios from 'axios';
// Importe as interfaces de Aula que você definiu
import { LessonType, Quest, QuestStep } from '@interfaces/Lesson'; 
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
// Endpoints para as aulas
const LESSONS_URL = `${API_URL}/api/Lessons`; 
const QUESTS_URL = `${API_URL}/api/Quests`;
const FULLSTEPS_URL = `${API_URL}/api/fullsteps/full`;

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

/**
 * Cria uma nova Quest (aula) no backend.
 * @param data Dados da Quest a ser criada.
 * @returns Promessa com a resposta contendo o ID da Quest criada.
 */
export const createQuest = (data: Quest): Promise<{ data: { id: string } }> => {
  return axios.post(QUESTS_URL, data);
};

/**
 * Cria uma nova etapa (QuestStep) de uma Quest com conteúdos.
 * @param data Dados da etapa a ser criada.
 * @returns Promessa com a resposta da criação da etapa.
 */
export const createQuestStep = (data: any): Promise<any> => {
  return axios.post(FULLSTEPS_URL, data);
};

/**
 * Busca todas as Quests criadas.
 * @returns Promessa com a lista de Quests.
 */
export const getQuests = (): Promise<{ data: PaginatedResponse<Quest> }> => {
  return axios.get(QUESTS_URL, {
    params: { PageNumber: 1, PageSize: 1000 }
  });
};

/**
 * Busca uma Quest pelo ID.
 * @param id ID da Quest.
 * @returns Promessa com os dados da Quest.
 */
export const getQuestById = (id: string): Promise<{ data: Quest }> => {
  return axios.get(`${QUESTS_URL}/${id}`);
};

/**
 * Busca etapas de uma Quest específica.
 * @param questId ID da Quest.
 * @returns Promessa com as etapas da Quest.
 */
export const getQuestSteps = (questId: string): Promise<{ data: QuestStep[] }> => {
  return axios.get(`${API_URL}/api/QuestSteps/quest/${questId}`);
};

/**
 * Atualiza uma Quest existente.
 * @param id ID da Quest.
 * @param data Dados da Quest a serem atualizados.
 * @returns Promessa com a resposta da atualização.
 */
export const updateQuest = (id: string, data: Partial<Quest>): Promise<any> => {
  return axios.put(`${QUESTS_URL}/${id}`, data);
};

/**
 * Atualiza uma etapa (QuestStep) existente.
 * @param id ID da etapa.
 * @param data Dados da etapa a serem atualizados.
 * @returns Promessa com a resposta da atualização.
 */
export const updateQuestStep = (id: string, data: Partial<QuestStep>): Promise<any> => {
  return axios.put(`${API_URL}/api/QuestSteps/${id}`, data);
};

/**
 * Remove uma Quest.
 * @param id ID da Quest.
 * @returns Promessa com a resposta da remoção.
 */
export const deleteQuest = (id: string): Promise<any> => {
  return axios.delete(`${QUESTS_URL}/${id}`);
};

/**
 * Remove uma etapa (QuestStep).
 * @param id ID da etapa.
 * @returns Promessa com a resposta da remoção.
 */
export const deleteQuestStep = (id: string): Promise<any> => {
  return axios.delete(`${API_URL}/api/QuestSteps/${id}`);
};

/**
 * Busca conteúdos BNCC para uso em Selects.
 * @returns Promessa com a lista de conteúdos BNCC.
 */
export const getBnccContents = (): Promise<{ data: any[] }> => {
  return axios.get(`${API_URL}/api/Bncc`);
};