import React, {createContext, useContext, useState, ReactNode} from 'react'
import { Role as GeneratedRole, ALL_ROLES } from './roles.generated'

// Use the generated Role type to keep backend/frontend in sync
export type Role = GeneratedRole

// Roles que podem apenas visualizar (não editar)
const READ_ONLY_ROLES: Role[] = ['Subsecretario', 'SecretarioRegional', 'Secretario']

// Roles com permissão de edição
const EDITOR_ROLES: Role[] = ['Admin', 'AgenteComercial', 'Distribuidor', 'Diretor']

// Define the structure of the context
interface RoleContextType {
  roles: Role[]
  // convenience setter when you only have a single role
  setRole: (role: Role) => void
  // full setter for array of roles
  setRoles: (roles: Role[]) => void
  hasAnyRole: (allowed: Role[]) => boolean
  // Helpers de permissão
  canEdit: () => boolean
  isReadOnly: () => boolean
  isSecretarioRegional: () => boolean
  isSubsecretario: () => boolean
  isSecretario: () => boolean
}

// Initialize the context with default values
const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const RoleProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [roles, setRolesState] = useState<Role[]>(['Student']) // Default to Student

  const setRoles = (newRoles: Role[]) => {
    console.log('[RoleContext] setRoles called with:', newRoles)
    setRolesState(newRoles)
  }

  const setRole = (role: Role) => setRoles([role])

  const hasAnyRole = (allowed: Role[]) => {
    if (!roles || roles.length === 0) return false
    const lower = roles.map(r => r.toLowerCase())
    const result = allowed.some(a => lower.includes(a.toLowerCase()))
    return result
  }

  // Verifica se o usuário pode editar
  const canEdit = () => hasAnyRole(EDITOR_ROLES)

  // Verifica se o usuário é apenas visualização
  const isReadOnly = () => hasAnyRole(READ_ONLY_ROLES) && !canEdit()

  // Helpers específicos para cada role
  const isSecretarioRegional = () => hasAnyRole(['SecretarioRegional'])
  const isSubsecretario = () => hasAnyRole(['Subsecretario'])
  const isSecretario = () => hasAnyRole(['Secretario'])

  return (
    <RoleContext.Provider value={{
      roles, 
      setRole, 
      setRoles, 
      hasAnyRole,
      canEdit,
      isReadOnly,
      isSecretarioRegional,
      isSubsecretario,
      isSecretario
    }}>
      {children}
    </RoleContext.Provider>
  )
}

// Hook for accessing the role context
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}