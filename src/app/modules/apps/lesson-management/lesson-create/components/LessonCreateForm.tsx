import React, { useState, useEffect } from 'react';
import { useFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios'; 

import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import AsyncSelectField from '@components/form/AsyncSelectField';
import { SelectOptions } from '@interfaces/Forms';
import { Class } from '@interfaces/Class';
import { SchoolType } from '@interfaces/School';
import { PaginatedResponse } from '@contexts/PaginationContext';
import { Quest, ProductDto, ContentDto } from '@interfaces/Lesson';
import { useRole } from '@contexts/RoleContext';

// Serviços
import { getSchools } from '@services/Schools';
import { getClassesBySchools } from '@services/Classes';
import { createQuest, updateQuest, getQuestById, getBnccContents, getAllProducts, getCompatibleContents } from '@services/Lesson';
import { getSubjects } from '@services/Subjects'; 
import { useAuth } from '../../../../auth/core/Auth';

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
  const { hasAnyRole } = useRole();
  
  // Apenas Admin e TeacherEducar podem criar aulas template
  const canCreateTemplate = hasAnyRole(['Admin', 'TeacherEducar']);
  
  const [searchParams] = useSearchParams();
  const sourceTemplateId = searchParams.get('sourceTemplateId');
  
  const [clonedData, setClonedData] = useState<Quest | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Estados para Selects
  const [schoolOptions, setSchoolOptions] = useState<OptionType[]>([]);
  const [classOptions, setClassOptions] = useState<OptionType[]>([]);
  const [bnccOptions, setBnccOptions] = useState<OptionType[]>([]);
  const [disciplines, setDisciplines] = useState<OptionType[]>([]);
  const [schoolYears, setSchoolYears] = useState<OptionType[]>([]);

  // Loadings
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingBncc, setIsLoadingBncc] = useState(false);
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false);
  const [isLoadingSchoolYears, setIsLoadingSchoolYears] = useState(false);

  // Estados para Produtos e Conteúdos (como no ClientCreateForm)
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [availableContents, setAvailableContents] = useState<ContentDto[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingContents, setIsLoadingContents] = useState(false);

  // 1. CARREGAR DADOS REAIS (Matérias e Anos)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDisciplines(true);
      setIsLoadingSchoolYears(true);
      try {
        // Matérias
        const subjectsResponse = await getSubjects();
        const subjectsList = subjectsResponse.data.data || subjectsResponse.data || [];
        setDisciplines(Array.isArray(subjectsList) ? subjectsList.map((s: any) => ({ value: s.id, label: s.name })) : []);

        // Anos
        const gradesResponse = await axios.get(`${API_URL}/api/Grades`, { params: { PageNumber: 1, PageSize: 999 }});
        const gradesList = gradesResponse.data.data || gradesResponse.data || [];
        setSchoolYears(Array.isArray(gradesList) ? gradesList.map((g: any) => ({ value: g.id, label: g.name })) : []);

      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      } finally {
        setIsLoadingDisciplines(false);
        setIsLoadingSchoolYears(false);
      }
    };
    fetchData();
  }, []);

  // CARREGAR PRODUTOS NA MONTAGEM
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const productData = await getAllProducts();
        setAllProducts(productData.data || []);
      } catch (error) {
        console.error('Falha ao buscar produtos:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. CARREGAR TEMPLATE
  useEffect(() => {
    if (sourceTemplateId) {
      setIsLoadingTemplate(true);
      getQuestById(sourceTemplateId)
        .then((response) => setClonedData(response.data as Quest))
        .catch(err => {
            console.error("Erro template", err);
            alert("Erro ao carregar modelo.");
        })
        .finally(() => setIsLoadingTemplate(false));
    }
  }, [sourceTemplateId]);

  // 3. DADOS ATIVOS
  const activeData = isEditing ? initialLesson : (clonedData || undefined);

  // -------------------------------------------------------------------------
  // LÓGICA DE INICIALIZAÇÃO ROBUSTA
  // -------------------------------------------------------------------------
  
  // Função auxiliar para pegar ID de campo que pode ser string, objeto ou nulo
  const getIdFromField = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field; // Já é o ID
    if (typeof field === 'object' && field.id) return field.id; // É objeto {id: "...", name: "..."}
    return '';
  };

  // Tenta pegar o ID direto (subjectId) ou de dentro do objeto (subject.id)
  const initialDisciplineId = activeData?.subjectId 
      || getIdFromField(activeData?.subject)
      // Fallback: Tenta achar pelo nome na lista carregada
      || disciplines.find(d => d.label === (activeData?.subject as any))?.value 
      || '';
      
  const initialSchoolYearId = activeData?.gradeId 
      || getIdFromField(activeData?.grade)
      || schoolYears.find(s => s.label === (activeData?.grade as any))?.value 
      || '';

  const initialBnccIds = activeData?.proficiencies 
      ? activeData.proficiencies.map((p: any) => p.id || p.Id) 
      : [];
  // -------------------------------------------------------------------------

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Nome obrigatório'),
    description: Yup.string().required('Descrição obrigatória'),
    // School e Class não são obrigatórios se for template, ou se for edição (pois o back não retorna)
    // Ajuste conforme sua regra de negócio. Aqui deixei flexível.
    school: Yup.string(), 
    class: Yup.string(),
    discipline: Yup.string().required('Disciplina obrigatória'),
    schoolYear: Yup.string().required('Ano escolar obrigatório'),
    usageTemplate: Yup.boolean().required('Template obrigatório'),
    type: Yup.string().required('Tipo obrigatório'),
    maxPlayers: Yup.number().min(1).required('Máximo obrigatório'),
    combatDifficulty: Yup.string().required('Dificuldade obrigatória'),
    bncc: Yup.array(),
    productId: Yup.string().required('Produto é obrigatório'),
    contentId: Yup.string().required('Conteúdo é obrigatório'),
  });

  const formik = useFormik({
    initialValues: {
      name: activeData?.name ? (sourceTemplateId ? `${activeData.name} (Cópia)` : activeData.name) : '',
      description: activeData?.description || '',
      school: '',
      class: '',
      discipline: initialDisciplineId,
      schoolYear: initialSchoolYearId,
      usageTemplate: canCreateTemplate ? (sourceTemplateId ? false : (activeData?.usageTemplate ?? false)) : false,
      type: activeData?.type || 'SinglePlayer',
      maxPlayers: activeData?.maxPlayers || 2,
      combatDifficulty: activeData?.combatDifficulty || 'Passive',
      bncc: (isEditing && initialLesson?.proficiencies)
        ? initialLesson.proficiencies.map((p: any) => p.id || p.Id)
        : initialBnccIds,
      productId: activeData?.productId || getIdFromField(activeData?.product) || '',
      contentId: activeData?.contentId || getIdFromField(activeData?.content) || '',
    },
    validationSchema,
    enableReinitialize: true,
    
    onSubmit: async (values, { setSubmitting }) => {
  try {
    setSubmitting(true);

    const validBnccIds = values.bncc || [];

    const questData: any = {
      id: isEditing ? initialLesson?.id : undefined,
      name: values.name,
      description: values.description,
      usageTemplate: values.usageTemplate,
      type: values.type,
      maxPlayers: values.maxPlayers,
      combatDifficulty: values.combatDifficulty,
      subjectId: values.discipline,
      gradeId: values.schoolYear,
      productId: values.productId,
      contentId: values.contentId,
      
      bnccIds: validBnccIds, 
      
      questSteps: activeData?.questSteps || [],
    };

    if (isEditing && initialLesson?.id) {
      await updateQuest(initialLesson.id, questData);
      alert('Aula atualizada com sucesso!');
      if (onFormSubmit) onFormSubmit();
    } else {
      delete questData.id;

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
      const newId = response.data.id;

      alert('Aula criada com sucesso!');
      navigate(`../steps/${newId}`);
    }
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar aula. Verifique os dados.');
  } finally {
    setSubmitting(false);
  }
},
  });

  // --- ESCOLAS / TURMAS ---
  useEffect(() => {
    if (!currentUser) return; 
    setIsLoadingSchools(true);

    if (currentUser.roles?.includes('Admin')) {
        getSchools()
           .then((res: { data: PaginatedResponse<SchoolType> }) => {
              const options: OptionType[] = res.data.data
                  .filter((school): school is SchoolType & { id: string } => school.id !== undefined)
                  .map((school) => ({ value: school.id, label: school.name || '' }));
              setSchoolOptions(options);
           })
           .catch((error) => console.error('Erro escolas:', error))
           .finally(() => setIsLoadingSchools(false));
    } 
    else if (currentUser.schools?.length) { 
        const options = currentUser.schools.map((school) => ({ value: school.id, label: school.name }));
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
        const options: OptionType[] = res.data.map((classItem: Class) => ({ value: classItem.id, label: classItem.name }));
        setClassOptions(options);
        if (!options.some((opt) => opt.value === formik.values.class)) {
          formik.setFieldValue('class', '');
        }
      })
      .catch((error) => {
        console.error('Erro turmas:', error);
        setClassOptions([]);
      })
      .finally(() => setIsLoadingClasses(false));
  }, [formik.values.school]);

  // --- BNCC LOAD ---
  useEffect(() => {
    setIsLoadingBncc(true);
    getBnccContents()
      .then((res: { data: any[] }) => {
        const options = res.data.map((item) => ({ 
            value: item.id || item.Id, 
            label: item.description || item.Description || item.code 
        }));
        setBnccOptions(options);
        // Sincroniza BNCC apenas no primeiro carregamento da edição
        if (isEditing && initialLesson?.proficiencies && formik.values.bncc.length === 0) {
          const validIds = initialLesson.proficiencies
            .map((p: any) => p.id || p.Id)
            .filter((id: string) => options.some(opt => opt.value === id));
          formik.setFieldValue('bncc', validIds);
        }
      })
      .catch(() => setBnccOptions([]))
      .finally(() => setIsLoadingBncc(false));
  }, [isEditing, initialLesson]);

  // --- CARREGAR CONTEÚDOS COMPATÍVEIS COM O PRODUTO SELECIONADO ---
  useEffect(() => {
    const fetchCompatibleContents = async () => {
      const selectedProductId = formik.values.productId;
      
      if (!selectedProductId) {
        setAvailableContents([]);
        formik.setFieldValue('contentId', '');
        return;
      }

      setIsLoadingContents(true);
      try {
        const contentList = await getCompatibleContents(selectedProductId);
        setAvailableContents(contentList);

        // Limpa o conteúdo se não for mais compatível
        if (formik.values.contentId) {
          const isStillValid = contentList.some(c => c.id === formik.values.contentId);
          if (!isStillValid) {
            formik.setFieldValue('contentId', '');
          }
        }
      } catch (error) {
        console.error('Falha ao buscar conteúdos compatíveis:', error);
        setAvailableContents([]);
      } finally {
        setIsLoadingContents(false);
      }
    };

    fetchCompatibleContents();
  }, [formik.values.productId]);

  if (isLoadingTemplate) {
      return <div className="text-center p-10"><h3>Carregando modelo de aula...</h3></div>;
  }

  return (
    <div className="w-100">
      <form onSubmit={formik.handleSubmit} className="form pb-8 d-flex flex-column gap-4" noValidate>
        
        {/* Campos Básicos */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Informações básicas</h6>
          <div className="row g-4">
            <div className="col-md-6">
              <BasicField fieldName="name" label="Nome da Aula" placeholder="Digite o nome da aula" required formik={formik} />
            </div>
            <div className="col-md-6">
              <SelectField fieldName="schoolYear" label="Ano escolar" placeholder={isLoadingSchoolYears ? "Carregando..." : "Selecione..."} options={schoolYears} required multiselect={false} formik={formik as FormikProps<any>} loading={isLoadingSchoolYears} />
            </div>
            <div className="col-md-6">
              <SelectField fieldName="discipline" label="Disciplina" placeholder={isLoadingDisciplines ? "Carregando..." : "Selecione..."} options={disciplines} required multiselect={false} formik={formik as FormikProps<any>} loading={isLoadingDisciplines} />
            </div>
           {/* <div className="col-md-6">
              <SelectField fieldName="type" label="Tipo da Aula" placeholder="---" options={[{ value: 'SinglePlayer', label: 'Individual' }, { value: 'MultiPlayer', label: 'Multiplayer' }]} required multiselect={false} formik={formik as FormikProps<any>} />
            </div>*/}
            <div className="col-12">
              <BasicField fieldName="description" label="Descrição" placeholder="Descrição da aula" required formik={formik} rows={2} />
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Configurações da Aula</h6>
          <div className="row g-4">
            {canCreateTemplate && (
              <div className="col-md-4 d-flex align-items-center pt-5">
                <div className="form-check form-switch form-check-custom form-check-solid">
                  <input className="form-check-input" type="checkbox" id="usageTemplateToggle" name="usageTemplate" checked={formik.values.usageTemplate} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  <label className="form-check-label ms-3 text-gray-700" htmlFor="usageTemplateToggle">Template Global</label>
                </div>
              </div>
            )}
            {/*<div className="col-md-4">
              <BasicField fieldName="maxPlayers" label="Máximo de Jogadores" placeholder="2" required formik={formik} type="number" />
            </div>*/}
            {/*<div className="col-md-6">
              <SelectField fieldName="combatDifficulty" label="Dificuldade de Combate" placeholder="---" options={[{ value: 'Passive', label: 'Passivo' }, { value: 'Easy', label: 'Fácil' }, { value: 'Medium', label: 'Médio' }, { value: 'Hard', label: 'Difícil' }]} required multiselect={false} formik={formik as FormikProps<any>} />
            </div>*/}
          </div>
        </div>

        {/* Escola e Turma (Opcionais na Edição/Template) */}
       {/* <div className="bg-body rounded-2xl shadow-sm p-4">
            <h6 className="fw-semibold text-muted mb-3">Escola e Turma</h6>
            <div className="row g-4">
              <div className="col-md-6">
                <SelectField fieldName="school" label="Escola" placeholder="---" options={schoolOptions} required={false} multiselect={false} formik={formik as FormikProps<any>} loading={isLoadingSchools} />
              </div>
              <div className="col-md-6">
                <SelectField fieldName="class" label="Turma" placeholder={formik.values.school ? '---' : 'Selecione uma escola primeiro'} options={classOptions} required={false} multiselect={false} formik={formik as FormikProps<any>} loading={isLoadingClasses} isDisabled={!formik.values.school || isLoadingClasses} />
              </div>
            </div>
        </div>*/}

        {/* Produto e Conteúdo */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Produto e Conteúdo</h6>
          <div className="row g-4">
            {/* Coluna de Produto */}
            <div className="col-md-6">
              <label className="form-label fw-bold required">Produto</label>
              {isLoadingProducts && (
                <div className="d-flex align-items-center text-muted fs-7">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Carregando produtos...
                </div>
              )}
              {!isLoadingProducts && (
                <select
                  className={clsx('form-select form-select-solid', {
                    'is-invalid': formik.touched.productId && formik.errors.productId,
                  })}
                  name="productId"
                  value={formik.values.productId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Selecione um produto...</option>
                  {allProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
              {formik.touched.productId && formik.errors.productId && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">{formik.errors.productId}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna de Conteúdo */}
            <div className="col-md-6">
              <label className="form-label fw-bold required">Conteúdo</label>
              {isLoadingContents && (
                <div className="d-flex align-items-center text-muted fs-7">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Buscando conteúdos...
                </div>
              )}
              {!isLoadingContents && (
                <select
                  className={clsx('form-select form-select-solid', {
                    'is-invalid': formik.touched.contentId && formik.errors.contentId,
                  })}
                  name="contentId"
                  value={formik.values.contentId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!formik.values.productId}
                >
                  <option value="">
                    {!formik.values.productId ? 'Selecione um produto primeiro' : 'Selecione um conteúdo...'}
                  </option>
                  {availableContents.map((content) => (
                    <option key={content.id} value={content.id}>
                      {content.name}
                    </option>
                  ))}
                </select>
              )}
              {formik.touched.contentId && formik.errors.contentId && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">{formik.errors.contentId}</span>
                  </div>
                </div>
              )}
              {!isLoadingContents && availableContents.length === 0 && formik.values.productId && (
                <div className="text-muted fs-7 mt-1">Nenhum conteúdo compatível encontrado.</div>
              )}
            </div>
          </div>
        </div>

        {/* BNCC */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Diretrizes</h6>
          <div className="row g-4">
            <div className="col-12">
              {/* Renderiza tags BNCC fora do campo de input */}
              {formik.values.bncc && formik.values.bncc.length > 0 && (
                <div className="d-flex flex-wrap mb-2 gap-2">
                  {formik.values.bncc.map((bnccId: string) => {
                    const bncc = bnccOptions.find(opt => opt.value === bnccId);
                    return bncc ? (
                      <span key={bnccId} className="d-flex align-items-center px-3 py-1 rounded-pill border border-gray-200 bg-gray-100 fw-semibold" style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--bs-gray-700)' }}>
                        {bncc.label}
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-light-danger ms-2"
                          style={{ border: 'none', background: 'transparent', padding: 0, marginLeft: 8 }}
                          onClick={() => {
                            const updated = formik.values.bncc.filter((id: string) => id !== bnccId);
                            formik.setFieldValue('bncc', updated);
                          }}
                        >
                          <i className="bi bi-x fs-6"></i>
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              <AsyncSelectField
                fieldName="bncc"
                label="BNCC"
                placeholder="Selecione conteúdos BNCC"
                isMulti
                formik={formik as FormikProps<any>}
                defaultOptions={bnccOptions}
                loadOptions={(inputValue, callback) => {
                  const filtered = bnccOptions.filter(opt =>
                    opt.label.toLowerCase().includes(inputValue.toLowerCase())
                  );
                  callback(filtered);
                }}
                isDisabled={isLoadingBncc}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 mt-3">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { if (onFormSubmit) onFormSubmit(); else navigate('/apps/lesson-management/lessons'); }}>
            {isEditing ? 'Cancelar' : 'Voltar'}
          </button>
          <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={formik.isSubmitting || isLoadingSchools || isLoadingClasses}>
            {formik.isSubmitting ? (<><span>Aguarde...</span><span className="spinner-border spinner-border-sm ms-2"></span></>) : (isEditing ? 'Atualizar aula' : 'Salvar e continuar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonCreateForm;