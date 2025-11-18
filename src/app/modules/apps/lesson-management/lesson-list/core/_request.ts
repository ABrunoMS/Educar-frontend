import axios, { AxiosResponse } from "axios";
import { ID, Response } from '@metronic/helpers'
// Substitua ClientType por LessonType e adicione Quest
import { LessonType, Quest } from '@interfaces/Lesson' 
import { PaginatedResponse } from "@contexts/PaginationContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;
// URLs para endpoints de Aulas e Quests
const LESSONS_URL = `${API_URL}/api/Lessons`; 
const QUESTS_URL = `${API_URL}/api/Quests`;

// Tipo de resposta para a lista de aulas (Quest) no formato Metronic
export type LessonsQueryResponse = {
  data: Quest[];
  payload: {
    pagination: {
      totalCount: number;
    };
  };
};

// Função para buscar a lista de Quests com paginação, ordenação e filtros
export const getList = async (
  PageNumber: number,
  PageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<LessonsQueryResponse> => {
  try {
    const response = await axios.get(QUESTS_URL, {
      params: { PageNumber, PageSize, sortBy, sortOrder, filter, search },
    });
    
    console.log('Backend response for Quests:', response.data);
    
    // Check if backend returns an array directly or a paginated object
    if (Array.isArray(response.data)) {
      // Plain array response
      return {
        data: response.data,
        payload: {
          pagination: {
            totalCount: response.data.length,
          },
        },
      };
    } else if (response.data && typeof response.data === 'object') {
      // Paginated response: use 'data' or 'Data' property for items
      const data = response.data;
      const items = data.data || data.Data || data.items || [];
      // Busca o total de forma robusta
      const total = (data.payload && data.payload.pagination && data.payload.pagination.totalCount)
        || data.totalCount || data.total || items.length;
      return {
        data: Array.isArray(items) ? items : [],
        payload: {
          pagination: {
            totalCount: total,
          },
        },
      };
    }
    
    // Fallback to empty array
    return {
      data: [],
      payload: {
        pagination: {
          totalCount: 0,
        },
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados do backend:', error);
    
    // Dados mockados para teste
   /*const mockQuests: Quest[] = [
      {
        Id: 'aula-portugues-concordancia',
        Name: 'Aula de Português - Concordância',
        Description: 'Introdução ao conceito de concordância',
        UsageTemplate: '2º Trimestre',
        Type: 'Português',
        MaxPlayers: 35,
        TotalQuestSteps: 0,
        CombatDifficulty: 'Baixo Desempenho'
      },
      {
        Id: 'aula-matematica-fracoes',
        Name: 'Aula de Matemática - Frações',
        Description: 'Introdução ao conceito de frações',
        UsageTemplate: 'Ensino Fundamental',
        Type: 'Matemática',
        MaxPlayers: 30,
        TotalQuestSteps: 3,
        CombatDifficulty: 'Fácil'
      },
      {
        Id: 'aula-ciencias-sistema-solar',
        Name: 'Aula de Ciências - Sistema Solar',
        Description: 'Explorando o sistema solar',
        UsageTemplate: 'Ensino Fundamental',
        Type: 'Ciências',
        MaxPlayers: 25,
        TotalQuestSteps: 5,
        CombatDifficulty: 'Fácil'
      }
    ];*/
    
    return {
      data: [],
      payload: {
        pagination: {
          totalCount: 0,
        },
      },
    };
  }
};

// Deleta uma única Quest
export const deleteQuest = (questId: ID): Promise<void> => {
  return axios.delete(`${QUESTS_URL}/${questId}`).then(() => {});
};

// Deleta múltiplas Quests
export const deleteSelectedQuests = (questIds: Array<ID>): Promise<void> => {
  const requests = questIds.map((id) => axios.delete(`${QUESTS_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

// Busca uma Quest pelo ID
export const getQuestById = async (id: ID): Promise<Quest> => {
  const response: AxiosResponse<Quest> = await axios.get(`${QUESTS_URL}/${id}`)
  return response.data;
}

// === FUNÇÕES LEGADAS PARA COMPATIBILIDADE ===

// Deleta uma única aula legada
export const deleteLesson = (lessonId: ID): Promise<void> => {
  return axios.delete(`${LESSONS_URL}/${lessonId}`).then(() => {});
};

// Deleta múltiplas aulas legadas
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