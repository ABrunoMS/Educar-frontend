export interface School {
  id?: string;
  name: string;
  description: string;
  address: string;
  client: string;
}

export interface SchoolType {
  id?: string;
  name?: string;
  description?: string;
  addressId?: string;
  clientId?: string;
  address?: {
    id: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  client?: {
    id: string;
    name?: string;
    description?: string;
  };
}