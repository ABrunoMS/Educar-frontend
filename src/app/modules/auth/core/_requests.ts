import axios, { AxiosResponse } from 'axios';
import { AuthModel, UserModel } from './_models';

import { jwtDecode } from "jwt-decode";

const AUTH_API_URL = import.meta.env.VITE_AUTH_BASE_URL;
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${AUTH_API_URL}/protocol/openid-connect/userinfo`;
export const LOGIN_URL = `${AUTH_API_URL}/protocol/openid-connect/token`;
export const REGISTER_URL = `${AUTH_API_URL}/register`;
export const RESET_PASSWORD_URL = `${API_URL}/Accounts/forgot-password`;

const userModel: UserModel = {
  id: 2,
  'first_name': 'João',
  'last_name': 'José',
  email: 'joaodoe@email.com',
  username: 'JohnDoe',
  password: undefined
}

export interface JWTUser {
  sid: string;
  scope: string;
  'email_verified': boolean;
  'preferred_username': string;
  email: string;
  'realm_access': {
    roles: string[];
  }
}

// Server should return AuthModel
export function login(email: string, password: string) {
  const callback = axios.post<AuthModel>(LOGIN_URL, {
    grant_type: 'password',
    username: email,
    password,
    client_id: 'educar-frontend'
  },
  {
    headers: {
      "Content-type":"application/x-www-form-urlencoded"
    }
  });

  return callback;
}

export function refreshSession(refreshToken: string) {
  const callback = axios.post<AuthModel>(LOGIN_URL, {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: 'educar-frontend'
  },
  {
    headers: {
      "Content-type":"application/x-www-form-urlencoded"
    }
  });

  return callback;
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function resetPassword(email: string) {
  return axios.put<{ result: boolean }>(RESET_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  // return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
  //   client_id: 'educar-frontend'
  // });

  const jwtUser = jwtDecode<JWTUser>(token)

  const userModel: UserModel = {
    id: jwtUser.sid,
    'first_name': 'João',
    'last_name': 'José',
    email: jwtUser.email,
    username: jwtUser.preferred_username,
    password: undefined,
    roles: jwtUser.realm_access.roles
  }

  return userModel;

  // return <AxiosResponse>{
  //   data: userModel
  // }
}
