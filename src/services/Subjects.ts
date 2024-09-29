import axios, { AxiosResponse } from 'axios';

import { Subject, SubjectCreateResponse } from '@interfaces/Subject';

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


export const getSubjectById = (id: string) => {
  return axios.get<Subject>(API_URL + `/Subjects/${id}`);
}