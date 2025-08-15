import axios, { AxiosResponse } from "axios";
import { ID, Response } from '@metronic/helpers';
// Importe sua interface Address e adicione 'id'
import { Address } from '@interfaces/Address'; 
import { PaginatedResponse } from "@contexts/PaginationContext";

// Crie uma nova interface para o endereço com ID, pois a API geralmente retorna um ID
export interface AddressType extends Address {
  id: ID;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ADDRESSES_URL = `${API_URL}/api/Addresses`;

export type AddressesQueryResponse = PaginatedResponse<AddressType>;

export const getList = async (
  PageNumber: number,
  PageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<AddressesQueryResponse> => {
  const response: AxiosResponse<AddressesQueryResponse> = await axios.get(ADDRESSES_URL, {
    params: { PageNumber, PageSize, sortBy, sortOrder, filter, search },
  });
  return response.data;
};

export const deleteAddress = (addressId: ID): Promise<void> => {
  return axios.delete(`${ADDRESSES_URL}/${addressId}`).then(() => {});
};

export const deleteSelectedAddresses = (addressIds: Array<ID>): Promise<void> => {
  const requests = addressIds.map((id) => axios.delete(`${ADDRESSES_URL}/${id}`));
  return axios.all(requests).then(() => {});
};

export const createAddress = (address: Address): Promise<AddressType> => {
  return axios.post<AddressType>(ADDRESSES_URL, address).then((response) => response.data);
};

export const updateAddress = (address: AddressType): Promise<AddressType> => {
  return axios.put<AddressType>(`${ADDRESSES_URL}/${address.id}`, address).then((response) => response.data);
};