import { ListView } from '@components/list-view/ListView'
import { LessonType } from '@interfaces/Lesson' // Importe o seu tipo de aula
import { useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getList } from './core/_request' // Importe a função que faz a requisição HTTP
import { usePagination } from '@contexts/PaginationContext'
import { useState } from 'react'
import { Link } from 'react-router-dom' 

// Você precisará desta modal para ver detalhes da aula, similar ao ClientDetailsModal
// import { LessonDetailsModal } from '@components/list-view/components/modals/LessonDetailsModal' 

// Definimos a interface de resposta Metronic (usando o mesmo padrão do ClientListWrapper)
interface MetronicResponse<T> {
  data: T[];
  payload: {
    pagination: { 
      totalCount: number;
    };
  };
}

const LessonListWrapper = () => {
  // 1. Hook de paginação para obter o estado atual
  const {page, pageSize, sortBy, sortOrder, filter, search} = usePagination()
  
  // Mocks de estado da Modal de Detalhes (se você for usar)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  
  const handleOpenModal = (lessonId: string) => {
    setSelectedLessonId(lessonId)
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setSelectedLessonId(null)
    setIsModalOpen(false)
  }
  
  // 2. Chamada useQuery para buscar os dados das aulas
  const {data, isLoading}: UseQueryResult<MetronicResponse<LessonType>> = useQuery(
    // A key deve ser única para lista de aulas
    ['lesson-list', page, pageSize, sortBy, sortOrder, filter, search], 
    // getList() é a função que faz a requisição HTTP. Crie-a em './core/_requests.ts'
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
    }
  )
  
  // 3. Definição das colunas
  const columns: Column<LessonType>[] = [
    { 
      Header: 'Nome', 
      accessor: 'name',
      // Tornando o nome clicável para abrir a modal de detalhes
      Cell: ({ row }) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (row.original.id) {
              handleOpenModal(row.original.id);
            }
          }}
          className='text-primary fw-bold'
        >
          {row.original.name}
        </a>
      )
    },
    { Header: 'Disciplina', accessor: 'discipline' },
    { Header: 'Ano escolar', accessor: 'schoolYear' },
    { Header: 'BNCC', accessor: 'bncc' },
    { Header: 'Conteúdo', accessor: 'content' },
  ]

  // 4. Renderização
  return (
    <>
      <ListView 
        // 4a. Passando os dados do array 'data'
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        // 4b. Passando o total de itens
        totalItems={data?.payload?.pagination?.totalCount || 0}
      />
      {/* Exemplo de modal para detalhes, se necessário */}
      {/* {isModalOpen && (
        <LessonDetailsModal
          lessonId={selectedLessonId!} 
          onClose={handleCloseModal}
        />
      )} */}
    </>
  )
}

export {LessonListWrapper}