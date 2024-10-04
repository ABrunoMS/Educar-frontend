import axios from 'axios';
import { Proficiency } from '@interfaces/Proficiency';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createProficiency(proficiency: Proficiency) {
  return axios.post<Proficiency>(`${API_URL}/Proficiencies`, proficiency);
}

export function editProficiency(id: string, proficiency: Proficiency) {
  return axios.put<Proficiency>(`${API_URL}/Proficiencies/${id}`, proficiency);
}

export const getProficiencyById = (id: string) => {
  return axios.get<Proficiency>(`${API_URL}/Proficiencies/${id}`);
};

export const getProficiencies = () => {
  return axios.get<Proficiency[]>(`${API_URL}/Proficiencies`);
};