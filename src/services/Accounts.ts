import axios from 'axios';
import { Account } from '@interfaces/Account';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function getAccounts() {
  return axios.get<Account[]>(`${API_URL}/Accounts`);
}