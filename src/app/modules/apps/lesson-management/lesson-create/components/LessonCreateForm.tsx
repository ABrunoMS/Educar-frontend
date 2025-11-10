import React, { useState, useEffect } from 'react';
import { useFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { SelectOptions } from '@interfaces/Forms';
import { Class } from '@interfaces/Class';
import { SchoolType } from '@interfaces/School';
import { PaginatedResponse } from '@contexts/PaginationContext';
import { Quest, QuestStep } from '@interfaces/Lesson';

import { getSchools, getSchoolsByClient } from '@services/Schools';
import { getClassesBySchools } from '@services/Classes';
import { createQuest, createQuestStep, updateQuest } from '@services/Lesson';
import { useAuth } from '../../../../auth/core/Auth';

type Props = {
  lesson?: Quest;
  isEditing?: boolean;
  onFormSubmit?: () => void;
};

type OptionType = SelectOptions;

const LessonCreateForm: React.FC<Props> = ({ lesson, isEditing = false, onFormSubmit }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [schoolOptions, setSchoolOptions] = useState<OptionType[]>([]);
  const [classOptions, setClassOptions] = useState<OptionType[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [disciplines] = useState<OptionType[]>([
    { value: '1', label: 'Matemática' },
    { value: '2', label: 'Português' },
  ]);

  const [schoolYears] = useState<OptionType[]>([
    { value: '6', label: '6º Ano' },
    { value: '7', label: '7º Ano' },
  ]);

  const bnccOptions = [
    'BNCC',
    'Saeb',
    'Enem',
    'Educação financeira',
    'Empreendedorismo',
    'Jornada do trabalho',
  ];

  const validationSchema = Yup.object().shape({
    Name: Yup.string().required('Nome da aula obrigatório'),
    Description: Yup.string().required('Descrição obrigatória'),
    school: Yup.string().required('Escola obrigatória'),
    class: Yup.string().required('Turma obrigatória'),
    discipline: Yup.string().required('Disciplina obrigatória'),
    schoolYear: Yup.string().required('Ano escolar obrigatório'),
    UsageTemplate: Yup.string().required('Template obrigatório'),
    Type: Yup.string().required('Tipo obrigatório'),
    MaxPlayers: Yup.number().min(1).required('Máximo de jogadores obrigatório'),
    TotalQuestSteps: Yup.number().min(1).required('Total de etapas obrigatório'),
    CombatDifficulty: Yup.string().required('Dificuldade obrigatória'),
    bncc: Yup.array().min(1, 'Selecione ao menos uma opção BNCC'),
  });

  const formik = useFormik({
    initialValues: {
      Name: lesson?.Name || '',
      Description: lesson?.Description || '',
      school: '',
      class: '',
      discipline: '',
      schoolYear: '',
      UsageTemplate: lesson?.UsageTemplate || 'Global',
      Type: lesson?.Type || 'SinglePlayer',
      MaxPlayers: lesson?.MaxPlayers || 2,
      TotalQuestSteps: lesson?.TotalQuestSteps || 1,
      CombatDifficulty: lesson?.CombatDifficulty || 'Passive',
      bncc: [] as string[],
    },
    validationSchema,
    enableReinitialize: true, // Permite reinicializar quando lesson mudar
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        
        // 1. Preparar dados da Quest
        const questData: Quest = {
          Name: values.Name,
          Description: values.Description,
          UsageTemplate: values.UsageTemplate,
          Type: values.Type,
          MaxPlayers: values.MaxPlayers,
          TotalQuestSteps: values.TotalQuestSteps,
          CombatDifficulty: values.CombatDifficulty,
        };

        if (isEditing && lesson?.Name) {
          // Modo edição - atualizar quest existente
          await updateQuest(lesson.Name, questData); // Assumindo que Name é o ID
          alert('Aula atualizada com sucesso!');
          if (onFormSubmit) onFormSubmit();
        } else {
          // Modo criação - criar nova quest
          const questResponse = await createQuest(questData);
          const questId = questResponse.data.id;

          // 3. Criar uma etapa inicial apenas se for criação
         /* const questStepData: QuestStep = {
            name: `Etapa 1 - ${values.Name}`,
            description: 'Etapa inicial da aula',
            order: 1,
            npcType: 'Passive',
            npcBehaviour: 'StandStill',
            questStepType: 'Npc',
            questId: questId,
            contents: [
              {
                questStepContentType: 'Exercise',
                questionType: 'MultipleChoice',
                description: 'Questão inicial',
                weight: 10.0,
                expectedAnswers: {
                  questionType: 'MultipleChoice',
                  options: [
                    {
                      description: 'Opção A',
                      is_correct: false,
                    },
                    {
                      description: 'Opção B',
                      is_correct: true,
                    },
                  ],
                },
              },
            ],
          };

          await createQuestStep(questStepData);*/

          alert('Aula criada com sucesso!');
          if (onFormSubmit) {
            onFormSubmit();
          } else {
            navigate(`../steps/${questId}`);
          }
        }
      } catch (error) {
        console.error('Erro ao salvar a aula:', error);
        alert('Erro ao salvar aula. Tente novamente.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Carregar escolas
 useEffect(() => {
    
  if (!currentUser) return; 

  setIsLoadingSchools(true);

    
  if (currentUser.roles?.includes('Admin')) {
        
     getSchools()
            .then((res: { data: PaginatedResponse<SchoolType> }) => {
          const options: OptionType[] = res.data.data
                  .filter((school): school is SchoolType & { id: string } => school.id !== undefined)
           .map((school) => ({
            value: school.id,
            label: school.name || '',
           }));
          setSchoolOptions(options);
         })
            .catch((error) => console.error('Erro ao carregar escolas (Admin):', error))
         .finally(() => setIsLoadingSchools(false));
      } 
    
    else if (currentUser.schools?.length) { 
     const options = currentUser.schools.map((school) => ({
      value: school.id,
      label: school.name,
     }));
     setSchoolOptions(options);

        
        if (options.length === 1 && !formik.values.school) {
      formik.setFieldValue('school', options[0].value);
     }
        setIsLoadingSchools(false);
  } 
    else {
        
        console.warn("Usuário não é Admin e não tem escolas associadas no currentUser.");
        setIsLoadingSchools(false);
        setSchoolOptions([]); 
    }
  // eslint-disable-next-line
 }, [currentUser]); 

  // Carregar turmas ao selecionar escola
  useEffect(() => {
    const selectedSchoolId = formik.values.school;

    if (!selectedSchoolId) {
      setClassOptions([]);
      return;
    }

    setIsLoadingClasses(true);
    getClassesBySchools([selectedSchoolId])
      .then((res: { data: Class[] }) => {
        const options: OptionType[] = res.data.map((classItem: Class) => ({
          value: classItem.id,
          label: classItem.name,
        }));

        setClassOptions(options);

        if (!options.some((opt) => opt.value === formik.values.class)) {
          formik.setFieldValue('class', '');
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar turmas:', error);
        setClassOptions([]);
      })
      .finally(() => setIsLoadingClasses(false));
  }, [formik.values.school]);

  return (
    <div className="w-100">
      <form
        onSubmit={formik.handleSubmit}
        className="form pb-8 d-flex flex-column gap-4"
        noValidate
      >
        {/* Seção 1 - Informações básicas */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Informações básicas</h6>
          <div className="row g-4">
            <div className="col-md-6">
              <BasicField
                fieldName="Name"
                label="Nome da Aula"
                placeholder="Digite o nome da aula"
                required
                formik={formik}
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="schoolYear"
                label="Ano escolar"
                placeholder="---"
                options={schoolYears}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="discipline"
                label="Disciplina"
                placeholder="---"
                options={disciplines}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="Type"
                label="Tipo da Aula"
                placeholder="---"
                options={[
                  { value: 'SinglePlayer', label: 'Individual' },
                  { value: 'MultiPlayer', label: 'Multiplayer' }
                ]}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
              />
            </div>
            <div className="col-12">
              <BasicField
                fieldName="Description"
                label="Descrição"
                placeholder="Descrição da aula"
                required
                formik={formik}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Seção 2 - Configurações da Quest */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Configurações da Aula</h6>
          <div className="row g-4">
            <div className="col-md-4">
              <SelectField
                fieldName="UsageTemplate"
                label="Template"
                placeholder="---"
                options={[
                  { value: 'Global', label: 'Global' },
                  { value: 'Local', label: 'Local' }
                ]}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
              />
            </div>
            <div className="col-md-4">
              <BasicField
                fieldName="MaxPlayers"
                label="Máximo de Jogadores"
                placeholder="2"
                required
                formik={formik}
                type="number"
              />
            </div>
            <div className="col-md-4">
              <BasicField
                fieldName="TotalQuestSteps"
                label="Total de Etapas"
                placeholder="1"
                required
                formik={formik}
                type="number"
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="CombatDifficulty"
                label="Dificuldade de Combate"
                placeholder="---"
                options={[
                  { value: 'Passive', label: 'Passivo' },
                  { value: 'Easy', label: 'Fácil' },
                  { value: 'Medium', label: 'Médio' },
                  { value: 'Hard', label: 'Difícil' }
                ]}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
              />
            </div>
          </div>
        </div>

        {/* Seção 3 - Escola e Turma */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Escola e Turma</h6>
          <div className="row g-4">
            <div className="col-md-6">
              <SelectField
                fieldName="school"
                label="Escola"
                placeholder="---"
                options={schoolOptions}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
                loading={isLoadingSchools}
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="class"
                label="Turma"
                placeholder={formik.values.school ? '---' : 'Selecione uma escola primeiro'}
                options={classOptions}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
                loading={isLoadingClasses}
                isDisabled={!formik.values.school || isLoadingClasses}
              />
            </div>
          </div>
        </div>

        {/* Seção 3 - Diretrizes */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Diretrizes</h6>
          <div className="row g-4">
            {/* BNCC */}
            <div className="col-12">
              <label className="form-label fw-semibold mb-2 required">BNCC</label>
              <div className="d-flex flex-wrap gap-2">
                {bnccOptions.map((opt) => {
                  const checked = formik.values.bncc.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={clsx(
                        'btn btn-sm rounded-pill',
                        checked
                          ? 'btn-primary'
                          : 'btn-outline-secondary text-muted'
                      )}
                      onClick={() => {
                        const newValues = checked
                          ? formik.values.bncc.filter((v) => v !== opt)
                          : [...formik.values.bncc, opt];
                        formik.setFieldValue('bncc', newValues);
                        formik.setFieldTouched('bncc', true);
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Mensagem de erro padronizada */}
              <div className="mt-2" style={{ minHeight: '18px' }}>
                {(formik.touched.bncc || formik.submitCount > 0) &&
                  formik.errors.bncc && (
                    <div className="text-danger small">{formik.errors.bncc as string}</div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerta */}
        <div className="alert alert-info py-2 px-3 d-flex align-items-center gap-2">
          <i className="bi bi-info-circle fs-5"></i>
          <span>Salve a aula antes de vincular etapas e alunos.</span>
        </div>

        {/* Botões */}
        <div className="d-flex justify-content-end gap-3 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              if (onFormSubmit) {
                onFormSubmit();
              } else {
                navigate('/apps/lesson-management/lessons');
              }
            }}
          >
            {isEditing ? 'Cancelar' : 'Voltar'}
          </button>

          <button
            type="submit"
            className="btn btn-primary px-5 fw-bold"
            disabled={formik.isSubmitting || isLoadingSchools || isLoadingClasses}
          >
            {formik.isSubmitting ? (
              <>
                <span>Aguarde...</span>
                <span className="spinner-border spinner-border-sm ms-2"></span>
              </>
            ) : (
              isEditing ? 'Atualizar aula' : 'Salvar e continuar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonCreateForm;
