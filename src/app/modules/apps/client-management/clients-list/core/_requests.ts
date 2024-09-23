import axios, { AxiosResponse } from "axios";
import { ID, Response } from '@metronic/helpers'
import { ClientType } from '@interfaces/Client'
import { PaginatedResponse } from "@contexts/PaginationContext";

export type User = {
  id?: ID
  name?: string
  avatar?: string
  email?: string
  position?: string
  role?: string
  last_login?: string
  two_steps?: boolean
  joined_day?: string
  online?: boolean
  initials?: {
    label: string
    state: string
  }
}

export type ClientsQueryResponse = Response<Array<ClientType>>

export const initialUser: User = {
  avatar: 'avatars/300-3.jpg',
  position: 'Art Director',
  role: 'Administrator',
  name: '',
  email: '',
}

const API_URL = import.meta.env.VITE_APP_THEME_API_URL;
const CLIENT_URL = `${API_URL}/user`;
const GET_USERS_URL = `${API_URL}/users/query`;

const clientList: PaginatedResponse<ClientType> = {
  items: [
    { name: 'Cliente - Escola 1', totalAccounts: 10, remainingAccounts: 3, partner: 'Parceiro 1' },
    { name: 'Cliente - Escola 2', totalAccounts: 2, remainingAccounts: 0, partner: 'Parceiro 2' },
    { name: 'Cliente - Escola 3', totalAccounts: 63, remainingAccounts: 23, partner: 'Parceiro 3' },
    { name: 'Cliente - Escola 4', totalAccounts: 10, remainingAccounts: 3, partner: 'Parceiro 4' },
    { name: 'Cliente - Escola 5', totalAccounts: 2, remainingAccounts: 0, partner: 'Parceiro 5' },
    // { name: 'Cliente - Escola 6', totalAccounts: 63, remainingAccounts: 23, partner: 'Parceiro 6' },
    // { name: 'Cliente - Escola 7', totalAccounts: 10, remainingAccounts: 3, partner: 'Parceiro 7' },
    // { name: 'Cliente - Escola 8', totalAccounts: 2, remainingAccounts: 0, partner: 'Parceiro 8' },
    // { name: 'Cliente - Escola 9', totalAccounts: 63, remainingAccounts: 23, partner: 'Parceiro 9' },
    // { name: 'Cliente - Escola 10', totalAccounts: 63, remainingAccounts: 23, partner: 'Parceiro 10' },
  ],
  totalPages: 147,
  pageNumber: 1,
  pageSize: 10
}

const userList: ClientsQueryResponse = {
  "data":[
    { name: 'Cliente - Escola 1', totalAccounts: 10, remainingAccounts: 3, partner: 'Parceiro 1' },
    { name: 'Cliente - Escola 2', totalAccounts: 2, remainingAccounts: 0, partner: 'Parceiro 2' },
    { name: 'Cliente - Escola 3', totalAccounts: 63, remainingAccounts: 23, partner: 'Parceiro 3' }
  ],
  "payload":{
     "pagination":{
        "page":1,
        "links": [
           {
              "url": null,
              "label": "&laquo; Previous",
              "active": false,
              "page": null
           },
           {
              "url": "\/?page=1",
              "label": "1",
              "active": true,
              "page": 1
           },
           {
              "url": "\/?page=2",
              "label": "2",
              "active": false,
              "page": 2
           },
           {
              "url": "\/?page=3",
              "label": "3",
              "active": false,
              "page": 3
           },
           {
              "url": "\/?page=2",
              "label": "Next &raquo;",
              "active": false,
              "page": 2
           }
        ],
        "items_per_page": 10
     }
  }
}

const getList = async (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<ClientType>> => {
  // const response: AxiosResponse<PaginatedResponse<ClientType>> = await axios.get(`${GET_USERS_URL}`, {
  const response: AxiosResponse<PaginatedResponse<ClientType>> = await axios.get(`https://api.fake-rest.refine.dev/products`, {
    params: { page, pageSize, sortBy, sortOrder, filter, search },
  })
  // return response.data
  // console.log('iuahsuiashuias', {params: {page, pageSize, sortBy, sortOrder, filter, search}})
  return new Promise((resolve) => {
    resolve({...clientList, pageNumber: page})
  });
}

const getListbkp = (query: string): Promise<ClientsQueryResponse> => {
  return new Promise((resolve) => {
    resolve(userList)
  });
  // return axios
  //   .get(`${GET_USERS_URL}?${query}`)
  //   .then((d: AxiosResponse<ClientsQueryResponse>) => userList);
    // .then((d: AxiosResponse<ClientsQueryResponse>) => d.data);
};

const getUserById = (id: ID): Promise<User | undefined> => {
  return axios
    .get(`${CLIENT_URL}/${id}`)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const createUser = (user: User): Promise<User | undefined> => {
  return axios
    .put(CLIENT_URL, user)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const updateUser = (user: User): Promise<User | undefined> => {
  return axios
    .post(`${CLIENT_URL}/${user.id}`, user)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const deleteClient = (userId: ID): Promise<void> => {
  return axios.delete(`${CLIENT_URL}/${userId}`).then(() => {});
};

const deleteSelectedUsers = (userIds: Array<ID>): Promise<void> => {
  const requests = userIds.map((id) => axios.delete(`${CLIENT_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

export {
  getList,
  deleteClient,
  deleteSelectedUsers,
  getUserById,
  createUser,
  updateUser,
};
