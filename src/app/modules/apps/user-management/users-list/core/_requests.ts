import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../../_metronic/helpers";
import { User, UsersQueryResponse } from "./_models";
import { PaginatedResponse } from "@contexts/PaginationContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;
//const USER_URL = `${API_URL}/api/Accounts/{id}`;
const USERS_URL = `${API_URL}/api/Accounts`;



const getUsers = (
  PageNumber: number, 
  PageSize: number, 
  //search: string,
): Promise<UsersQueryResponse> => {
  return axios
    .get(USERS_URL, {
      params: {
        PageNumber: PageNumber,
        PageSize: PageSize,
       // Search: search,
      }
    })
    .then((response: AxiosResponse<UsersQueryResponse>) => response.data);
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
