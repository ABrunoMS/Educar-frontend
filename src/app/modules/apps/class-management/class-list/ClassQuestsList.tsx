import React, { FC, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { ID } from '@metronic/helpers';
import { 
  getClassQuests, 
  deleteClassQuest, 
  ClassQuest, 
  createClassQuest,
  updateClassQuest 
} from '@services/ClassQuest';
import { getQuests, getQuestById } from '@services/Lesson';
import { Modal } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import clsx from 'clsx';

type Props = {
  classId: string;
};

const formatDateToBR = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

type ClassQuestWithName = ClassQuest & {
  questName?: string;
};

const ClassQuestsTable: FC<{
  classQuests: ClassQuestWithName[];
  onDelete: (id: ID) => void;
  onEdit: (classQuest: ClassQuest) => void;
}> = ({ classQuests, onDelete, onEdit }) => {
  const getStatusColor = (isExpired: boolean) => {
    return isExpired ? 'danger' : 'success';
  };

  const getStatusText = (isExpired: boolean) => {
    return isExpired ? 'Expirada' : 'Ativa';
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationMessage = (expirationDate: string, isExpired: boolean) => {
    if (isExpired) {
      return 'Expirou';
    }
    const days = getDaysUntilExpiration(expirationDate);
    if (days === 0) return 'Expira hoje';
    if (days === 1) return 'Expira amanhã';
    if (days <= 7) return `Expira em ${days} dias`;
    return `${days} dias restantes`;
  };

  return (
    <div className='row g-6 g-xl-9'>
      {classQuests.map((cq) => {
        const statusColor = getStatusColor(cq.isExpired);
        const expirationMsg = getExpirationMessage(cq.expirationDate, cq.isExpired);
        const daysLeft = getDaysUntilExpiration(cq.expirationDate);
        const isUrgent = daysLeft <= 3 && !cq.isExpired;

        return (
          <div key={cq.id} className='col-md-6 col-xl-4'>
            <div className='card h-100 shadow-sm'>
              {/* Header do Card */}
              <div className='card-header border-0 pt-7 pb-4'>
                <div className='d-flex align-items-center mb-3'>
                  <div className='symbol symbol-50px me-3'>
                    <div className='symbol-label bg-light'>
                      <i className='ki-duotone ki-book-open fs-2x text-gray-600'>
                        <span className='path1'></span>
                        <span className='path2'></span>
                        <span className='path3'></span>
                        <span className='path4'></span>
                      </i>
                    </div>
                  </div>
                  <div className='flex-grow-1'>
                    <span className={clsx('badge fs-8', {
                      'badge-light-danger': cq.isExpired,
                      'badge-light': !cq.isExpired
                    })}>
                      {getStatusText(cq.isExpired)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Corpo do Card */}
              <div className='card-body pt-0 pb-7'>
                {/* Nome da Aula */}
                <div className='mb-5'>
                  <h3 className='fs-4 fw-bold text-gray-900 mb-1 text-hover-primary cursor-pointer' title={cq.questName || 'Carregando...'}>
                    {cq.questName || (
                      <span className='text-muted'>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Carregando...
                      </span>
                    )}
                  </h3>
                </div>

                {/* Data de Expiração */}
                <div className='bg-light rounded p-4 mb-5'>
                  <div className='d-flex align-items-center'>
                    <i className='ki-duotone ki-calendar fs-1 me-3 text-gray-600'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                    </i>
                    <div className='flex-grow-1'>
                      <div className='fs-7 text-muted mb-1'>Expira em</div>
                      <div className='fs-5 fw-bold text-gray-800'>
                        {formatDateToBR(cq.expirationDate)}
                      </div>
                      {cq.isExpired && (
                        <span className='badge badge-sm badge-danger mt-1'>Expirada</span>
                      )}
                      {isUrgent && (
                        <span className='badge badge-sm badge-warning mt-1'>Vence em breve</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className='d-flex gap-2'>
                  <button
                    className='btn btn-sm btn-light flex-grow-1'
                    onClick={() => onEdit(cq)}
                    title='Editar data de expiração'
                  >
                    <i className='ki-duotone ki-calendar-edit fs-4 me-1'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                    </i>
                    Alterar Data
                  </button>
                  <button
                    className='btn btn-sm btn-icon btn-light'
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja remover "${cq.questName}" desta turma?`)) {
                        onDelete(cq.id);
                      }
                    }}
                    title='Remover aula da turma'
                  >
                    <i className='ki-duotone ki-trash fs-3'>
                      <span className='path1'></span>
                      <span className='path2'></span>
                      <span className='path3'></span>
                      <span className='path4'></span>
                      <span className='path5'></span>
                    </i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const createQuestSchema = Yup.object().shape({
  questId: Yup.string().required('Selecione uma aula'),
  expirationDate: Yup.date()
    .required('Data de expiração é obrigatória')
    .min(new Date(), 'Data deve ser futura'),
});

const updateQuestSchema = Yup.object().shape({
  expirationDate: Yup.date()
    .required('Data de expiração é obrigatória')
    .min(new Date(), 'Data deve ser futura'),
});

const ClassQuestsList: FC<Props> = ({ classId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClassQuest, setEditingClassQuest] = useState<ClassQuest | null>(null);
  const [classQuestsWithNames, setClassQuestsWithNames] = useState<ClassQuestWithName[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<{value: string, label: string} | null>(null);
  const queryClient = useQueryClient();

  const { data: classQuests, isLoading } = useQuery(
    ['classQuests', classId],
    () => getClassQuests(classId).then((res) => res.data),
    {
      enabled: !!classId,
      onError: () => {
        toast.error('Não foi possível carregar as aulas desta turma.');
      },
    }
  );

  // Buscar nomes das aulas quando classQuests mudar
  React.useEffect(() => {
    if (classQuests && classQuests.length > 0) {
      const fetchQuestNames = async () => {
        const questsWithNames = await Promise.all(
          classQuests.map(async (cq: ClassQuest) => {
            try {
              const response = await getQuestById(cq.questId);
              return {
                ...cq,
                questName: response.data.name || 'Sem nome',
              };
            } catch (error) {
              return {
                ...cq,
                questName: 'Erro ao carregar',
              };
            }
          })
        );
        setClassQuestsWithNames(questsWithNames);
      };
      fetchQuestNames();
    } else {
      setClassQuestsWithNames([]);
    }
  }, [classQuests]);

  const createFormik = useFormik({
    initialValues: {
      questId: '',
      expirationDate: '',
    },
    validationSchema: createQuestSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Converter data para formato ISO com hora 23:59:59
        const expirationDate = new Date(values.expirationDate);
        expirationDate.setHours(23, 59, 59, 999);
        
        await createClassQuest({
          classId,
          questId: values.questId,
          expirationDate: expirationDate.toISOString(),
        });
        toast.success('Aula vinculada à turma com sucesso!');
        setShowCreateModal(false);
        queryClient.invalidateQueries(['classQuests', classId]);
        createFormik.resetForm();
        setSelectedQuest(null);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erro ao vincular aula à turma.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      expirationDate: '',
    },
    validationSchema: updateQuestSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!editingClassQuest) return;
      
      try {
        // Converter data para formato ISO com hora 23:59:59
        const expirationDate = new Date(values.expirationDate);
        expirationDate.setHours(23, 59, 59, 999);
        
        await updateClassQuest(editingClassQuest.id, {
          expirationDate: expirationDate.toISOString(),
        });
        toast.success('Data de expiração atualizada com sucesso!');
        setShowEditModal(false);
        setEditingClassQuest(null);
        queryClient.invalidateQueries(['classQuests', classId]);
        editFormik.resetForm();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Erro ao atualizar data de expiração.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEdit = (classQuest: ClassQuest) => {
    setEditingClassQuest(classQuest);
    // Converter para formato YYYY-MM-DD para o input date
    const date = new Date(classQuest.expirationDate);
    const dateStr = date.toISOString().split('T')[0];
    editFormik.setFieldValue('expirationDate', dateStr);
    setShowEditModal(true);
  };

  const handleDelete = async (id: ID) => {
    try {
      await deleteClassQuest(id as string);
      toast.success('Aula removida da turma com sucesso!');
      queryClient.invalidateQueries(['classQuests', classId]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao remover aula da turma.');
    }
  };

  const loadQuestOptions = async (inputValue: string) => {
    try {
      console.log('Carregando aulas... inputValue:', inputValue);
      const response = await getQuests();
      console.log('Resposta getQuests completa:', response);
      console.log('response.data:', response.data);
      
      // Extrai o array de quests da resposta paginada
      let quests: any[] = [];
      if (response.data && typeof response.data === 'object') {
        // Se response.data tem a propriedade 'data' (resposta paginada)
        if ('data' in response.data && Array.isArray(response.data.data)) {
          quests = response.data.data;
        }
        // Se response.data já é um array
        else if (Array.isArray(response.data)) {
          quests = response.data;
        }
      }
      
      console.log('Quests extraídas (array?):', Array.isArray(quests), quests);
      
      if (!Array.isArray(quests)) {
        console.error('Quests não é um array:', quests);
        return [];
      }
      
      const filtered = inputValue 
        ? quests.filter((quest: any) => 
            quest.name && quest.name.toLowerCase().includes(inputValue.toLowerCase())
          )
        : quests; // Se não tem input, mostra todas
      
      console.log('Quests filtradas:', filtered);
      
      const options = filtered.map((quest: any) => ({
        value: quest.id,
        label: quest.name || 'Sem nome',
      }));
      
      console.log('Opções finais mapeadas:', options);
      return options;
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className='d-flex justify-content-center p-10'>
        <span className='spinner-border spinner-border-lg'></span>
      </div>
    );
  }

  return (
    <div className='p-9'>
      {/* Botão de Ação */}
      <div className='d-flex justify-content-between align-items-center mb-7'>
        <div>
          <h3 className='fw-bold m-0'>Aulas da Turma</h3>
          <p className='text-muted fs-6 m-0'>Gerencie as aulas vinculadas a esta turma</p>
        </div>
        <button
          type='button'
          className='btn btn-sm btn-primary'
          onClick={() => setShowCreateModal(true)}
        >
          <i className='ki-duotone ki-plus fs-2'></i>
          Adicionar Aula
        </button>
      </div>

      {/* Cards de Aulas */}
      {classQuestsWithNames && classQuestsWithNames.length > 0 ? (
        <ClassQuestsTable
          classQuests={classQuestsWithNames}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <div className='card border-0 shadow-sm'>
          <div className='card-body text-center py-20'>
            <div className='mb-7'>
              <i className='ki-duotone ki-book-open fs-5x text-primary opacity-50'>
                <span className='path1'></span>
                <span className='path2'></span>
                <span className='path3'></span>
                <span className='path4'></span>
              </i>
            </div>
            <h3 className='fs-2 fw-bold text-gray-800 mb-3'>Nenhuma aula vinculada</h3>
            <p className='text-muted fs-5 fw-semibold mb-7'>
              Comece adicionando aulas a esta turma para que os alunos possam acessá-las
            </p>
            <button
              type='button'
              className='btn btn-lg btn-primary'
              onClick={() => setShowCreateModal(true)}
            >
              <i className='ki-duotone ki-plus fs-2'></i>
              Adicionar Primeira Aula
            </button>
          </div>
        </div>
      )}

      {/* Modal de Criar */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size='lg' centered>
        <Modal.Header closeButton className='border-0 pb-0'>
          <Modal.Title className='fs-2 fw-bold'>Adicionar Aula à Turma</Modal.Title>
        </Modal.Header>
        <Modal.Body className='pt-5'>
          <form onSubmit={createFormik.handleSubmit} noValidate>
            <div className='mb-7'>
              <label className='form-label required fs-6 fw-bold mb-3'>Selecione a Aula</label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                placeholder='Digite para buscar uma aula...'
                loadOptions={loadQuestOptions}
                onChange={(option: any) => {
                  createFormik.setFieldValue('questId', option?.value || '');
                  setSelectedQuest(option);
                }}
                value={selectedQuest}
                noOptionsMessage={() => 'Nenhuma aula encontrada'}
                loadingMessage={() => 'Carregando aulas...'}
                styles={{
                  control: (provided: any, state: any) => ({
                    ...provided,
                    backgroundColor: '#fff',
                    borderColor: state.isFocused ? '#009ef7' : '#e4e6ef',
                    borderWidth: '1px',
                    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(0, 158, 247, 0.25)' : 'none',
                    '&:hover': {
                      borderColor: '#009ef7',
                    },
                    minHeight: '44px',
                  }),
                  menu: (provided: any) => ({
                    ...provided,
                    backgroundColor: '#1e1e2d',
                    zIndex: 9999,
                    boxShadow: '0px 0px 50px 0px rgba(82, 63, 105, 0.15)',
                  }),
                  option: (provided: any, state: any) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? '#2c2c3e' : '#1e1e2d',
                    color: '#fff',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#2c2c3e',
                    },
                  }),
                  placeholder: (provided: any) => ({
                    ...provided,
                    color: '#a1a5b7',
                  }),
                  singleValue: (provided: any) => ({
                    ...provided,
                    color: '#181c32',
                  }),
                }}
              />
              {createFormik.touched.questId && createFormik.errors.questId && (
                <div className='text-danger mt-2 fs-7'>{createFormik.errors.questId}</div>
              )}
              <div className='form-text mt-2'>
                <i className='ki-duotone ki-information-5 fs-6 me-1'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                  <span className='path3'></span>
                </i>
                Apenas aulas disponíveis para seu cliente aparecerão na lista
              </div>
            </div>

            <div className='mb-7'>
              <label className='form-label required fs-6 fw-bold mb-3'>Data de Expiração</label>
              <div className='position-relative'>
                <i className='ki-duotone ki-calendar fs-2 position-absolute top-50 translate-middle-y ms-4 text-gray-500'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
                <input
                  type='date'
                  className={clsx('form-control form-control-lg ps-12', {
                    'is-invalid': createFormik.touched.expirationDate && createFormik.errors.expirationDate,
                  })}
                  {...createFormik.getFieldProps('expirationDate')}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {createFormik.touched.expirationDate && createFormik.errors.expirationDate && (
                <div className='invalid-feedback d-block mt-2'>{createFormik.errors.expirationDate}</div>
              )}
              <div className='form-text mt-2'>
                <i className='ki-duotone ki-information-5 fs-6 me-1'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                  <span className='path3'></span>
                </i>
                Data a partir da qual a aula não estará mais disponível para os alunos
              </div>
            </div>

            <div className='d-flex justify-content-end gap-3'>
              <button
                type='button'
                className='btn btn-light btn-lg'
                onClick={() => setShowCreateModal(false)}
                disabled={createFormik.isSubmitting}
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='btn btn-primary btn-lg'
                disabled={createFormik.isSubmitting}
              >
                {createFormik.isSubmitting ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <i className='ki-duotone ki-check fs-2'></i>
                    Adicionar Aula
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal de Editar */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size='lg' centered>
        <Modal.Header closeButton className='border-0 pb-0'>
          <Modal.Title className='fs-2 fw-bold'>Alterar Data de Expiração</Modal.Title>
        </Modal.Header>
        <Modal.Body className='pt-5'>
          <form onSubmit={editFormik.handleSubmit} noValidate>
            <div className='alert alert-primary d-flex align-items-center mb-7'>
              <i className='ki-duotone ki-information-5 fs-2x text-primary me-4'>
                <span className='path1'></span>
                <span className='path2'></span>
                <span className='path3'></span>
              </i>
              <div className='fs-6 fw-semibold'>
                Altere a data de expiração para modificar até quando esta aula estará disponível para os alunos
              </div>
            </div>

            <div className='mb-7'>
              <label className='form-label required fs-6 fw-bold mb-3'>Nova Data de Expiração</label>
              <div className='position-relative'>
                <i className='ki-duotone ki-calendar fs-2 position-absolute top-50 translate-middle-y ms-4 text-gray-500'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
                <input
                  type='date'
                  className={clsx('form-control form-control-lg ps-12', {
                    'is-invalid': editFormik.touched.expirationDate && editFormik.errors.expirationDate,
                  })}
                  {...editFormik.getFieldProps('expirationDate')}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {editFormik.touched.expirationDate && editFormik.errors.expirationDate && (
                <div className='invalid-feedback d-block mt-2'>{editFormik.errors.expirationDate}</div>
              )}
            </div>

            <div className='d-flex justify-content-end gap-3'>
              <button
                type='button'
                className='btn btn-light btn-lg'
                onClick={() => setShowEditModal(false)}
                disabled={editFormik.isSubmitting}
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='btn btn-primary btn-lg'
                disabled={editFormik.isSubmitting}
              >
                {editFormik.isSubmitting ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className='ki-duotone ki-check fs-2'></i>
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export { ClassQuestsList };
