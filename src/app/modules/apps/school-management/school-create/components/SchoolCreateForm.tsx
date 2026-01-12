import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { School, SchoolType } from '@interfaces/School';
import { SelectOptions } from '@interfaces/Forms';
import AsyncSelectField from '@components/form/AsyncSelectField';
import { getClients } from '@services/Clients';
import { getAccountsByClient } from '@services/Accounts';
import { createSchool, updateSchool } from '@services/Schools';
import { isNotEmpty, KTIcon } from '@metronic/helpers';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

type Props = {
  isUserLoading?: boolean;
  school?: School;
  schoolItem?: SchoolType;
  onFormSubmit?: () => void;
};

const initialSchool: School = {
  id: '',
  name: '',
  description: '',
  address: '',
  client: '',
  regionalId: ''
};

// Função para filtrar e limitar opções
const filterOptions = (options: SelectOptions[], inputValue: string) => {
  return options
    .filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 10);
};

const editSchema = Yup.object().shape({
  name: Yup.string().required('O nome da escola é obrigatório'),
  client: Yup.string().required('O cliente é obrigatório'),
});

const SchoolCreateForm: FC<Props> = ({ school, schoolItem, isUserLoading, onFormSubmit }) => {
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const queryClient = useQueryClient();
  
  const currentSchool = schoolItem || school;
  
  const [dialogueForEdit] = useState<School>({
    id: currentSchool?.id || '',
    name: currentSchool?.name || '',
    description: currentSchool?.description || '',
    address: (currentSchool as SchoolType)?.addressId || 
             (typeof currentSchool?.address === 'string' ? currentSchool.address : '') ||
             '',
    client: (currentSchool as SchoolType)?.clientId || 
            (typeof currentSchool?.client === 'string' ? currentSchool.client : '') ||
            '',
    regionalId: (currentSchool as SchoolType)?.regionalId || ''
  });

  const formik = useFormik({
    initialValues: dialogueForEdit,
    validationSchema: editSchema,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const schoolData: any = {
          name: values.name,
          clientId: values.client,
        };
        
        if (values.description) {
          schoolData.description = values.description;
        }
        
        if (isNotEmpty(values.id)) {
          await updateSchool(values.id!, schoolData);
          toast.success('Escola atualizada com sucesso!');
        } else {
          await createSchool(schoolData);
          toast.success('Escola criada com sucesso!');
          formik.resetForm();
        }
        
        if (onFormSubmit) {
          onFormSubmit();
        }
      } catch (ex) {
        toast.error('Houve um erro ao salvar a escola. Por favor, tente novamente.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Carregar clientes
  useEffect(() => {
    getClients().then((response) => {
      const options = response.data.data.map((client: any) => ({
        value: client.id,
        label: client.name,
      }));
      setClientOptions(options);
    }).catch((error) => {
      console.error('Erro ao buscar clientes:', error);
    });
  }, []);

  // Buscar professores e alunos do cliente selecionado
  const { data: teachersData, refetch: refetchTeachers } = useQuery(
    ['school-teachers', formik.values.client, formik.values.id],
    async () => {
      if (!formik.values.client) return { data: { data: [] } };
      
      if (formik.values.id) {
        // Modo edição: buscar professores já vinculados à escola
        const response = await axios.get(`${API_URL}/api/Schools/${formik.values.id}/accounts`, {
          params: { PageNumber: 1, PageSize: 1000 }
        });
        return { data: { data: response.data.data.filter((acc: any) => acc.role === 'Teacher') } };
      }
      return { data: { data: [] } };
    },
    {
      enabled: !!formik.values.client,
      refetchOnMount: 'always',
    }
  );

  const { data: studentsData, refetch: refetchStudents } = useQuery(
    ['school-students', formik.values.client, formik.values.id],
    async () => {
      if (!formik.values.client) return { data: { data: [] } };
      
      if (formik.values.id) {
        // Modo edição: buscar alunos já vinculados à escola
        const response = await axios.get(`${API_URL}/api/Schools/${formik.values.id}/accounts`, {
          params: { PageNumber: 1, PageSize: 1000 }
        });
        return { data: { data: response.data.data.filter((acc: any) => acc.role === 'Student') } };
      }
      return { data: { data: [] } };
    },
    {
      enabled: !!formik.values.client,
      refetchOnMount: 'always',
    }
  );

  // Buscar usuários disponíveis do cliente
  const { data: availableAccountsData } = useQuery(
    ['available-accounts', formik.values.client],
    () => getAccountsByClient(formik.values.client, 1, 1000),
    {
      enabled: !!formik.values.client && !!formik.values.id,
    }
  );

  // Mutation para adicionar usuários
  const addUserMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      return axios.post(`${API_URL}/api/Schools/${formik.values.id}/accounts/${userId}`);
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`${variables.role === 'Teacher' ? 'Professor' : 'Aluno'} adicionado com sucesso!`);
        if (variables.role === 'Teacher') {
          refetchTeachers();
        } else {
          refetchStudents();
        }
        queryClient.invalidateQueries(['available-accounts', formik.values.client]);
      },
      onError: (error: any) => {
        toast.error(`Erro ao adicionar usuário: ${error.response?.data?.message || error.message}`);
      },
    }
  );

  // Mutation para remover usuários
  const removeUserMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      return axios.delete(`${API_URL}/api/Schools/${formik.values.id}/accounts/${userId}`);
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`${variables.role === 'Teacher' ? 'Professor' : 'Aluno'} removido com sucesso!`);
        if (variables.role === 'Teacher') {
          refetchTeachers();
        } else {
          refetchStudents();
        }
        queryClient.invalidateQueries(['available-accounts', formik.values.client]);
      },
      onError: (error: any) => {
        toast.error(`Erro ao remover usuário: ${error.response?.data?.message || error.message}`);
      },
    }
  );

  const teachers = teachersData?.data?.data || [];
  const students = studentsData?.data?.data || [];

  // Filtrar usuários disponíveis (que não estão vinculados)
  const allAccounts = Array.isArray(availableAccountsData?.data?.data) 
    ? availableAccountsData.data.data 
    : [];
  
  const linkedUserIds = [...teachers, ...students].map((u: any) => u.id);
  const availableTeachers = allAccounts.filter((acc: any) => 
    acc.role === 'Teacher' && !linkedUserIds.includes(acc.id)
  );
  const availableStudents = allAccounts.filter((acc: any) => 
    acc.role === 'Student' && !linkedUserIds.includes(acc.id)
  );

  // Converter para options do AsyncSelect
  const teacherOptions = availableTeachers.map((t: any) => ({
    value: t.id,
    label: `${t.name} ${t.lastName}`
  }));
  
  const studentOptions = availableStudents.map((s: any) => ({
    value: s.id,
    label: `${s.name} ${s.lastName}`
  }));

  // Filtrar professores e alunos pela busca
  const filteredTeachers = teachers.filter((teacher: any) => {
    if (!teacherSearchTerm) return true;
    const searchLower = teacherSearchTerm.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(searchLower) ||
      teacher.lastName?.toLowerCase().includes(searchLower) ||
      teacher.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredStudents = students.filter((student: any) => {
    if (!studentSearchTerm) return true;
    const searchLower = studentSearchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="card-body">
        <div className="row">
          <div className="col-md-12">
            {/* Nome da escola e Cliente */}
            <div className="row mb-7">
              <div className="col-md-6">
                <label className="form-label required">Nome da escola</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Insira o nome da escola"
                  {...formik.getFieldProps('name')}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>
                      <span role='alert'>{formik.errors.name}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <AsyncSelectField
                  label="Cliente"
                  placeholder="Selecione..."
                  fieldName="client"
                  formik={formik}
                  defaultOptions={clientOptions}
                  loadOptions={(inputValue, callback) => {
                    callback(filterOptions(clientOptions, inputValue));
                  }}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="row mb-7">
              <div className="col-md-12">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Insira a descrição da escola"
                  {...formik.getFieldProps('description')}
                />
              </div>
            </div>

            {/* Professores e Alunos - Apenas em modo edição */}
            {formik.values.id && (
              <>
                <div className="separator my-10"></div>
                
                <div className="row mb-7">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <label className="form-label fw-bold fs-4">Professores</label>
                      <span className="badge badge-primary fs-6">{teachers.length}</span>
                    </div>
                    
                    {/* AsyncSelect para adicionar professores */}
                    <AsyncSelectField
                      label=""
                      fieldName="addTeacher"
                      placeholder="Selecione professores para adicionar..."
                      formik={{
                        values: { addTeacher: '' },
                        setFieldValue: (field: string, value: any) => {
                          if (value) {
                            addUserMutation.mutate({ userId: value, role: 'Teacher' });
                          }
                        },
                        errors: {},
                        touched: {},
                        getFieldMeta: () => ({ error: undefined, touched: false, value: '' }),
                        getFieldProps: () => ({ name: 'addTeacher', value: '' }),
                      } as any}
                      defaultOptions={teacherOptions}
                      loadOptions={(inputValue, callback) => {
                        const filtered = teacherOptions
                          .filter((t) =>
                            t.label.toLowerCase().includes(inputValue.toLowerCase())
                          )
                          .slice(0, 10);
                        callback(filtered);
                      }}
                    />

                    {/* Campo de busca para professores */}
                    {teachers.length > 5 && (
                      <div className="mt-3 mb-2">
                        <div className="position-relative">
                          <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-3 mt-3' />
                          <input
                            type="text"
                            className="form-control form-control-sm ps-10"
                            placeholder="Buscar professor..."
                            value={teacherSearchTerm}
                            onChange={(e) => setTeacherSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Lista de professores */}
                    <div className="mt-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                      {filteredTeachers.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <KTIcon iconName='user' className='fs-2x mb-2' />
                          <p className="mb-0">
                            {teacherSearchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor vinculado'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <small className="text-muted d-block mb-2">
                            Exibindo {filteredTeachers.length} de {teachers.length} professor(es)
                          </small>
                          {filteredTeachers.map((teacher: any) => (
                            <div
                              key={teacher.id}
                              className="d-flex align-items-center justify-content-between bg-light-primary p-2 rounded mb-2 hover-scale"
                              style={{ transition: 'all 0.2s' }}
                            >
                              <div className="d-flex align-items-center flex-grow-1 min-w-0">
                                <div className="symbol symbol-circle symbol-30px overflow-hidden me-2 flex-shrink-0">
                                  <div className="symbol-label fs-6 bg-primary text-white">
                                    {teacher.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-grow-1">
                                  <span className="fw-bold text-gray-800 d-block text-truncate">
                                    {teacher.name} {teacher.lastName}
                                  </span>
                                  <span className="text-muted fs-8 text-truncate d-block">{teacher.email}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-icon btn-light-danger ms-2 flex-shrink-0"
                                onClick={() => removeUserMutation.mutate({ userId: teacher.id, role: 'Teacher' })}
                                disabled={removeUserMutation.isLoading}
                                title="Remover professor"
                              >
                                <KTIcon iconName='trash' className='fs-7' />
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <label className="form-label fw-bold fs-4">Alunos</label>
                      <span className="badge badge-success fs-6">{students.length}</span>
                    </div>

                    {/* AsyncSelect para adicionar alunos */}
                    <AsyncSelectField
                      label=""
                      fieldName="addStudent"
                      placeholder="Selecione alunos para adicionar..."
                      formik={{
                        values: { addStudent: '' },
                        setFieldValue: (field: string, value: any) => {
                          if (value) {
                            addUserMutation.mutate({ userId: value, role: 'Student' });
                          }
                        },
                        errors: {},
                        touched: {},
                        getFieldMeta: () => ({ error: undefined, touched: false, value: '' }),
                        getFieldProps: () => ({ name: 'addStudent', value: '' }),
                      } as any}
                      defaultOptions={studentOptions}
                      loadOptions={(inputValue, callback) => {
                        const filtered = studentOptions
                          .filter((s) =>
                            s.label.toLowerCase().includes(inputValue.toLowerCase())
                          )
                          .slice(0, 10);
                        callback(filtered);
                      }}
                    />

                    {/* Campo de busca para alunos */}
                    {students.length > 5 && (
                      <div className="mt-3 mb-2">
                        <div className="position-relative">
                          <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-3 mt-3' />
                          <input
                            type="text"
                            className="form-control form-control-sm ps-10"
                            placeholder="Buscar aluno..."
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Lista de alunos */}
                    <div className="mt-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                      {filteredStudents.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <KTIcon iconName='user' className='fs-2x mb-2' />
                          <p className="mb-0">
                            {studentSearchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno vinculado'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <small className="text-muted d-block mb-2">
                            Exibindo {filteredStudents.length} de {students.length} aluno(s)
                          </small>
                          {filteredStudents.map((student: any) => (
                            <div
                              key={student.id}
                              className="d-flex align-items-center justify-content-between bg-light-success p-2 rounded mb-2 hover-scale"
                              style={{ transition: 'all 0.2s' }}
                            >
                              <div className="d-flex align-items-center flex-grow-1 min-w-0">
                                <div className="symbol symbol-circle symbol-30px overflow-hidden me-2 flex-shrink-0">
                                  <div className="symbol-label fs-6 bg-success text-white">
                                    {student.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-grow-1">
                                  <span className="fw-bold text-gray-800 d-block text-truncate">
                                    {student.name} {student.lastName}
                                  </span>
                                  <span className="text-muted fs-8 text-truncate d-block">{student.email}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-icon btn-light-danger ms-2 flex-shrink-0"
                                onClick={() => removeUserMutation.mutate({ userId: student.id, role: 'Student' })}
                                disabled={removeUserMutation.isLoading}
                                title="Remover aluno"
                              >
                                <KTIcon iconName='trash' className='fs-7' />
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="card-footer d-flex justify-content-end py-6 px-9">
          <button type="button" className="btn btn-light me-2" onClick={onFormSubmit}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUserLoading || formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? (
              <>
                Aguarde...{' '}
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export { SchoolCreateForm };
