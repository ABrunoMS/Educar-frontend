import { getList, deleteItem, getItem, createItem, updateItem } from '@services/Secretaries';
import { Secretary } from '@interfaces/Secretary';
import { PaginatedResponse } from '@contexts/PaginationContext';

export type SecretaryType = Secretary;

export interface SecretariesQueryResponse {
  items: Secretary[];
  totalCount: number;
}

export { getList };

export const getSecretariesList = (
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filter: string,
  search: string
): Promise<PaginatedResponse<Secretary>> => {
  return getList(page, pageSize, sortBy, sortOrder, filter, search);
};

export const deleteSecretary = (id: string): Promise<void> => {
  return deleteItem(id);
};

export const getSecretary = (id: string): Promise<Secretary> => {
  return getItem(id);
};

export const createSecretary = (secretary: Partial<Secretary>): Promise<Secretary> => {
  return createItem(secretary);
};

export const updateSecretary = (id: string, secretary: Partial<Secretary>): Promise<Secretary> => {
  return updateItem(id, secretary);
};
