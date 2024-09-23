import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../../_metronic/helpers";
import { User, UsersQueryResponse } from "./_models";

const API_URL = import.meta.env.VITE_APP_THEME_API_URL;
const USER_URL = `${API_URL}/user`;
const GET_USERS_URL = `${API_URL}/users/query`;

const userList: UsersQueryResponse = {
  "data":[
     {
        "id":1,
        "name":"Emma Smith",
        "avatar":"avatars\/300-3.jpg",
        "email":"smith@kpmg.com",
        "position":"Art Director",
        "role":"Administrator",
        "last_login":"Yesterday",
        "two_steps":false,
        "joined_day":"10 Nov 2022, 9:23 pm",
        "online":false
     },
     {
        "id":2,
        "name":"Melody Macy",
        "initials":{
           "label":"M",
           "state":"danger"
        },
        "email":"melody@altbox.com",
        "position":"Marketing Analytic",
        "role":"Analyst",
        "last_login":"20 mins ago",
        "two_steps":true,
        "joined_day":"10 Nov 2022, 8:43 pm",
        "online":false
     },
     {
        "id":3,
        "name":"Max Smith",
        "avatar":"avatars\/300-3.jpg",
        "email":"max@kt.com",
        "position":"Software Enginer",
        "role":"Developer",
        "last_login":"3 days ago",
        "two_steps":false,
        "joined_day":"22 Sep 2022, 8:43 pm",
        "online":false
     },
     {
        "id":4,
        "name":"Sean Bean",
        "avatar":"avatars\/300-3.jpg",
        "email":"sean@dellito.com",
        "position":"Web Developer",
        "role":"Support",
        "last_login":"5 hours ago",
        "two_steps":true,
        "joined_day":"21 Feb 2022, 6:43 am",
        "online":false
     }
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

const getUsers = (query: string): Promise<UsersQueryResponse> => {
  return new Promise((resolve) => {
    resolve(userList)
  });
  // return axios
  //   .get(`${GET_USERS_URL}?${query}`)
  //   .then((d: AxiosResponse<UsersQueryResponse>) => userList);
    // .then((d: AxiosResponse<UsersQueryResponse>) => d.data);
};

const getUserById = (id: ID): Promise<User | undefined> => {
  return axios
    .get(`${USER_URL}/${id}`)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const createUser = (user: User): Promise<User | undefined> => {
  return axios
    .put(USER_URL, user)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const updateUser = (user: User): Promise<User | undefined> => {
  return axios
    .post(`${USER_URL}/${user.id}`, user)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const deleteUser = (userId: ID): Promise<void> => {
  return axios.delete(`${USER_URL}/${userId}`).then(() => {});
};

const deleteSelectedUsers = (userIds: Array<ID>): Promise<void> => {
  const requests = userIds.map((id) => axios.delete(`${USER_URL}/${id}`));
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
