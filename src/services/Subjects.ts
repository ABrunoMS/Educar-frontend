import axios, { AxiosResponse } from 'axios';

import { Subject, SubjectCreateResponse } from '@interfaces/Subject';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Server should return AuthModel
export function createSubject(subject: Subject) {
  const callback = axios.post<SubjectCreateResponse>(
    API_URL + `/Subjects`,
    subject
  );

  return callback;
}
