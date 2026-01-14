import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5280';

export interface ClassQuest {
  id: string;
  classId: string;
  questId: string;
  startDate: string;
  expirationDate: string;
  isExpired: boolean;
}

export interface CreateClassQuestRequest {
  classId: string;
  questId: string;
  startDate: string;
  expirationDate: string;
}

export interface UpdateClassQuestRequest {
  expirationDate: string;
}

export const getClassQuests = (classId?: string, questId?: string) => {
  const params = new URLSearchParams();
  if (classId) params.append('classId', classId);
  if (questId) params.append('questId', questId);
  
  return axios.get(`${API_URL}/api/ClassQuests?${params.toString()}`);
};

export const getClassQuestById = (id: string) => {
  return axios.get(`${API_URL}/api/ClassQuests/${id}`);
};

export const createClassQuest = (data: CreateClassQuestRequest) => {
  return axios.post(`${API_URL}/api/ClassQuests`, data);
};

export const updateClassQuest = (id: string, data: UpdateClassQuestRequest) => {
  return axios.put(`${API_URL}/api/ClassQuests/${id}`, data);
};

export const deleteClassQuest = (id: string) => {
  return axios.delete(`${API_URL}/api/ClassQuests/${id}`);
};
