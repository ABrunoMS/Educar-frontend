import { ListView } from '@components/list-view/ListView'
import { LessonType, Quest, ProductDto, ContentDto } from '@interfaces/Lesson' // Importe o tipo Quest
import { useQuery, useQueryClient, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getList, deleteQuest, deleteSelectedQuests } from './core/_request' // Importe as funções de Quest
import { usePagination } from '@contexts/PaginationContext'
import { useState, useEffect, useMemo, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom' 
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'
import { getSubjects } from '@services/Subjects'
import { getGrades } from '@services/Grades'
import { getAllProducts, getCompatibleContents } from '@services/Lesson'
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
  const {page, pageSize, sortBy, sortOrder, filter, setPage} = usePagination()
  // Hook para obter o search do campo de busca do ListView
  const { state } = useQueryRequest()
  const searchFromContext = state.search || ''
  const debouncedSearch = useDebounce(searchFromContext, 300)
  const queryClient = useQueryClient()
  
  const navigate = useNavigate()
  
  // Estados para filtros locais
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedContent, setSelectedContent] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [products, setProducts] = useState<ProductDto[]>([])
  const [contents, setContents] = useState<ContentDto[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingContents, setIsLoadingContents] = useState(false)
  
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

    // Carregar produtos
    setIsLoadingProducts(true);
    getAllProducts().then(res => {
      setProducts(res.data || []);
    }).catch(err => console.error('Erro ao carregar produtos:', err))
    .finally(() => setIsLoadingProducts(false));
  }, []);

  // Carregar conteúdos quando o produto é selecionado
  useEffect(() => {
    if (!selectedProduct) {
      setContents([]);
      setSelectedContent('');
      return;
    }
    setIsLoadingContents(true);
    getCompatibleContents(selectedProduct).then(contentList => {
      setContents(contentList);
      // Limpar conteúdo selecionado se não for mais válido
      if (selectedContent && !contentList.some(c => c.id === selectedContent)) {
        setSelectedContent('');
      }
    }).catch(err => console.error('Erro ao carregar conteúdos:', err))
    .finally(() => setIsLoadingContents(false));
  }, [selectedProduct]);

  // Resetar para página 1 e invalidar query quando filtros mudarem
  useEffect(() => {
    setPage(1);
    // Invalidar a query para forçar uma nova busca
    queryClient.invalidateQueries(['quest-list']);
  }, [selectedSubject, selectedGrade, selectedProduct, selectedContent, debouncedSearch, setPage, queryClient]);
  
  // Chamada useQuery para buscar os dados das Quests (aulas)
  const {data, isLoading, refetch}: UseQueryResult<any> = useQuery(
    ['quest-list', page, pageSize, sortBy, sortOrder, filter, debouncedSearch, isTemplateView, selectedSubject, selectedGrade, selectedProduct, selectedContent], 
    () => getList(page, pageSize, sortBy, sortOrder, filter, debouncedSearch || '', isTemplateView, selectedSubject, selectedGrade, selectedProduct, selectedContent),
    { keepPreviousData: true }
  )
  
  // 3. Definição das colunas para Quest
  const columns: Column<Quest>[] = [
    { 
      Header: 'Nome', 
      accessor: (row: any) => row.Name || row.name || '',
      id: 'name',
      Cell: ({ row }: any) => {
        const name = row.original.Name || row.original.name || 'Sem nome';
        return <span className='text-gray-800 fw-bold'>{name}</span>;
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
      Header: 'Produto', 
      accessor: (row: any) => row.product?.name || row.product?.Name || '',
      id: 'product'
    },
    { 
      Header: 'Conteúdo', 
      accessor: (row: any) => row.content?.name || row.content?.Name || '',
      id: 'content'
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
      {/* Indicador de filtros ativos */}
      {(selectedSubject || selectedGrade || selectedProduct || selectedContent) && (
        <div className='alert alert-primary d-flex align-items-center mb-5'>
          <span className='me-2'>
            <i className='bi bi-funnel-fill fs-3'></i>
          </span>
          <div className='flex-grow-1'>
            <strong>Filtros aplicados:</strong>
            {selectedSubject && (
              <div className='text-muted fs-7'>
                Matéria: {subjects.find((s: any) => (s.id || s.Id) === selectedSubject)?.name || subjects.find((s: any) => (s.id || s.Id) === selectedSubject)?.name}
              </div>
            )}
            {selectedGrade && (
              <div className='text-muted fs-7'>
                Ano: {grades.find((g: any) => (g.id || g.Id) === selectedGrade)?.name || grades.find((g: any) => (g.id || g.Id) === selectedGrade)?.name}
              </div>
            )}
            {selectedProduct && (
              <div className='text-muted fs-7'>
                Produto: {products.find(p => p.id === selectedProduct)?.name}
              </div>
            )}
            {selectedContent && (
              <div className='text-muted fs-7'>
                Conteúdo: {contents.find(c => c.id === selectedContent)?.name}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Filtro por Produto */}
      <div className='mb-5'>
        <label className='form-label fs-6 fw-bold'>Produto:</label>
        <select
          className='form-select form-select-solid fw-bolder'
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          disabled={isLoadingProducts}
        >
          <option value=''>{isLoadingProducts ? 'Carregando...' : 'Todos os produtos'}</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Conteúdo */}
      <div className='mb-5'>
        <label className='form-label fs-6 fw-bold'>Conteúdo:</label>
        <select
          className='form-select form-select-solid fw-bolder'
          value={selectedContent}
          onChange={(e) => setSelectedContent(e.target.value)}
          disabled={!selectedProduct || isLoadingContents}
        >
          <option value=''>
            {isLoadingContents 
              ? 'Carregando...' 
              : !selectedProduct 
                ? 'Selecione um produto primeiro' 
                : 'Todos os conteúdos'}
          </option>
          {contents.map((content) => (
            <option key={content.id} value={content.id}>
              {content.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const handleResetFilters = () => {
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedProduct('');
    setSelectedContent('');
    setPage(1);
    // Invalidar query para garantir que a lista seja recarregada
    queryClient.invalidateQueries(['quest-list']);
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