import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../../_metronic/helpers";
import { User } from "./_models";
import { PaginatedResponse } from "@contexts/PaginationContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const USERS_URL = `${API_URL}/api/Accounts`;

// Tipo de resposta para a lista de usuários
export type UsersQueryResponse = PaginatedResponse<User>;

// Função para buscar a lista de usuários com paginação, ordenação e filtros
const getUsers = async (
  PageNumber: number, 
  PageSize: number, 
  sortBy: string = '',
  sortOrder: 'asc' | 'desc' = 'asc',
  filter: string = '',
  search: string = '',
  clientId?: string,
  role?: string
): Promise<UsersQueryResponse> => {
  const response: AxiosResponse<UsersQueryResponse> = await axios.get(USERS_URL, {
    params: { 
      PageNumber, 
      PageSize,
      sortBy,
      sortOrder,
      filter,
      search,
      ...(clientId && { ClientId: clientId }),
      ...(role && { Role: role })
    }
  });
  return response.data;
};

const getUserById = (id: ID): Promise<User | undefined> => {
  return axios
    .get(`${USERS_URL}/${id}`)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const createUser = (user: User): Promise<User | undefined> => {
  return axios
    .put(USERS_URL, user)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const updateUser = (user: User): Promise<User | undefined> => {
  return axios
    .post(`${USERS_URL}/${user.id}`, user)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const deleteUser = (userId: ID): Promise<void> => {
  return axios.delete(`${USERS_URL}/${userId}`).then(() => {});
};

const deleteSelectedUsers = (userIds: Array<ID>): Promise<void> => {
  const requests = userIds.map((id) => axios.delete(`${USERS_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

export {
  getUsers,
  deleteUser,
  deleteSelectedUsers,
  getUserById,
  createUser,
  updateUser,
};
