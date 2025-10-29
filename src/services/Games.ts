import axios from 'axios';
import { Game } from '@interfaces/Game';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function createGame(game: Game) {
  return axios.post<Game>(`${API_URL}/Games`, game);
}

export function editGame(id: string, game: Game) {
  return axios.put<Game>(`${API_URL}/Games/${id}`, game);
}

export function getGames() {
  return axios.get<Game[]>(`${API_URL}/Games`);
}

export const getGameById = (id: string) => {
  return axios.get<Game>(`${API_URL}/Games/${id}`);
};