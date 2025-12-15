import axios from 'axios';
import { Subsecretaria } from '@interfaces/School';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function getSubsecretarias() {
  return axios.get<Subsecretaria[]>(`${API_URL}/api/Subsecretarias`);
}

export function getSubsecretariasByClient(clientId: string) {
  return axios.get<Subsecretaria[]>(`${API_URL}/api/Subsecretarias?clientId=${clientId}`);
}
