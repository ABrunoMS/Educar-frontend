import React, { useState, useEffect } from 'react';
import { useFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios'; 

import AsyncSelectField from '@components/form/AsyncSelectField';
import { SelectOptions } from '@interfaces/Forms';
import { Quest, ProductDto, ContentDto } from '@interfaces/Lesson';
import { useRole } from '@contexts/RoleContext';

// Serviços
import { createQuest, updateQuest, getQuestById, getBnccContents, getAllProducts, getCompatibleContents } from '@services/Lesson';
import { getSubjects } from '@services/Subjects'; 
import { getClientById } from '@services/Clients'; 
import { useAuth } from '../../../../auth/core/Auth';
import { getGrades } from '@services/Grades';

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
  
  const canCreateTemplate = hasAnyRole(['Admin', 'TeacherEducar']);
  
  const [searchParams] = useSearchParams();
  const sourceTemplateId = searchParams.get('sourceTemplateId');
  
  const [clonedData, setClonedData] = useState<Quest | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Estados para Selects
  const [bnccOptions, setBnccOptions] = useState<OptionType[]>([]);
  const [disciplines, setDisciplines] = useState<OptionType[]>([]);
  const [schoolYears, setSchoolYears] = useState<OptionType[]>([]);

  // Loadings
  const [isLoadingBncc, setIsLoadingBncc] = useState(false);
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false);
  const [isLoadingSchoolYears, setIsLoadingSchoolYears] = useState(false);

  // Produtos e Conteúdos
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [availableContents, setAvailableContents] = useState<ContentDto[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingContents, setIsLoadingContents] = useState(false);

  // Estado para armazenar dados do cliente (O QUE ELE COMPROU)
  const [clientData, setClientData] = useState<any>(null);

  // 1. CARREGAR DADOS INICIAIS (Matérias, Anos e DADOS DO CLIENTE)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDisciplines(true);
      setIsLoadingSchoolYears(true);
      setIsLoadingProducts(true);

      console.log("DEBUG - Iniciando carregamento de contexto...");

      try {
        // A. Matérias e Anos (Mantido)
        const subjectsResponse = await getSubjects();
        const subjectsList = subjectsResponse.data.data || subjectsResponse.data || [];
        setDisciplines(Array.isArray(subjectsList) ? subjectsList.map((s: any) => ({ value: s.id, label: s.name })) : []);

        const gradesResponse = await getGrades();
        const gradesList = gradesResponse.data.data || gradesResponse.data || [];
        setSchoolYears(Array.isArray(gradesList) ? gradesList.map((g: any) => ({ value: g.id, label: g.name })) : []);

        // B. LÓGICA DE DESCOBERTA DO CLIENTE
        if (currentUser) {
            let targetClientId = (currentUser as any)?.clientId;
            
            // Se não achou ID do cliente direto, tenta via Escola
            if (!targetClientId) {
                console.log("DEBUG - ClientId não encontrado no user. Tentando via Escola...");
                
                // Verifica se tem schoolId direto ou array de schools
                const schoolId = (currentUser as any).schoolId || (currentUser.schools && currentUser.schools[0]?.id);
                
                if (schoolId) {
                    try {
                        // Busca a escola para descobrir quem é o dono (Cliente)
                        
                        const schoolRes = await axios.get(`${API_URL}/api/Schools/${schoolId}`); 
                        targetClientId = schoolRes.data.clientId || schoolRes.data.client?.id;
                        console.log("DEBUG - ClientId descoberto via Escola:", targetClientId);
                    } catch (err) {
                        console.error("DEBUG - Erro ao buscar escola do usuário:", err);
                    }
                }
            }

            if (targetClientId) {
                // Busca dados completos do cliente
                const clientRes = await getClientById(targetClientId);
                const client = clientRes.data;
                
                console.log("DEBUG - Cliente carregado com sucesso:", client.name);
                setClientData(client);
                
                // Define produtos disponíveis como APENAS os do cliente
                setAllProducts(client.products || []);
            } else {
                console.warn("DEBUG - Nenhum Cliente vinculado encontrado. Carregando tudo (Modo Admin/Sistema).");
                // Fallback: carrega tudo do sistema
                const allProds = await getAllProducts();
                setAllProducts(allProds.data || []);
                setClientData(null); 
            }
        }

      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setIsLoadingDisciplines(false);
        setIsLoadingSchoolYears(false);
        setIsLoadingProducts(false);
      }
    };
    fetchData();
  }, [currentUser]);

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

  // Helpers
  const getIdFromField = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field.id) return field.id;
    return '';
  };

  const initialDisciplineId = activeData?.subjectId 
      || getIdFromField(activeData?.subject)
      || disciplines.find(d => d.label === (activeData?.subject as any))?.value 
      || '';
      
  const initialSchoolYearId = activeData?.gradeId 
      || getIdFromField(activeData?.grade)
      || schoolYears.find(s => s.label === (activeData?.grade as any))?.value 
      || '';

  const initialBnccIds = activeData?.proficiencies 
      ? activeData.proficiencies.map((p: any) => p.id || p.Id) 
      : [];

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Nome obrigatório'),
    description: Yup.string().required('Descrição obrigatória'),
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
      discipline: initialDisciplineId,
      schoolYear: initialSchoolYearId,
      usageTemplate: canCreateTemplate ? (sourceTemplateId ? false : (activeData?.usageTemplate ?? false)) : false,
      type: activeData?.type || 'SinglePlayer',
      maxPlayers: activeData?.maxPlayers || 2,
      combatDifficulty: activeData?.combatDifficulty || 'Passive',
      bncc: (isEditing && initialLesson?.proficiencies) ? initialLesson.proficiencies.map((p: any) => p.id || p.Id) : initialBnccIds,
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
          navigate(`../steps/${initialLesson.id}`);
        } else {
          delete questData.id;
          if (questData.questSteps && questData.questSteps.length > 0) {
            questData.questSteps = questData.questSteps.map((step: any) => ({
              ...step,
              id: undefined,
              questId: undefined,
              contents: step.contents.map((content: any) => ({ ...content, id: undefined }))
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

  // --- LÓGICA CRÍTICA: FILTRAR CONTEÚDOS ---
  useEffect(() => {
    const fetchContents = async () => {
      const selectedProductId = formik.values.productId;
      
      if (!selectedProductId) {
        setAvailableContents([]);
        formik.setFieldValue('contentId', '');
        return;
      }

      setIsLoadingContents(true);
      try {
        // 1. Busca TODOS os conteúdos compatíveis com o produto (API do sistema)
        const compatibleContents = await getCompatibleContents(selectedProductId);

        // 2. FILTRO: Cruza com o que o cliente possui
        if (clientData) {
            console.log("DEBUG - Dados do Cliente:", clientData); 

            let purchasedContentIds: string[] = [];

            // Tenta encontrar a lista de conteúdos em várias propriedades possíveis
            if (Array.isArray(clientData.contents)) {
                // Caso 1: Lista já mapeada (Ideal)
                purchasedContentIds = clientData.contents.map((c: any) => c.id || c.Id);
            } 
            else if (Array.isArray(clientData.clientContents)) {
                // Caso 2: Tabela de junção 
                purchasedContentIds = clientData.clientContents.map((cc: any) => cc.contentId || cc.content?.id || cc.ContentId);
            }
            else if (Array.isArray(clientData.ClientContents)) {
                // Caso 3: PascalCase
                purchasedContentIds = clientData.ClientContents.map((cc: any) => cc.contentId || cc.content?.id || cc.ContentId);
            }

            console.log("DEBUG - IDs Comprados detectados:", purchasedContentIds);

            // Interseção: Compatíveis com Produto AND Comprados pelo Cliente
            const filtered = compatibleContents.filter(c => purchasedContentIds.includes(c.id));
            
            setAvailableContents(filtered);
        } else {
            // Se não tem dados de cliente (ex: admin criando template GLOBAL), mostra todos os compatíveis
           
            setAvailableContents(compatibleContents);
        }

        // Limpeza de seleção inválida
        if (formik.values.contentId) {
             // Re-calcula a lista válida para validação imediata
             let currentValidIds = compatibleContents.map(c => c.id);
             
             if (clientData) {
                 // Repete a lógica de extração de IDs para validação
                 let pIds: string[] = [];
                 if (Array.isArray(clientData.contents)) pIds = clientData.contents.map((c: any) => c.id || c.Id);
                 else if (Array.isArray(clientData.clientContents)) pIds = clientData.clientContents.map((cc: any) => cc.contentId || cc.content?.id);
                 
                 // A lista válida é a interseção
                 currentValidIds = currentValidIds.filter(id => pIds.includes(id));
             }

             if (!currentValidIds.includes(formik.values.contentId)) {
                 formik.setFieldValue('contentId', '');
             }
        }

      } catch (error) {
        console.error('Falha ao buscar conteúdos:', error);
        setAvailableContents([]);
      } finally {
        setIsLoadingContents(false);
      }
    };

    fetchContents();
  }, [formik.values.productId, clientData]);

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

  if (isLoadingTemplate) {
      return <div className="text-center p-10"><h3>Carregando modelo de aula...</h3></div>;
  }

  return (
    <div className="w-100">
      <form onSubmit={formik.handleSubmit} className="form" noValidate>
        {!isEditing && (
          <div className="mb-8">
            <h2 className="fw-bold text-gray-900 mb-2">Nova Aula</h2>
            <p className="text-muted fs-7 mb-0">
              {sourceTemplateId ? 'Criando a partir de um modelo' : 'Preencha as informações básicas da aula'}
            </p>
          </div>
        )}

        {/* INFORMAÇÕES BÁSICAS */}
        <div className="card mb-5">
          <div className="card-body p-9">
            <h3 className="card-title mb-7">Informações Básicas</h3>
            <div className="row g-7">
              <div className="col-12">
                <label className="form-label required fw-semibold">Nome da Aula</label>
                <input
                  type="text"
                  className={clsx('form-control form-control-lg', { 'is-invalid': formik.touched.name && formik.errors.name })}
                  placeholder="Ex: Introdução à Biologia"
                  {...formik.getFieldProps('name')}
                />
                {formik.touched.name && formik.errors.name && <div className="fv-plugins-message-container"><div className="fv-help-block">{formik.errors.name}</div></div>}
              </div>

              <div className="col-md-6">
                <label className="form-label required fw-semibold">Disciplina</label>
                <select
                  className={clsx('form-select form-select-lg', { 'is-invalid': formik.touched.discipline && formik.errors.discipline })}
                  {...formik.getFieldProps('discipline')}
                  disabled={isLoadingDisciplines}
                >
                  <option value="">{isLoadingDisciplines ? 'Carregando...' : 'Selecione'}</option>
                  {disciplines.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label required fw-semibold">Ano Escolar</label>
                <select
                  className={clsx('form-select form-select-lg', { 'is-invalid': formik.touched.schoolYear && formik.errors.schoolYear })}
                  {...formik.getFieldProps('schoolYear')}
                  disabled={isLoadingSchoolYears}
                >
                  <option value="">{isLoadingSchoolYears ? 'Carregando...' : 'Selecione'}</option>
                  {schoolYears.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label required fw-semibold">Descrição</label>
                <textarea
                  className={clsx('form-control form-control-lg', { 'is-invalid': formik.touched.description && formik.errors.description })}
                  rows={3}
                  placeholder="Descreva os objetivos e conteúdo desta aula"
                  {...formik.getFieldProps('description')}
                />
              </div>

              {canCreateTemplate && (
                <div className="col-12">
                  <div className="form-check form-switch form-check-custom form-check-solid">
                    <input className="form-check-input" type="checkbox" id="usageTemplateToggle" {...formik.getFieldProps('usageTemplate')} checked={formik.values.usageTemplate} />
                    <label className="form-check-label fw-semibold ms-2" htmlFor="usageTemplateToggle">Usar como modelo (template)</label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRODUTO E CONTEÚDO */}
        <div className="card mb-5">
          <div className="card-body p-9">
            <h3 className="card-title mb-7">Produto e Conteúdo</h3>
            
            <div className="row g-7">
              <div className="col-md-6">
                <label className="form-label required fw-semibold">Produto</label>
                {isLoadingProducts ? (
                  <div className="text-muted"><span className="spinner-border spinner-border-sm me-2"></span>Carregando...</div>
                ) : (
                  <>
                    <select
                      className={clsx('form-select form-select-lg', { 'is-invalid': formik.touched.productId && formik.errors.productId })}
                      {...formik.getFieldProps('productId')}
                    >
                      <option value="">Selecione</option>
                      {allProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                    </select>
                    {formik.touched.productId && formik.errors.productId && <div className="fv-plugins-message-container"><div className="fv-help-block">{formik.errors.productId}</div></div>}
                  </>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label required fw-semibold">Conteúdo</label>
                {isLoadingContents ? (
                  <div className="text-muted"><span className="spinner-border spinner-border-sm me-2"></span>Carregando...</div>
                ) : (
                  <>
                    <select
                      className={clsx('form-select form-select-lg', { 'is-invalid': formik.touched.contentId && formik.errors.contentId })}
                      {...formik.getFieldProps('contentId')}
                      disabled={!formik.values.productId}
                    >
                      <option value="">{!formik.values.productId ? 'Selecione um produto primeiro' : 'Selecione'}</option>
                      {availableContents.map((content) => <option key={content.id} value={content.id}>{content.name}</option>)}
                    </select>
                    {formik.touched.contentId && formik.errors.contentId && <div className="fv-plugins-message-container"><div className="fv-help-block">{formik.errors.contentId}</div></div>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BNCC (OPCIONAL) */}
        <div className="card mb-5">
          <div className="card-body p-9">
            <h3 className="card-title mb-2">Diretrizes BNCC</h3>
            <p className="text-muted fs-7 mb-7">Opcional - Vincule competências da Base Nacional Comum Curricular</p>
            {formik.values.bncc && formik.values.bncc.length > 0 && (
              <div className="mb-5">
                <div className="d-flex flex-wrap gap-2">
                  {formik.values.bncc.map((bnccId: string) => {
                    const bncc = bnccOptions.find((opt) => opt.value === bnccId);
                    return bncc ? (
                      <span key={bnccId} className="badge badge-light badge-lg d-inline-flex align-items-center gap-2">
                        {bncc.label}
                        <button type="button" className="btn btn-sm btn-icon btn-active-color-primary p-0" onClick={() => { const updated = formik.values.bncc.filter((id: string) => id !== bnccId); formik.setFieldValue('bncc', updated); }}><i className="bi bi-x fs-3"></i></button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <AsyncSelectField
              fieldName="bncc"
              label="Buscar Competências"
              placeholder="Digite para buscar..."
              isMulti
              formik={formik as FormikProps<any>}
              defaultOptions={bnccOptions}
              loadOptions={(inputValue, callback) => { const filtered = bnccOptions.filter((opt) => opt.label.toLowerCase().includes(inputValue.toLowerCase())); callback(filtered); }}
              isDisabled={isLoadingBncc}
            />
          </div>
        </div>

        {/* AÇÕES */}
        <div className="d-flex justify-content-end gap-3 mt-10">
          <button type="button" className="btn btn-light btn-lg" onClick={() => { if (onFormSubmit) onFormSubmit(); else navigate('/apps/lesson-management/lessons'); }}>Cancelar</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</> : <>{isEditing ? 'Atualizar' : 'Salvar e Continuar'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonCreateForm;