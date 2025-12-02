import React, { useState, useEffect } from 'react';
import { useFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios'; // Necessário para buscar Grades (já que não tem no service exportado)

import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { SelectOptions } from '@interfaces/Forms';
import { Class } from '@interfaces/Class';
import { SchoolType } from '@interfaces/School';
import { PaginatedResponse } from '@contexts/PaginationContext';
import { Quest } from '@interfaces/Lesson';

// Serviços
import { getSchools } from '@services/Schools';
import { getClassesBySchools } from '@services/Classes';
import { createQuest, updateQuest, getQuestById, getBnccContents } from '@services/Lesson';
import { getSubjects } from '@services/Subjects'; // Importe o serviço de matérias
// import { getGrades } from '@services/Grades'; // Se você criar essa função no futuro

import { useAuth } from '../../../../auth/core/Auth';

// URL da API para chamar Grades manualmente se necessário
const API_URL = import.meta.env.VITE_API_BASE_URL;

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
  
  // --- NOVOS ESTADOS PARA DADOS REAIS ---
  const [disciplines, setDisciplines] = useState<OptionType[]>([]);
  const [schoolYears, setSchoolYears] = useState<OptionType[]>([]);
  // --------------------------------------

  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingBncc, setIsLoadingBncc] = useState(false);
  
  // Loading para as novas opções
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false);
  const [isLoadingSchoolYears, setIsLoadingSchoolYears] = useState(false);

  // --- 1. CARREGAR DADOS REAIS (Matérias e Anos) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDisciplines(true);
      setIsLoadingSchoolYears(true);
      try {
        // Buscar Matérias (Subjects)
        const subjectsResponse = await getSubjects();
        // Verifica estrutura da resposta (pode ser .data ou .data.data dependendo da paginação)
        const subjectsList = subjectsResponse.data.data || subjectsResponse.data || [];
        
        const subjectOpts = Array.isArray(subjectsList) ? subjectsList.map((s: any) => ({
             value: s.id, 
             label: s.name 
        })) : [];
        setDisciplines(subjectOpts);

        // Buscar Anos Escolares (Grades)
        // Nota: Como seu arquivo de service não exportou 'getGrades', chamamos direto aqui
        const gradesResponse = await axios.get(`${API_URL}/api/Grades?PageNumber=1&PageSize=999`);
        const gradesList = gradesResponse.data.data || gradesResponse.data || [];

        const gradeOpts = Array.isArray(gradesList) ? gradesList.map((g: any) => ({
            value: g.id,
            label: g.name
        })) : [];
        setSchoolYears(gradeOpts);

      } catch (error) {
        console.error("Erro ao carregar opções de Matéria/Ano:", error);
      } finally {
        setIsLoadingDisciplines(false);
        setIsLoadingSchoolYears(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. CARREGAR TEMPLATE (se houver ID na URL) ---
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

  // --- 3. DEFINIR DADOS ATIVOS ---
  const activeData = isEditing ? initialLesson : (clonedData || undefined);

  // --- 4. CALCULAR VALORES INICIAIS DOS SELECTS ---
  // Precisamos garantir que o Formik inicie com o ID. 
  // Se o activeData vier com ID (ideal), usamos. Se vier com Nome, tentamos achar o ID no array.
  
  const initialDisciplineId = activeData?.subjectId 
      || disciplines.find(d => d.label === activeData?.subject)?.value 
      || '';
      
  const initialSchoolYearId = activeData?.gradeId 
      || schoolYears.find(s => s.label === activeData?.grade)?.value 
      || '';

  // --- SCHEMA ---
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
      name: activeData?.name ? (sourceTemplateId ? `${activeData.name} (Cópia)` : activeData.name) : '',
      description: activeData?.description || '',
      school: '', 
      class: '',
      
      // Valores calculados acima
      discipline: initialDisciplineId, 
      schoolYear: initialSchoolYearId,
      
      usageTemplate: sourceTemplateId ? false : (activeData?.usageTemplate ?? true),
      type: activeData?.type || 'SinglePlayer',
      maxPlayers: activeData?.maxPlayers || 2,
      totalQuestSteps: activeData?.totalQuestSteps || 1,
      combatDifficulty: activeData?.combatDifficulty || 'Passive',
      bncc: activeData?.proficiencies || [],
    },
    validationSchema,
    enableReinitialize: true, 
    
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        
        // Preparar dados da Quest
        // Usamos 'any' no questData temporariamente para permitir enviar campos extras como subjectId/gradeId
        // se a interface Quest não tiver esses campos definidos ainda.
        const questData: any = {
          id: isEditing ? initialLesson?.id : undefined,
          name: values.name,
          description: values.description,
          usageTemplate: values.usageTemplate,
          type: values.type,
          maxPlayers: values.maxPlayers,
          totalQuestSteps: values.totalQuestSteps,
          combatDifficulty: values.combatDifficulty,
          
          // Dados de Relacionamento
          // Enviamos o ID direto (values.discipline já é o ID selecionado no select)
          subjectId: values.discipline, 
          gradeId: values.schoolYear,
          proficiencies: values.bncc, // Assumindo que o backend espera array de strings ou IDs

          // Fallback de nomes (caso o backend espere nomes e não IDs - ajuste conforme sua API)
          subject: disciplines.find(d => d.value === values.discipline)?.label,
          grade: schoolYears.find(s => s.value === values.schoolYear)?.label,

          questSteps: activeData?.questSteps || [],
        };

        if (isEditing && initialLesson?.id) {
          // --- MODO EDIÇÃO ---
          await updateQuest(initialLesson.id, questData); 
          alert('Aula atualizada com sucesso!');
          if (onFormSubmit) onFormSubmit();
        } else {
          // --- MODO CRIAÇÃO / CLONAGEM ---
          delete questData.id;
          
          // Limpeza profunda de IDs para clonagem
          if (questData.questSteps && questData.questSteps.length > 0) {
              questData.questSteps = questData.questSteps.map((step: any) => ({
                  ...step,
                  id: undefined, 
                  questId: undefined, 
                  contents: step.contents.map((content: any) => ({
                      ...content,
                      id: undefined
                  }))
              }));
          }

          const response = await createQuest(questData);
          // O backend deve retornar o ID da nova aula criada
          const newId = response.data.id; // Certifique-se que é .id ou .Id

          alert('Aula criada com sucesso!');
          navigate(`../steps/${newId}`);
        }
      } catch (error) {
        console.error('Erro ao salvar a aula:', error);
        alert('Erro ao salvar aula. Verifique os dados.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- EFEITOS DE ESCOLAS (Mantido do seu código) ---
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
           .catch((error) => console.error('Erro ao carregar escolas:', error))
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
        setIsLoadingSchools(false);
        setSchoolOptions([]); 
    }
    // eslint-disable-next-line
  }, [currentUser]); 

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

  // --- BNCC ---
  useEffect(() => {
    setIsLoadingBncc(true);
    getBnccContents()
      .then((res: { data: any[] }) => {
        // Ajuste conforme o retorno real da sua API de BNCC
        const options = res.data.map((item) => ({ 
            value: item.id || item.Id, 
            label: item.description || item.Description || item.code 
        }));
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
                placeholder={isLoadingSchoolYears ? "Carregando..." : "Selecione..."}
                options={schoolYears}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
                loading={isLoadingSchoolYears}
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="discipline"
                label="Disciplina"
                placeholder={isLoadingDisciplines ? "Carregando..." : "Selecione..."}
                options={disciplines}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
                loading={isLoadingDisciplines}
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

        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Configurações da Aula</h6>
          <div className="row g-4">
            {/* SWITCH DE TEMPLATE */}
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
                  Template Global
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

        {/* ESCOLAS - Apenas se NÃO for template global, ou conforme sua regra de negócio */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
            <h6 className="fw-semibold text-muted mb-3">Escola e Turma</h6>
            <div className="row g-4">
              <div className="col-md-6">
                <SelectField
                  fieldName="school"
                  label="Escola"
                  placeholder="---"
                  options={schoolOptions}
                  required={!formik.values.usageTemplate} // Opcional se for template?
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
                  required={!formik.values.usageTemplate} // Opcional se for template?
                  multiselect={false}
                  formik={formik as FormikProps<any>}
                  loading={isLoadingClasses}
                  isDisabled={!formik.values.school || isLoadingClasses}
                />
              </div>
            </div>
        </div>

        {/* DIRETRIZES */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Diretrizes</h6>
          <div className="row g-4">
            <div className="col-12">
              {/* BNCC agora usa SelectField com multiselect, já que vem da API */}
              <SelectField
                 fieldName="bncc"
                 label="BNCC / Habilidades"
                 placeholder={isLoadingBncc ? "Carregando..." : "Selecione habilidades"}
                 options={bnccOptions}
                 required
                 multiselect={true}
                 formik={formik as FormikProps<any>}
                 loading={isLoadingBncc}
              />
            </div>
          </div>
        </div>

        <div className="alert alert-info py-2 px-3 d-flex align-items-center gap-2">
          <i className="bi bi-info-circle fs-5"></i>
          <span>Salve a aula antes de vincular etapas detalhadas.</span>
        </div>

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