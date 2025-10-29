import axios from "axios";
import { Contract } from "@interfaces/Contract";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createContract(contract: Contract) {
  return axios.post<Contract>(`${API_URL}/Contracts`, contract);
}

export function updateContract(id: string, contract: Contract) {
  return axios.put<Contract>(`${API_URL}/Contracts/${id}`, contract);
}

export const getContractById = (id: string) => {
  return axios.get<Contract>(`${API_URL}/Contracts/${id}`);
};