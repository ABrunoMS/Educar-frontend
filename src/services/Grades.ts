import axios from 'axios';
import { Grade } from '@interfaces/Grade';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createGrade(grade: Grade) {
  return axios.post<Grade>(`${API_URL}/api/Grades`, grade);
}

export function editGrade(id: string, grade: Grade) {
  return axios.put<Grade>(`${API_URL}/api/Grades/${id}`, grade);
}

export const getGradeById = (id: string) => {
  return axios.get<Grade>(`${API_URL}/api/Grades/${id}`);
};

export function getGrades() {
  return axios.get<PaginatedResponse<Grade>>(`${API_URL}/api/Grades?PageNumber=1&PageSize=999`);
}