import { ListView } from '@components/list-view/ListView'
import { LessonType, Quest } from '@interfaces/Lesson' // Importe o tipo Quest
import { useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getList, deleteQuest, deleteSelectedQuests } from './core/_request' // Importe as funções de Quest
import { usePagination } from '@contexts/PaginationContext'
import { useState } from 'react'
import { Link } from 'react-router-dom' 
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'

// Definimos a interface de resposta Metronic (usando Quest ao invés de LessonType)
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
  
  // 2. Chamada useQuery para buscar os dados das Quests (aulas)
  const {data, isLoading}: UseQueryResult<MetronicResponse<Quest>> = useQuery(
    // A key deve ser única para lista de quests
    ['quest-list', page, pageSize, sortBy, sortOrder, filter, search], 
    // getList() busca as Quests do backend
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
    }
  )
  
  // 3. Definição das colunas para Quest
  const columns: Column<Quest>[] = [
    { 
      Header: 'Nome', 
      accessor: (row: any) => row.Name || row.name || '',
      id: 'name',
      // Tornando o nome clicável para navegar para etapas
      Cell: ({ row }: any) => {
        const id = row.original.Id || row.original.id || row.original.Name || row.original.name;
        const name = row.original.Name || row.original.name || 'Sem nome';
        return (
          <Link
            to={`/apps/lesson-management/steps/${id}`}
            className='text-primary fw-bold'
          >
            {name}
          </Link>
        );
      }
    },
    { 
      Header: 'Descrição', 
      accessor: (row: any) => row.Description || row.description || '',
      id: 'description'
    },
    { 
      Header: 'Tipo', 
      accessor: (row: any) => row.Type || row.type || '',
      id: 'type'
    },
    { 
      Header: 'Template', 
      accessor: (row: any) => row.UsageTemplate || row.usageTemplate || '',
      id: 'usageTemplate'
    },
    { 
      Header: 'Max Players', 
      accessor: (row: any) => row.MaxPlayers || row.maxPlayers || 0,
      id: 'maxPlayers'
    },
    { 
      Header: 'Total Etapas', 
      accessor: (row: any) => row.TotalQuestSteps || row.totalQuestSteps || 0,
      id: 'totalQuestSteps'
    },
    { 
      Header: 'Dificuldade', 
      accessor: (row: any) => row.CombatDifficulty || row.combatDifficulty || '',
      id: 'combatDifficulty'
    },
    {
      Header: 'Ações',
      id: 'actions',
      Cell: ({ ...props }: any) => {
        const item = props.data[props.row.index];
        const id = item.Id || item.id || item.Name || item.name;
        return (
          <ActionsCell
            editPath='/apps/lesson-management/lesson'
            id={id}
            callbackFunction={deleteActionCallback}
          />
        );
      },
    }
  ]

  // Função para deletar aula
  const deleteActionCallback = (id: string | number | null | undefined) => {
    if (!id) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
      deleteQuest(id as string)
        .then(() => {
          alert('Aula removida com sucesso!');
          // Recarregar a lista se possível
        })
        .catch((error) => {
          console.error('Erro ao remover aula:', error);
          alert('Erro ao remover aula.');
        });
    }
  };

  // 4. Renderização
  return (
    <>
      <ListView 
        // 4a. Passando os dados do array 'data' com fallback vazio
        data={Array.isArray(data?.data) ? data.data : []}
        columns={columns}
        isLoading={isLoading}
        // 4b. Passando o total de itens
        totalItems={data?.payload?.pagination?.totalCount || 0}
      />
    </>
  )
}

export {LessonListWrapper}