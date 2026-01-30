import axios from 'axios';
import { Regional } from '@interfaces/School';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface MacroRegionDto {
  id: string;
  name: string;
}

export function getMacroRegions() {
  return axios.get<MacroRegionDto[]>(`${API_URL}/api/MacroRegions`);
}
