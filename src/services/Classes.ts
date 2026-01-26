import axios from 'axios';
import { Class } from '@interfaces/Class';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const CLASSES_URL = `${API_URL}/api/Classes`;

export function createClass(classItem: Class) {
  return axios.post<Class>(`${CLASSES_URL}`, classItem);
}

export function editClass(id: string, classItem: Class) {
  return axios.put<Class>(`${CLASSES_URL}/${id}`, classItem);
}

export const getClassById = (id: string) => {
  return axios.get<Class>(`${CLASSES_URL}/${id}`);
};

export const getClasses = (page = 1, pageSize = 10) => {
  return axios.get<{ data: Class[]; payload: { pagination: { totalCount: number } } }>(`${CLASSES_URL}`, {
    params: { PageNumber: page, PageSize: pageSize },
  });
}

export const getClassesBySchools = (schoolIds: string[]): Promise<{ data: Class[] }> => {
  // Usamos um POST para enviar a lista de IDs no corpo da requisição
  return axios.post(`${CLASSES_URL}/by-schools`, { schoolIds });
};

export const getClassesBySchool = (
  schoolId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: { data: Class[]; payload: { pagination: { totalCount: number } } } }> => {
  return axios.get(`${CLASSES_URL}`, {
    params: {
      PageNumber: page,
      PageSize: pageSize,
      SchoolId: schoolId,
    },
  });
};

export const updateClass = (id: string, classItem: Class) => {
  return axios.put<Class>(`${CLASSES_URL}/${id}`, classItem);
};