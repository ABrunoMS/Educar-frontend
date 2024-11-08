import axios, { AxiosResponse } from 'axios';

import { Subject, SubjectCreateResponse } from '@interfaces/Subject';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Server should return AuthModel
export function createSubject(subject: Subject) {
  return axios.post<SubjectCreateResponse>(
    API_URL + `/Subjects`,
    subject
  );
}

export function editSubject(id: string, subject: Subject) {
  return axios.put<SubjectCreateResponse>(
    API_URL + `/Subjects/${id}`,
    subject
  );
}

export function getSubjects() {
  return axios.get<PaginatedResponse<Subject>>(`${API_URL}/Subjects?page_number=1&page_size=999`);
}

export const getSubjectById = (id: string) => {
  return axios.get<Subject>(API_URL + `/Subjects/${id}`);
}