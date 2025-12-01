import React, { useState, useEffect } from 'react';
import { useFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { SelectOptions } from '@interfaces/Forms';
import { Class } from '@interfaces/Class';
import { SchoolType } from '@interfaces/School';
import { PaginatedResponse } from '@contexts/PaginationContext';
import { Quest, QuestStep } from '@interfaces/Lesson';

import { getSchools } from '@services/Schools'; // Se tiver getSchoolsByClient, importe também
import { getClassesBySchools } from '@services/Classes';
import { createQuest, updateQuest, getQuestById, getBnccContents } from '@services/Lesson';
import { useAuth } from '../../../../auth/core/Auth';

type Props = {
  lesson?: Quest;
  isEditing?: boolean;
  onFormSubmit?: () => void;
};

type OptionType = SelectOptions;

const LessonCreateForm: React.FC<Props> = ({ lesson: initialLesson, isEditing = false, onFormSubmit }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Hooks de URL e Estado
  const [searchParams] = useSearchParams();
  const sourceTemplateId = searchParams.get('sourceTemplateId');
  
  const [clonedData, setClonedData] = useState<Quest | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Estados para Selects
  const [schoolOptions, setSchoolOptions] = useState<OptionType[]>([]);
  const [classOptions, setClassOptions] = useState<OptionType[]>([]);
  const [bnccOptions, setBnccOptions] = useState<OptionType[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingBncc, setIsLoadingBncc] = useState(false);

  // Dados estáticos
  const [disciplines] = useState<OptionType[]>([
    { value: '1', label: 'Matemática' },
    { value: '2', label: 'Português' },
  ]);

  const [schoolYears] = useState<OptionType[]>([
    { value: '6', label: '6º Ano' },
    { value: '7', label: '7º Ano' },
  ]);

  // --- EFEITO: Carregar Template (se houver sourceTemplateId) ---
  useEffect(() => {
    if (sourceTemplateId) {
      setIsLoadingTemplate(true);
      getQuestById(sourceTemplateId)
        .then((response) => {
          setClonedData(response.data as Quest);
        })
        .catch(err => {
            console.error("Erro ao carregar template", err);
            alert("Erro ao carregar o modelo.");
        })
        .finally(() => setIsLoadingTemplate(false));
    }
  }, [sourceTemplateId]);

  // --- LÓGICA DE DADOS ATIVOS ---
  // Determina qual conjunto de dados usar para preencher o formulário
  const activeData = isEditing ? initialLesson : (clonedData || undefined);

  // Encontrar IDs baseados nos Labels (para Disciplina e Ano Escolar)
  // Se activeData.subject for "Matemática", achamos o ID "1"
  const initialDisciplineId = disciplines.find(d => d.label === activeData?.subject)?.value || '';
  const initialSchoolYearId = schoolYears.find(s => s.label === activeData?.grade)?.value || '';

  // --- SCHEMA DE VALIDAÇÃO ---
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Nome da aula obrigatório'),
    description: Yup.string().required('Descrição obrigatória'),
    school: Yup.string().required('Escola obrigatória'),
    class: Yup.string().required('Turma obrigatória'),
    discipline: Yup.string().required('Disciplina obrigatória'),
    schoolYear: Yup.string().required('Ano escolar obrigatório'),
    usageTemplate: Yup.boolean().required('Template obrigatório'),
    type: Yup.string().required('Tipo obrigatório'),
    maxPlayers: Yup.number().min(1).required('Máximo de jogadores obrigatório'),
    totalQuestSteps: Yup.number().min(1).required('Total de etapas obrigatório'),
    combatDifficulty: Yup.string().required('Dificuldade obrigatória'),
    bncc: Yup.array().min(1, 'Selecione ao menos uma opção BNCC'),
  });

  // --- FORMIK ---
  const formik = useFormik({
    initialValues: {
      // Se for template clonado, adiciona "(Cópia)" no nome
      name: activeData?.name ? (sourceTemplateId ? `${activeData.name} (Cópia)` : activeData.name) : '',
      description: activeData?.description || '',
      school: '', // O usuário deve selecionar a escola novamente (pois é uma nova aula dele)
      class: '',  // O usuário deve selecionar a turma novamente
      discipline: initialDisciplineId, 
      schoolYear: initialSchoolYearId,
      
      // Se for clonagem, o padrão é NÃO ser template (false). Se for edição, mantém.
      usageTemplate: sourceTemplateId ? false : (activeData?.usageTemplate ?? true),
      
      type: activeData?.type || 'SinglePlayer',
      maxPlayers: activeData?.maxPlayers || 2,
      totalQuestSteps: activeData?.totalQuestSteps || 1,
      combatDifficulty: activeData?.combatDifficulty || 'Passive',
      bncc: activeData?.proficiencies || [],
    },
    validationSchema,
    enableReinitialize: true, // Permite atualizar o form quando o template carregar
    
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);

        // Converter IDs de volta para Labels para enviar ao backend
        const disciplineLabel = disciplines.find(d => d.value === values.discipline)?.label || '';
        const schoolYearLabel = schoolYears.find(s => s.value === values.schoolYear)?.label || '';
        
        // Preparar dados da Quest
        const questData: Quest = {
          // Se for edição, usa o ID original. Se for novo/clone, undefined.
          id: isEditing ? initialLesson?.id : undefined,
          name: values.name,
          description: values.description,
          usageTemplate: values.usageTemplate,
          type: values.type,
          maxPlayers: values.maxPlayers,
          totalQuestSteps: values.totalQuestSteps,
          combatDifficulty: values.combatDifficulty,
          
          // Se tiver steps do activeData (template/edição), usamos eles.
          // Mas a limpeza de IDs será feita abaixo se for criação.
          questSteps: activeData?.questSteps || [],
          
          subject: disciplineLabel,
          grade: schoolYearLabel,
          proficiencies: values.bncc,
        };

        if (isEditing && initialLesson?.id) {
          // --- MODO EDIÇÃO ---
          await updateQuest(initialLesson.id, questData); 
          alert('Aula atualizada com sucesso!');
          if (onFormSubmit) onFormSubmit();
        } else {
          // --- MODO CRIAÇÃO / CLONAGEM ---
          
          // Remove explicitamente o ID da Quest para criar uma nova
          delete (questData as Partial<Quest>).id;
          
          // Se tiver steps (vindo do template), precisamos limpar os IDs
          // para que o backend crie novos steps em vez de tentar atualizar os antigos
          if (questData.questSteps && questData.questSteps.length > 0) {
              questData.questSteps = questData.questSteps.map(step => ({
                  ...step,
                  id: undefined, // Limpa ID da etapa
                  questId: undefined, // Limpa vínculo com a quest antiga
                  contents: step.contents.map(content => ({
                      ...content,
                      id: undefined // Limpa ID do conteúdo
                  }))
              }));
          }

          const response = await createQuest(questData);
          const newId = response.data.id;

          alert('Aula criada com sucesso!');
          // Redireciona para a tela de etapas da NOVA aula criada
          navigate(`../steps/${newId}`);
        }
      } catch (error) {
        console.error('Erro ao salvar a aula:', error);
        alert('Erro ao salvar aula. Tente novamente.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- EFEITOS DE CARREGAMENTO (Escolas/Turmas) ---

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

  // Carregar BNCC via API
  useEffect(() => {
    setIsLoadingBncc(true);
    getBnccContents()
      .then((res: { data: any[] }) => {
        // Mapeia corretamente os campos do backend
        const options = res.data.map((item) => ({ value: item.id ?? item.Id, label: item.description ?? item.Description }));
        setBnccOptions(options);
      })
      .catch(() => setBnccOptions([]))
      .finally(() => setIsLoadingBncc(false));
  }, []);

  if (isLoadingTemplate) {
      return <div className="text-center p-10"><h3>Carregando modelo de aula...</h3></div>;
  }

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
                fieldName="name"
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
                fieldName="type"
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
                fieldName="description"
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
            <div className="col-md-4 d-flex align-items-center pt-5">
              <div className="form-check form-switch form-check-custom form-check-solid">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="usageTemplateToggle"
                  name="usageTemplate"
                  checked={formik.values.usageTemplate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <label className="form-check-label ms-3 text-gray-700" htmlFor="usageTemplateToggle">
                  Template
                </label>
              </div>
              {formik.touched.usageTemplate && formik.errors.usageTemplate && (
                <div className="fv-plugins-message-container invalid-feedback d-block">
                  {formik.errors.usageTemplate}
                </div>
              )}
            </div>
            <div className="col-md-4">
              <BasicField
                fieldName="maxPlayers"
                label="Máximo de Jogadores"
                placeholder="2"
                required
                formik={formik}
                type="number"
              />
            </div>
            <div className="col-md-4">
              <BasicField
                fieldName="totalQuestSteps"
                label="Total de Etapas"
                placeholder="1"
                required
                formik={formik}
                type="number"
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="combatDifficulty"
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
        {!formik.values.usageTemplate && (
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
        )}

        {/* Seção 3 - Diretrizes */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Diretrizes</h6>
          <div className="row g-4">
            {/* BNCC */}
            <div className="col-12">
              <SelectField
                fieldName="bncc"
                label="BNCC"
                placeholder="Selecione conteúdos BNCC"
                options={bnccOptions}
                required
                multiselect
                formik={formik as FormikProps<any>}
                loading={isLoadingBncc}
              />
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