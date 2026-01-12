import React, { FC, useState, useEffect, useMemo } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import Select from 'react-select'
import { School, SchoolType } from '@interfaces/School'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import AsyncSelectField from '@components/form/AsyncSelectField' // Import do colega
import { getClients } from '@services/Clients'
import { getAddresses } from '@services/Addresses'
import { getAccountsByClient } from '@services/Accounts' // Import do colega
import { createSchool, updateSchool } from '@services/Schools'
import { isNotEmpty, KTIcon } from '@metronic/helpers'
import { AddressModal } from './AddressModal'
import { useMutation, useQuery, useQueryClient } from 'react-query' // Import do colega
import { toast } from 'react-toastify' // Import do colega
import axios from 'axios' // Import do colega

const API_URL = import.meta.env.VITE_API_BASE_URL;

type Props = {
  isUserLoading?: boolean
  school?: School
  schoolItem?: SchoolType
  onFormSubmit?: () => void
}

const initialSchool: School = {
  id: '',
  name: '',
  description: '',
  address: '',
  client: '',
  regionalId: ''
}

const SchoolCreateForm: FC<Props> = ({ school, schoolItem, isUserLoading, onFormSubmit }) => {
  // --- Estados SUAS (Main) ---
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([]);
  const [addressOptions, setAddressOptions] = useState<SelectOptions[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]); 
  const [regionalOptions, setRegionalOptions] = useState<SelectOptions[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // --- Estados do COLEGA (Yaakov2) ---
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const currentSchool = schoolItem || school;
  
  // --- 1. USEMEMO CRÍTICO (Sua correção mantida) ---
  const dialogueForEdit = useMemo(() => {
    const item = currentSchool as any;
    const clientIdValue = item?.clientId || item?.client?.id || (typeof item?.client === 'string' ? item.client : '') || '';
    const addressIdValue = item?.addressId || item?.address?.id || (typeof item?.address === 'string' ? item.address : '') || '';
    const regionalIdValue = item?.regionalId || item?.regional?.id || '';

    return {
        id: item?.id || '',
        name: item?.name || '',
        description: item?.description || '',
        address: addressIdValue,
        client: clientIdValue,
        regionalId: regionalIdValue
    }
  }, [currentSchool]);

  const intl = useIntl()

  const editSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    description: Yup.string().required('Descrição é obrigatória'),
    address: Yup.string().optional(),
    client: Yup.string().required('Cliente é obrigatório'),
    regionalId: Yup.string().required('Regional é obrigatório'),
  })

  // --- FORMIK (Sua lógica de submit mantida para garantir os IDs corretos) ---
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
          regionalId: values.regionalId,
        };
        
        if (values.description) schoolData.description = values.description;
        if (values.address) schoolData.addressId = values.address;
        
        if (isNotEmpty(values.id)) {
          await updateSchool(values.id!, schoolData);
          toast.success('Escola atualizada com sucesso!'); // Usando toast do colega
        } else {
          await createSchool(schoolData);
          toast.success('Escola criada com sucesso!');
          formik.resetForm();
        }
        
        if (onFormSubmit) onFormSubmit();
      } catch (ex) {
        console.error('Erro ao salvar escola:', ex);
        toast.error('Houve um erro ao salvar a escola.');
      } finally {
        setSubmitting(false);
      }
    },
  })

  // --- USEEFFECTS ESSENCIAIS (Sua lógica mantida) ---
  
  useEffect(() => {
    // Buscar Clientes
    getClients().then((response) => {
      const data = response.data.data || [];
      setAllClients(data); 
      const options = data.map((client: any) => ({
        value: client.id,
        label: client.name,
      }));
      setClientOptions(options);
    }).catch((error) => console.error(error));

    // Buscar Endereços
    getAddresses().then((response) => {
      const addressOptions = response.data.data.map((address: any) => ({
        value: address.id,
        label: `${address.street}, ${address.city} - ${address.state}`,
      }));
      setAddressOptions(addressOptions);
    }).catch((error) => console.error(error));
  }, []);

  // Lógica de filtragem de Regionais (Sua correção)
  useEffect(() => {
    const selectedClientId = formik.values.client;
    if (allClients.length === 0) return;

    if (!selectedClientId) {
      setRegionalOptions([]);
      return;
    }

    const selectedClientObj = allClients.find((c: any) => c.id === selectedClientId);

    if (selectedClientObj && selectedClientObj.subsecretarias) {
        const regionaisDoCliente = selectedClientObj.subsecretarias.flatMap((sub: any) => 
            sub.regionais || []
        );

        const options = regionaisDoCliente.map((reg: any) => ({
            value: reg.id,
            label: reg.name 
        }));

        setRegionalOptions(options);
        
        const currentRegionalId = formik.values.regionalId;
        if (currentRegionalId) {
            const allRegionalIds = regionaisDoCliente.map((r: any) => r.id);
            if (options.length > 0 && !allRegionalIds.includes(currentRegionalId)) {
                formik.setFieldValue('regionalId', '');
            }
        }
    } else {
        setRegionalOptions([]);
         if (formik.values.regionalId) {
            formik.setFieldValue('regionalId', '');
         }
    }
  }, [formik.values.client, allClients]); 

  // --- FUNCIONALIDADES NOVAS DO COLEGA (Teachers/Students) ---

  // Buscar professores
  const { data: teachersData, refetch: refetchTeachers } = useQuery(
    ['school-teachers', formik.values.client, formik.values.id],
    async () => {
      if (!formik.values.client) return { data: { data: [] } };
      if (formik.values.id) {
        const response = await axios.get(`${API_URL}/api/Schools/${formik.values.id}/accounts`, {
          params: { PageNumber: 1, PageSize: 1000 }
        });
        return { data: { data: response.data.data.filter((acc: any) => acc.role === 'Teacher') } };
      }
      return { data: { data: [] } };
    },
    { enabled: !!formik.values.client, refetchOnMount: 'always' }
  );

  // Buscar alunos
  const { data: studentsData, refetch: refetchStudents } = useQuery(
    ['school-students', formik.values.client, formik.values.id],
    async () => {
      if (!formik.values.client) return { data: { data: [] } };
      if (formik.values.id) {
        const response = await axios.get(`${API_URL}/api/Schools/${formik.values.id}/accounts`, {
          params: { PageNumber: 1, PageSize: 1000 }
        });
        return { data: { data: response.data.data.filter((acc: any) => acc.role === 'Student') } };
      }
      return { data: { data: [] } };
    },
    { enabled: !!formik.values.client, refetchOnMount: 'always' }
  );

  // Buscar contas disponíveis
  const { data: availableAccountsData } = useQuery(
    ['available-accounts', formik.values.client],
    () => getAccountsByClient(formik.values.client, 1, 1000),
    { enabled: !!formik.values.client && !!formik.values.id }
  );

  const addUserMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      return axios.post(`${API_URL}/api/Schools/${formik.values.id}/accounts/${userId}`);
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`${variables.role === 'Teacher' ? 'Professor' : 'Aluno'} adicionado com sucesso!`);
        variables.role === 'Teacher' ? refetchTeachers() : refetchStudents();
        queryClient.invalidateQueries(['available-accounts', formik.values.client]);
      },
      onError: (error: any) => toast.error(`Erro: ${error.response?.data?.message || error.message}`),
    }
  );

  const removeUserMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      return axios.delete(`${API_URL}/api/Schools/${formik.values.id}/accounts/${userId}`);
    },
    {
      onSuccess: (_, variables) => {
        toast.success(`${variables.role === 'Teacher' ? 'Professor' : 'Aluno'} removido com sucesso!`);
        variables.role === 'Teacher' ? refetchTeachers() : refetchStudents();
        queryClient.invalidateQueries(['available-accounts', formik.values.client]);
      },
      onError: (error: any) => toast.error(`Erro: ${error.response?.data?.message || error.message}`),
    }
  );

  // Preparação de dados do colega
  const teachers = teachersData?.data?.data || [];
  const students = studentsData?.data?.data || [];
  const allAccounts = Array.isArray(availableAccountsData?.data?.data) ? availableAccountsData.data.data : [];
  const linkedUserIds = [...teachers, ...students].map((u: any) => u.id);
  
  const teacherOptions = allAccounts
    .filter((acc: any) => acc.role === 'Teacher' && !linkedUserIds.includes(acc.id))
    .map((t: any) => ({ value: t.id, label: `${t.name} ${t.lastName}` }));
    
  const studentOptions = allAccounts
    .filter((acc: any) => acc.role === 'Student' && !linkedUserIds.includes(acc.id))
    .map((s: any) => ({ value: s.id, label: `${s.name} ${s.lastName}` }));

  // Filtros de busca local
  const filterList = (list: any[], term: string) => {
    if (!term) return list;
    const lower = term.toLowerCase();
    return list.filter((item: any) => 
        item.name?.toLowerCase().includes(lower) || 
        item.lastName?.toLowerCase().includes(lower) || 
        item.email?.toLowerCase().includes(lower)
    );
  };
  const filteredTeachers = filterList(teachers, teacherSearchTerm);
  const filteredStudents = filterList(students, studentSearchTerm);


  // --- HELPERS DE RENDERIZAÇÃO (Seus) ---
  const handleAddressCreated = (addressId: string, addressLabel: string) => {
    const newAddressOption = { value: addressId, label: addressLabel };
    setAddressOptions(prev => [...prev, newAddressOption]);
    formik.setFieldValue('address', addressId);
  }

  const renderBasicFieldset = (fieldName: string, label: string, placeholder?: string, required: boolean = true) => (
    <BasicField fieldName={fieldName} label={label} placeholder={placeholder} required={required} formik={formik} />
  )

  const renderSelectFieldset = (fieldName: string, label: string, placeholder: string | undefined, options: SelectOptions[], multiselect: boolean = false, required: boolean = true) => (
    <SelectField fieldName={fieldName} label={label} placeholder={placeholder} required={required} multiselect={multiselect} options={options} formik={formik} />
  )

  return (
    <>
      <form id='kt_modal_add_school_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* --- Campos Originais (Sua estrutura) --- */}
          {renderBasicFieldset('name', 'Nome', 'Nome da escola')}
          {renderBasicFieldset('description', 'Descrição', 'Descrição')}

          {/* Endereço com Modal */}
          <div className='fv-row mb-7'>
            <label className='fw-semibold fs-6 mb-2'>Endereço</label>
            <div className='d-flex gap-2'>
              <div className='flex-grow-1'>
                <Select
                  className={clsx('react-select-styled react-select-solid mb-3 mb-lg-0', {'is-invalid': formik.getFieldMeta('address').error})}
                  classNamePrefix='react-select'
                  options={addressOptions}
                  placeholder='Selecione um endereço'
                  value={addressOptions.find(option => option.value === formik.values.address)}
                  onChange={newValue => formik.setFieldValue('address', newValue?.value)}
                  isDisabled={formik.isSubmitting}
                  styles={{
                    container: base => ({ ...base, width: '100%' }),
                    control: base => ({ ...base, minHeight: '38px', backgroundColor: 'var(--bs-input-bg, #f5f8fa)', borderColor: formik.getFieldMeta('address').error ? 'var(--bs-danger, #f1416c)' : 'var(--bs-input-border, #e4e6ef)', boxShadow: 'none' }),
                    menu: base => ({ ...base, zIndex: 9999, backgroundColor: 'var(--bs-input-bg, #fff)' }), 
                  }}
                />
                {formik.getFieldMeta('address').touched && formik.getFieldMeta('address').error && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'><span role='alert'>{formik.getFieldMeta('address').error as string}</span></div>
                  </div>
                )}
              </div>
              <button type='button' className='btn btn-sm btn-light-primary' onClick={() => setIsAddressModalOpen(true)}>
                <i className='fas fa-plus'></i> Novo
              </button>
            </div>
          </div>

          {/* Client & Regional */}
          {renderSelectFieldset('client', 'Cliente', 'Selecione um cliente', clientOptions, false, true)}
          
          {renderSelectFieldset(
            'regionalId', 
            'Regional', 
            formik.values.client ? (regionalOptions.length === 0 ? 'Este cliente não possui regionais' : 'Selecione uma regional') : 'Selecione um cliente primeiro', 
            regionalOptions, 
            false, 
            true
          )}

          {/* --- NOVA SEÇÃO DO COLEGA (Inserida abaixo dos campos principais) --- */}
          {formik.values.id && (
             <>
               <div className="separator my-10"></div>
               
               <div className="row mb-7">
                 {/* COLUNA PROFESSORES */}
                 <div className="col-md-6">
                   <div className="d-flex justify-content-between align-items-center mb-3">
                     <label className="form-label fw-bold fs-4">Professores</label>
                     <span className="badge badge-primary fs-6">{teachers.length}</span>
                   </div>
                   
                   <AsyncSelectField
                     label=""
                     fieldName="addTeacher"
                     placeholder="Adicionar professor..."
                     formik={{
                       values: { addTeacher: '' },
                       setFieldValue: (field: string, value: any) => {
                         if (value) addUserMutation.mutate({ userId: value, role: 'Teacher' });
                       },
                       errors: {}, touched: {}, getFieldMeta: () => ({}), getFieldProps: () => ({ value: '' })
                     } as any}
                     defaultOptions={teacherOptions}
                     loadOptions={(inputValue, callback) => callback(teacherOptions.filter((t: any) => t.label.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 10))}
                   />

                   {/* Busca e Lista Professores */}
                   {teachers.length > 0 && (
                     <>
                        <div className="mt-3 mb-2 position-relative">
                            <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-3 mt-3' />
                            <input type="text" className="form-control form-control-sm ps-10" placeholder="Buscar..." value={teacherSearchTerm} onChange={(e) => setTeacherSearchTerm(e.target.value)} />
                        </div>
                        <div className="mt-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {filteredTeachers.map((t: any) => (
                                <div key={t.id} className="d-flex align-items-center justify-content-between bg-light-primary p-2 rounded mb-2">
                                    <div className="d-flex align-items-center flex-grow-1 min-w-0">
                                        <div className="symbol symbol-30px me-2"><div className="symbol-label bg-primary text-white">{t.name?.charAt(0)}</div></div>
                                        <div className="min-w-0"><span className="fw-bold d-block text-truncate">{t.name} {t.lastName}</span></div>
                                    </div>
                                    <button type="button" className="btn btn-sm btn-icon btn-light-danger" onClick={() => removeUserMutation.mutate({ userId: t.id, role: 'Teacher' })}><KTIcon iconName='trash' className='fs-7' /></button>
                                </div>
                            ))}
                        </div>
                     </>
                   )}
                 </div>

                 {/* COLUNA ALUNOS */}
                 <div className="col-md-6">
                   <div className="d-flex justify-content-between align-items-center mb-3">
                     <label className="form-label fw-bold fs-4">Alunos</label>
                     <span className="badge badge-success fs-6">{students.length}</span>
                   </div>

                   <AsyncSelectField
                     label=""
                     fieldName="addStudent"
                     placeholder="Adicionar aluno..."
                     formik={{
                       values: { addStudent: '' },
                       setFieldValue: (field: string, value: any) => {
                         if (value) addUserMutation.mutate({ userId: value, role: 'Student' });
                       },
                       errors: {}, touched: {}, getFieldMeta: () => ({}), getFieldProps: () => ({ value: '' })
                     } as any}
                     defaultOptions={studentOptions}
                     loadOptions={(inputValue, callback) => callback(studentOptions.filter((s: any) => s.label.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 10))}
                   />

                   {/* Busca e Lista Alunos */}
                   {students.length > 0 && (
                     <>
                        <div className="mt-3 mb-2 position-relative">
                            <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-3 mt-3' />
                            <input type="text" className="form-control form-control-sm ps-10" placeholder="Buscar..." value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)} />
                        </div>
                        <div className="mt-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {filteredStudents.map((s: any) => (
                                <div key={s.id} className="d-flex align-items-center justify-content-between bg-light-success p-2 rounded mb-2">
                                    <div className="d-flex align-items-center flex-grow-1 min-w-0">
                                        <div className="symbol symbol-30px me-2"><div className="symbol-label bg-success text-white">{s.name?.charAt(0)}</div></div>
                                        <div className="min-w-0"><span className="fw-bold d-block text-truncate">{s.name} {s.lastName}</span></div>
                                    </div>
                                    <button type="button" className="btn btn-sm btn-icon btn-light-danger" onClick={() => removeUserMutation.mutate({ userId: s.id, role: 'Student' })}><KTIcon iconName='trash' className='fs-7' /></button>
                                </div>
                            ))}
                        </div>
                     </>
                   )}
                 </div>
               </div>
             </>
          )}
        </div>

        <div className='text-center pt-15'>
          <button type='submit' className='btn btn-primary' data-kt-users-modal-action='submit'>
            <span className='indicator-label'>Salvar</span>
            {(formik.isSubmitting || isUserLoading) && (
              <span className='indicator-progress'>Aguarde... <span className='spinner-border spinner-border-sm align-middle ms-2'></span></span>
            )}
          </button>
        </div>
      </form>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressCreated={handleAddressCreated}
      />
    </>
  )
}

export { SchoolCreateForm }
