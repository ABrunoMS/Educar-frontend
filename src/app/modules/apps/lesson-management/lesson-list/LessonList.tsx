import { ListView } from '@components/list-view/ListView'
import { LessonType, Quest } from '@interfaces/Lesson' // Importe o tipo Quest
import { useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getList, deleteQuest, deleteSelectedQuests } from './core/_request' // Importe as funções de Quest
import { usePagination } from '@contexts/PaginationContext'
import { useState, useEffect, useMemo, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom' 
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'
import { getSubjects } from '@services/Subjects'
import { getGrades } from '@services/Grades'
import { Subject } from '@interfaces/Subject'
import { Grade } from '@interfaces/Grade'
import { useDebounce } from '@metronic/helpers'
import { QueryRequestProvider, useQueryRequest } from '@components/list-view/core/QueryRequestProvider'
import { QueryResponseProvider } from '@components/list-view/core/QueryResponseProvider'
import { ListViewHeader } from '@components/list-view/components/header/ListViewHeader'
import { ListTable } from '@components/list-view/table/ListTable'
import { KTCard } from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'

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

// Componente interno que tem acesso ao QueryRequestProvider
const LessonListContent: React.FC<Props> = ({ isTemplateView }) => {
  // Hook de paginação para obter o estado atual
  const {page, pageSize, sortBy, sortOrder, filter} = usePagination()
  // Hook para obter o search do campo de busca do ListView
  const { state } = useQueryRequest()
  const searchFromContext = state.search || ''
  const debouncedSearch = useDebounce(searchFromContext, 300)
  
  const navigate = useNavigate()
  
  // Estados para filtros locais
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  
  // Carregar matérias e anos ao montar
  useEffect(() => {
    getSubjects().then(res => {
      const items = res.data?.data || res.data || [];
      setSubjects(Array.isArray(items) ? items : []);
    }).catch(err => console.error('Erro ao carregar matérias:', err));
    
    getGrades().then(res => {
      const items = res.data?.data || res.data || [];
      setGrades(Array.isArray(items) ? items : []);
    }).catch(err => console.error('Erro ao carregar anos:', err));
  }, []);
  
  // Chamada useQuery para buscar os dados das Quests (aulas)
  const {data, isLoading, refetch}: UseQueryResult<any> = useQuery(
    ['quest-list', page, pageSize, sortBy, sortOrder, filter, debouncedSearch, isTemplateView, selectedSubject, selectedGrade], 
    () => getList(page, pageSize, sortBy, sortOrder, filter, debouncedSearch, isTemplateView, selectedSubject, selectedGrade),
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
      accessor: (row: any) => row.subject?.name || row.subject?.Name || '',
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
      accessor: (row: any) => row.grade?.name || row.grade?.Name || '',
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
            editPath='/apps/lesson-management/lessonEdit'
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
          refetch();
        })
        .catch((error) => {
          console.error('Erro ao remover aula:', error);
          alert('Erro ao remover aula.');
        });
    }
  };

  // Componente de filtros customizados para o dropdown
  const customFiltersContent = (
    <>
      {/* Filtro por Matéria */}
      <div className='mb-5'>
        <label className='form-label fs-6 fw-bold'>Matéria:</label>
        <select
          className='form-select form-select-solid fw-bolder'
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value=''>Todas as matérias</option>
          {subjects.map((subject: any) => (
            <option key={subject.id || subject.Id} value={subject.id || subject.Id}>
              {subject.name || subject.Name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Filtro por Ano Escolar */}
      <div className='mb-5'>
        <label className='form-label fs-6 fw-bold'>Ano Escolar:</label>
        <select
          className='form-select form-select-solid fw-bolder'
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          <option value=''>Todos os anos</option>
          {grades.map((grade: any) => (
            <option key={grade.id || grade.Id} value={grade.id || grade.Id}>
              {grade.name || grade.Name}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const handleResetFilters = () => {
    setSelectedSubject('');
    setSelectedGrade('');
  };

  // Renderização
  return (
    <>
      <ToolbarWrapper />
      <Content>
        <KTCard>
          <ListViewHeader 
            customFilters={customFiltersContent} 
            onResetFilters={handleResetFilters} 
          />
          <ListTable
            data={Array.isArray(data?.data) ? data.data : []}
            columns={columns}
            isLoading={isLoading}
            totalItems={data?.payload?.pagination?.totalCount || 0}
          />
        </KTCard>
      </Content>
    </>
  )
}

// Wrapper que provê o contexto do QueryRequest
const LessonListWrapper: React.FC<Props> = ({ isTemplateView }) => {
  return (
    <QueryRequestProvider>
      <QueryResponseProvider>
        <LessonListContent isTemplateView={isTemplateView} />
      </QueryResponseProvider>
    </QueryRequestProvider>
  )
}

export {LessonListWrapper}