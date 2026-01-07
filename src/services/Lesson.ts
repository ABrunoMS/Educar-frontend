import axios from 'axios';
// Importe as interfaces de Aula que você definiu
import { LessonType, Quest, QuestStep, ProductDto, ContentDto } from '@interfaces/Lesson'; 
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;
// Endpoints para as aulas
const LESSONS_URL = `${API_URL}/api/Lessons`; 
const QUESTS_URL = `${API_URL}/api/Quests`;
const FULLSTEPS_URL = `${API_URL}/api/fullsteps/full`;
const FULLSTEPS_BULK_URL = `${API_URL}/api/fullsteps/full/bulk`;

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
export const createQuest = (data: any): Promise<{ data: { id: string } }> => {
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

/**
 * Busca todos os produtos disponíveis.
 * @returns Promessa com a lista de produtos.
 */
export const getAllProducts = (): Promise<PaginatedResponse<ProductDto>> => {
  return axios
    .get<PaginatedResponse<ProductDto>>(`${API_URL}/api/Products?pageNumber=1&pageSize=9999`)
    .then((response) => response.data);
};

/**
 * Busca os conteúdos compatíveis com um produto específico.
 * @param productId ID do produto.
 * @returns Promessa com a lista de conteúdos.
 */
export const getCompatibleContents = (productId: string): Promise<ContentDto[]> => {
  return axios
    .get<ContentDto[]>(`${API_URL}/api/Products/${productId}/contents`)
    .then((response) => response.data);
};

/**
 * Atualiza uma etapa existente deletando-a e recriando com conteúdos completos.
 * Esta é uma solução alternativa já que não existe um endpoint UpdateFullQuestStep.
 * @param stepId ID da etapa a ser atualizada.
 * @param data Dados completos da etapa com conteúdos.
 * @returns Promessa com o ID da nova etapa criada.
 */
export const updateQuestStepWithContents = async (stepId: string, data: any): Promise<{ data: { id: string } }> => {
  // 1. Deleta a etapa antiga (cascata deleta os conteúdos)
  await deleteQuestStep(stepId);
  
  // 2. Cria uma nova etapa com todos os conteúdos
  return createQuestStep(data);
};

/**
 * Cria múltiplas etapas (QuestSteps) de uma vez para uma Quest.
 * @param questId ID da Quest.
 * @param steps Array com os dados das etapas a serem criadas.
 * @returns Promessa com array de IDs das etapas criadas.
 */
export const createQuestStepsBulk = (questId: string, steps: any[]): Promise<{ data: { id: string }[] }> => {
  return axios.post(FULLSTEPS_BULK_URL, {
    questId,
    steps
  });
};

/**
 * Substitui todas as etapas de uma Quest.
 * Deleta todas as etapas existentes e cria novas com os conteúdos fornecidos.
 * @param questId ID da Quest.
 * @param existingStepIds IDs das etapas existentes (para deletar).
 * @param newSteps Dados das novas etapas com conteúdos.
 * @returns Promessa com array de IDs das novas etapas criadas.
 */
export const replaceAllQuestSteps = async (
  questId: string, 
  existingStepIds: string[], 
  newSteps: any[]
): Promise<{ data: { id: string }[] }> => {
  // 1. Deleta todas as etapas antigas (se houver)
  if (existingStepIds && existingStepIds.length > 0) {
    await Promise.all(existingStepIds.map(id => 
      deleteQuestStep(id).catch(err => {
        console.warn(`Aviso: Não foi possível deletar etapa ${id}:`, err.message);
        // Continua mesmo se falhar (a etapa pode não existir mais)
      })
    ));
  }
  
  // 2. Cria todas as novas etapas de uma vez usando bulk
  return createQuestStepsBulk(questId, newSteps);
};