import React, { FC, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { getClasses } from '@services/Classes';
import { getQuests, getQuestById } from '@services/Lesson';
import { createClassQuest } from '@services/ClassQuest';
import AsyncSelectField from '@components/form/AsyncSelectField';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import clsx from 'clsx';
// Import do Auth
import { useAuth } from '../../../../../../src/app/modules/auth';

const addQuestSchema = Yup.object().shape({
  classIds: Yup.array().of(Yup.string()).min(1, 'Selecione pelo menos uma turma'),
  questId: Yup.string().required('Selecione uma aula'),
  startDate: Yup.date().required('Data de início é obrigatória'),
  expirationDate: Yup.date()
    .required('Data de expiração é obrigatória')
    .min(Yup.ref('startDate'), 'Data de expiração deve ser posterior à data de início'),
});

const AddQuestToClass: FC = () => {
  const { currentUser } = useAuth(); // Hook para pegar o ID do professor
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preSelectedQuestId = searchParams.get('questId');
  
  // Filtros manuais
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [questOptions, setQuestOptions] = useState<any[]>([]);

  // Carregar turmas ao iniciar
  React.useEffect(() => {
    loadClassOptions('').then(setClassOptions);
  }, [currentUser]);

  // Carregar aulas quando os filtros mudarem
  React.useEffect(() => {
    loadQuestOptions('').then(setQuestOptions);
  }, [filterYear, filterSubject, currentUser]);

  const formik = useFormik({
    initialValues: {
      classIds: [] as string[],
      questId: preSelectedQuestId || '',
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date().toISOString().split('T')[0],
    },
    validationSchema: addQuestSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const startDate = new Date(values.startDate);
        startDate.setHours(0, 0, 0, 0);

        const expirationDate = new Date(values.expirationDate);
        expirationDate.setHours(23, 59, 59, 999);

        // Criar ClassQuest para cada turma selecionada
        const promises = values.classIds.map((classId) =>
          createClassQuest({
            classId,
            questId: values.questId,
            startDate: startDate.toISOString(),
            expirationDate: expirationDate.toISOString(),
          })
        );

        await Promise.all(promises);

        const turmasCount = values.classIds.length;
        toast.success(`Aula adicionada a ${turmasCount} turma${turmasCount > 1 ? 's' : ''} com sucesso!`);

        resetForm();
        setFilterYear('');
        setFilterSubject('');

        queryClient.invalidateQueries(['class-quests']);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.title ||
          error.response?.data?.message ||
          'Erro ao adicionar aula às turmas.';
        toast.error(errorMessage);
        console.error('Erro ao adicionar aula:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Carregar aula pré-selecionada via URL parameter
  React.useEffect(() => {
    if (preSelectedQuestId) {
      getQuestById(preSelectedQuestId)
        .then((response) => {
          const quest = response.data;
          const questOption = { value: quest.id, label: quest.name || 'Sem nome' };
          setQuestOptions((prev) => {
            const exists = prev.some((opt) => opt.value === quest.id);
            if (!exists) {
              return [questOption, ...prev];
            }
            return prev;
          });
        })
        .catch((error) => {
          console.error('Erro ao carregar aula pré-selecionada:', error);
          toast.error('Erro ao carregar aula. Verifique se ela existe.');
        });
    }
  }, [preSelectedQuestId]);

  // --- 1. CARREGAR TURMAS (Filtrar se o professor está nela) ---
  const loadClassOptions = async (inputValue: string) => {
    try {
      const response = await getClasses({ page: 1, pageSize: 1000 });
      let classes: any[] = [];

      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        classes = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        classes = response.data;
      }

      // REGRA DE NEGÓCIO: Se não for Admin, filtrar apenas turmas onde o professor está vinculado
      if (currentUser && !currentUser.roles?.includes('Admin')) {
          classes = classes.filter((c: any) => {
              // Verifica nas listas de IDs da turma (teacherIds ou accountIds)
              const teachers = c.teacherIds || [];
              const accounts = c.accountIds || [];
              const allMembers = [...teachers, ...accounts];
              
              return allMembers.includes(currentUser.id);
          });
      }

      // Filtro de texto (Input do usuário)
      const filtered = inputValue
        ? classes.filter((classItem: any) =>
            classItem.name && classItem.name.toLowerCase().includes(inputValue.toLowerCase())
          )
        : classes;

      return filtered.map((classItem: any) => ({
        value: classItem.id,
        label: `${classItem.name} - ${classItem.schoolYear || ''}`,
        schoolYear: classItem.schoolYear
      }));
    } catch (error: any) {
      console.error('Erro ao carregar turmas:', error.message);
      toast.error('Erro ao carregar turmas');
      return [];
    }
  };

  // --- 2. CARREGAR AULAS (Filtrar se o professor criou) ---
  const loadQuestOptions = async (inputValue: string) => {
    try {
      const [templatesResponse, normalQuestsResponse] = await Promise.all([
        getQuests(true), 
        getQuests(false),
      ]);

      let quests: any[] = [];

      if (templatesResponse.data && 'data' in templatesResponse.data && Array.isArray(templatesResponse.data.data)) {
        quests = [...templatesResponse.data.data];
      }

      if (normalQuestsResponse.data && 'data' in normalQuestsResponse.data && Array.isArray(normalQuestsResponse.data.data)) {
        quests = [...quests, ...normalQuestsResponse.data.data];
      }

      // REGRA DE NEGÓCIO: Filtrar aulas criadas pelo professor (se não for Admin)
      if (currentUser && !currentUser.roles?.includes('Admin')) {
         quests = quests.filter((quest: any) => quest.createdBy === currentUser.id);
      }

      // Filtros manuais (Ano e Matéria)
      if (filterYear) {
        quests = quests.filter((quest: any) => {
          if (!quest.grade) return false;
          const gradeName = typeof quest.grade === 'string' ? quest.grade : quest.grade.name;
          return gradeName && gradeName.includes(filterYear);
        });
      }

      if (filterSubject) {
        quests = quests.filter((quest: any) => {
          if (!quest.subject) return false;
          const subjectName = typeof quest.subject === 'string' ? quest.subject : quest.subject.name;
          return subjectName && subjectName.toLowerCase().includes(filterSubject.toLowerCase());
        });
      }

      // Filtro de texto
      const filtered = inputValue
        ? quests.filter((quest: any) =>
            quest.name && quest.name.toLowerCase().includes(inputValue.toLowerCase())
          )
        : quests;

      return filtered.map((quest: any) => ({
        value: quest.id,
        label: quest.name || 'Sem nome',
      }));
    } catch (error: any) {
      console.error('Erro ao carregar aulas:', error.message);
      toast.error('Erro ao carregar aulas');
      return [];
    }
  };

  return (
    <div className='card'>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>Adicionar Aula à Turma</span>
          <span className='text-muted fw-semibold fs-7'>
            Vincule uma aula a uma turma com data de expiração
          </span>
        </h3>
      </div>

      <div className='card-body py-3'>
        <form onSubmit={formik.handleSubmit} noValidate className='form'>
          {/* Filtros */}
          <div className='row mb-8'>
            <div className='col-md-6'>
              <label className='form-label'>Filtrar por Ano Escolar</label>
              <select
                className='form-select form-select-solid'
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value=''>Todos os anos</option>
                <optgroup label='Ensino Fundamental'>
                  <option value='1º ano'>1º ano</option>
                  <option value='2º ano'>2º ano</option>
                  <option value='3º ano'>3º ano</option>
                  <option value='4º ano'>4º ano</option>
                  <option value='5º ano'>5º ano</option>
                  <option value='6º ano'>6º ano</option>
                  <option value='7º ano'>7º ano</option>
                  <option value='8º ano'>8º ano</option>
                  <option value='9º ano'>9º ano</option>
                </optgroup>
                <optgroup label='Ensino Médio'>
                  <option value='1° EM'>1° EM</option>
                  <option value='2° EM'>2° EM</option>
                  <option value='3° EM'>3° EM</option>
                </optgroup>
              </select>
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Filtrar por Matéria</label>
              <input
                type='text'
                className='form-control form-control-solid'
                placeholder='Digite o nome da matéria...'
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              />
            </div>
          </div>

          <div className='separator mb-8'></div>

          {/* Seleção de Turmas (múltiplas) */}
          <div className='mb-10 fv-row'>
            <label className='form-label'>Turmas *</label>
            {formik.values.classIds && formik.values.classIds.length > 0 && (
              <div className='mb-4'>
                <div className='d-flex flex-wrap gap-2'>
                  {formik.values.classIds.map((classId: string) => {
                    const classItem = classOptions.find((opt) => opt.value === classId);
                    return classItem ? (
                      <span key={classId} className='badge badge-light badge-lg d-inline-flex align-items-center gap-2'>
                        {classItem.label}
                        <button
                          type='button'
                          className='btn btn-sm btn-icon btn-active-color-primary p-0'
                          onClick={() => {
                            const updated = formik.values.classIds.filter((id: string) => id !== classId);
                            formik.setFieldValue('classIds', updated);
                          }}
                        >
                          <i className='bi bi-x fs-3'></i>
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <AsyncSelectField
              label='Buscar Turmas'
              fieldName='classIds'
              placeholder='Digite para buscar turmas...'
              loadOptions={(inputValue, callback) => {
                loadClassOptions(inputValue).then(callback);
              }}
              formik={formik}
              defaultOptions={classOptions}
              isMulti={true}
            />
            {formik.touched.classIds && formik.errors.classIds && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.classIds as string}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seleção de Aula */}
          <div key={`${filterYear}-${filterSubject}`} className='mb-10 fv-row'>
            <AsyncSelectField
              label='Aula *'
              fieldName='questId'
              placeholder='Digite para buscar uma aula...'
              loadOptions={(inputValue, callback) => {
                loadQuestOptions(inputValue).then(callback);
              }}
              formik={formik}
              defaultOptions={questOptions}
            />
            {formik.touched.questId && formik.errors.questId && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.questId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Data de Início e Expiração */}
          <div className='mb-10 fv-row'>
            <label className='form-label required'>Data de Início</label>
            <input
              type='date'
              className={clsx('form-control form-control-solid form-control-lg', {
                'is-invalid': formik.touched.startDate && formik.errors.startDate,
              })}
              {...formik.getFieldProps('startDate')}
            />
            {formik.touched.startDate && formik.errors.startDate && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.startDate}</span>
                </div>
              </div>
            )}
          </div>

          <div className='mb-10 fv-row'>
            <label className='form-label required'>Data de Expiração</label>
            <input
              type='date'
              className={clsx('form-control form-control-solid form-control-lg', {
                'is-invalid': formik.touched.expirationDate && formik.errors.expirationDate,
              })}
              {...formik.getFieldProps('expirationDate')}
            />
            {formik.touched.expirationDate && formik.errors.expirationDate && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.expirationDate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className='text-center pt-5'>
            <button
              type='button'
              className='btn btn-light me-3'
              onClick={() => {
                formik.resetForm();
              }}
              disabled={formik.isSubmitting}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  <span className='ms-2'>Adicionando...</span>
                </>
              ) : (
                `Adicionar Aula ${formik.values.classIds.length > 1 ? `às ${formik.values.classIds.length} Turmas` : 'à Turma'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddQuestToClassWrapper: FC = () => {
  return <AddQuestToClass />;
};

export { AddQuestToClassWrapper };