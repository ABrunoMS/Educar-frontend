import axios from 'axios';
import { Grade } from '@interfaces/Grade';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createGrade(grade: Grade) {
  return axios.post<Grade>(`${API_URL}/Grades`, grade);
}

export function editGrade(id: string, grade: Grade) {
  return axios.put<Grade>(`${API_URL}/Grades/${id}`, grade);
}

export const getGradeById = (id: string) => {
  return axios.get<Grade>(`${API_URL}/Grades/${id}`);
};