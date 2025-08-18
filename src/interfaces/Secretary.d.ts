export interface Secretary {
  id?: string
  name: string
  description?: string
  code?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SecretaryType {
  name: string
  description?: string
  code?: string
}
