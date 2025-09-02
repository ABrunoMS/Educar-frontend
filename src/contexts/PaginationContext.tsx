import React, {createContext, useContext, useState, ReactNode} from 'react'

interface PaginationContextProps {
  page: number;
  pageSize: 10 | 30 | 50 | 100;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filter: string;
  search: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: 10 | 30 | 50 | 100) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setFilter: (filter: string) => void;
  setSearch: (search: string) => void;
}

const PaginationContext = createContext<PaginationContextProps | undefined>(undefined)

interface PaginationProviderProps {
  children: ReactNode;
  initialPageSize?: 10 | 30 | 50 | 100;
}

export interface PaginationState {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Esta é a nova estrutura da resposta da API
export interface PaginatedResponse<T> {
  data: T[];
  payload: {
    pagination: PaginationState;
  };
}

export const PaginationProvider = ({children, initialPageSize = 10}: PaginationProviderProps) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  return (
    <PaginationContext.Provider value={{
      page,
      pageSize,
      sortBy,
      sortOrder,
      filter,
      search,
      setPage,
      setPageSize,
      setSortBy,
      setSortOrder,
      setFilter,
      setSearch,
    }}>
      {children}
    </PaginationContext.Provider>
  )
}

export const usePagination = () => {
  const context = useContext(PaginationContext)
  if (!context) {
    throw new Error('usePagination must be used within a PaginationProvider')
  }
  return context
}