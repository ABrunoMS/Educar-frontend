import { ListView } from '@components/list-view/ListView'
import { LessonType, Quest } from '@interfaces/Lesson' // Importe o tipo Quest
import { useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getList, deleteQuest, deleteSelectedQuests } from './core/_request' // Importe as funções de Quest
import { usePagination } from '@contexts/PaginationContext'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' 
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

type Props = {
  isTemplateView: boolean;
}

const LessonListWrapper: React.FC<Props> = ({ isTemplateView }) => {
  // 1. Hook de paginação para obter o estado atual
  const {page, pageSize, sortBy, sortOrder, filter, search} = usePagination()
  const navigate = useNavigate()
  
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
  const {data, isLoading}: UseQueryResult<any> = useQuery(
    ['quest-list', page, pageSize, sortBy, sortOrder, filter, search, isTemplateView], 
    () => getList(page, pageSize, sortBy, sortOrder, filter, search, isTemplateView),
    { keepPreviousData: true }
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
        if(isTemplateView) return <span className='text-gray-800 fw-bold'>{name}</span>;
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
      Header: 'Matéria', 
      accessor: (row: any) => row.subject || '',
      id: 'subject'
    },
   /* { 
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
    },*/
    { 
      Header: 'Ano escolar', 
      accessor: (row: any) => row.grade || '',
      id: 'grade'
    },
    
    {
      Header: '',
      id: 'actions',
      Cell: ({ ...props }: any) => {
        const item = props.data[props.row.index];
        const id = item.Id || item.id || item.Name || item.name;
        if (isTemplateView) {
             return (
                 <button 
                    className='btn btn-sm btn-light-primary'
                    // Redireciona para 'create' com o ID do template na URL
                    onClick={() => navigate(`/apps/lesson-management/create?sourceTemplateId=${item.id}`)}
                 >
                    <i className="ki-duotone ki-copy fs-5 me-1"></i> Importar Modelo
                 </button>
             )
         }
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