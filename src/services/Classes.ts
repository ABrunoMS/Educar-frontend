import axios from 'axios';
import { Class } from '@interfaces/Class';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createClass(classItem: Class) {
  return axios.post<Class>(`${API_URL}/Classes`, classItem);
}

export function editClass(id: string, classItem: Class) {
  return axios.put<Class>(`${API_URL}/Classes/${id}`, classItem);
}

export const getClassById = (id: string) => {
  return axios.get<Class>(`${API_URL}/Classes/${id}`);
};