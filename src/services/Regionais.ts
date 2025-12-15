import axios from 'axios';
import { Regional } from '@interfaces/School';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function getRegionais() {
  return axios.get<Regional[]>(`${API_URL}/api/Regionais`);
}

export function getRegionaisBySubsecretaria(subsecretariaId: string) {
  return axios.get<Regional[]>(`${API_URL}/api/Regionais?subsecretariaId=${subsecretariaId}`);
}
