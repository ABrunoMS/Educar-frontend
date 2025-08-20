import axios from 'axios';
import { Class } from '@interfaces/Class';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createClass(classItem: Class) {
  return axios.post<Class>(`${API_URL}/api/Classes`, classItem);
}

export function editClass(id: string, classItem: Class) {
  return axios.put<Class>(`${API_URL}/api/Classes/${id}`, classItem);
}

export const getClassById = (id: string) => {
  return axios.get<Class>(`${API_URL}/api/Classes/${id}`);
};

export const getClasses = (page = 1, pageSize = 10) => {
  return axios.get<{ items: Class[]; totalCount: number }>(`${API_URL}/api/Classes`, {
    params: { PageNumber: page, PageSize: pageSize },
  });
}