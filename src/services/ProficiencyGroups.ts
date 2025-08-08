import axios from 'axios';
import { ProficiencyGroup } from '@interfaces/Proficiency';
import { PaginatedResponse } from '@contexts/PaginationContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createProficiencyGroup(proficiencyGroup: ProficiencyGroup) {
  return axios.post<ProficiencyGroup>(`${API_URL}/ProficiencyGroups`, proficiencyGroup);
}

export function editProficiencyGroup(id: string, proficiencyGroup: ProficiencyGroup) {
  return axios.put<ProficiencyGroup>(`${API_URL}/ProficiencyGroups/${id}`, proficiencyGroup);
}

export function getProficiencyGroups() {
  return axios.get<PaginatedResponse<ProficiencyGroup>>(`${API_URL}/ProficiencyGroups?page_number=1&page_size=999`);
}

export const getProficiencyGroupById = (id: string) => {
  return axios.get<ProficiencyGroup>(`${API_URL}/ProficiencyGroups/${id}`);
};