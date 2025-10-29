import React, {createContext, useContext, useState, ReactNode} from 'react'
import { Role as GeneratedRole, ALL_ROLES } from './roles.generated'

// Use the generated Role type to keep backend/frontend in sync
export type Role = GeneratedRole

// Define the structure of the context
interface RoleContextType {
  roles: Role[]
  // convenience setter when you only have a single role
  setRole: (role: Role) => void
  // full setter for array of roles
  setRoles: (roles: Role[]) => void
  hasAnyRole: (allowed: Role[]) => boolean
}

// Initialize the context with default values
const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const RoleProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [roles, setRoles] = useState<Role[]>(['Student']) // Default to Student

  const setRole = (role: Role) => setRoles([role])

  const hasAnyRole = (allowed: Role[]) => {
    if (!roles || roles.length === 0) return false
    const lower = roles.map(r => r.toLowerCase())
    return allowed.some(a => lower.includes(a.toLowerCase()))
  }

  return (
    <RoleContext.Provider value={{roles, setRole, setRoles, hasAnyRole}}>
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