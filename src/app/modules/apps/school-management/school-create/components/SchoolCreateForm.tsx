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
import AsyncSelectField from '@components/form/AsyncSelectField'
import { getClients } from '@services/Clients'
import { getAddresses } from '@services/Addresses'
import { getAccountsByClient } from '@services/Accounts'
import { createSchool, updateSchool } from '@services/Schools'
import { isNotEmpty } from '@metronic/helpers'
import { AddressModal } from './AddressModal'
import { toast } from 'react-toastify'

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
  regionalId: '',
  teacherIds: [],
  studentIds: [],
  contractStartDate: ''
}

const SchoolCreateForm: FC<Props> = ({ school, schoolItem, isUserLoading, onFormSubmit }) => {
  // --- Estados ---
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([]);
  const [addressOptions, setAddressOptions] = useState<SelectOptions[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]); 
  const [regionalOptions, setRegionalOptions] = useState<SelectOptions[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [availableTeacherOptions, setAvailableTeacherOptions] = useState<SelectOptions[]>([]);
  const [availableStudentOptions, setAvailableStudentOptions] = useState<SelectOptions[]>([]);

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
        regionalId: regionalIdValue,
        teacherIds: item?.teacherIds || [],
        studentIds: item?.studentIds || [],
        contractStartDate: item?.contractStartDate || ''
    }
  }, [currentSchool]);

  const intl = useIntl()

  const editSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    description: Yup.string().required('Descrição é obrigatória'),
    address: Yup.string().optional(),
    client: Yup.string().required('Cliente é obrigatório'),
    regionalId: Yup.string().required('Regional é obrigatório'),
    teacherIds: Yup.array().of(Yup.string()).optional(),
    studentIds: Yup.array().of(Yup.string()).optional(),
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
        // contractStartDate removed from create form — do not include in payload
        
        // Enviar teacherIds e studentIds separadamente
        if (values.teacherIds && values.teacherIds.length > 0) schoolData.teacherIds = values.teacherIds;
        if (values.studentIds && values.studentIds.length > 0) schoolData.studentIds = values.studentIds;
        
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

  // Carregar professores e alunos disponíveis quando cliente for selecionado
  useEffect(() => {
    if (!formik.values.client) {
      setAvailableTeacherOptions([]);
      setAvailableStudentOptions([]);
      return;
    }

    const fetchAvailableUsers = async () => {
      try {
        const response = await getAccountsByClient(formik.values.client, 1, 1000);
        const accounts = response.data.data || [];
        
        const teachers = accounts
          .filter((acc: any) => acc.role === 'Teacher')
          .map((acc: any) => ({ value: acc.id, label: `${acc.name} ${acc.lastName || ''}`.trim() }));
        
        const students = accounts
          .filter((acc: any) => acc.role === 'Student')
          .map((acc: any) => ({ value: acc.id, label: `${acc.name} ${acc.lastName || ''}`.trim() }));
        
        setAvailableTeacherOptions(teachers);
        setAvailableStudentOptions(students);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setAvailableTeacherOptions([]);
        setAvailableStudentOptions([]);
      }
    };

    fetchAvailableUsers();
  }, [formik.values.client]);

  // --- HELPERS DE RENDERIZAÇÃO ---
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

          {/* contractStartDate removed from the create form */}

          {/* --- SEÇÃO: Professores e Alunos --- */}
          <div className="separator my-10"></div>
          
          {!formik.values.client ? (
            <div className="alert alert-warning d-flex align-items-center">
              <i className="bi bi-info-circle fs-2 me-3"></i>
              <div>
                <strong>Selecione um cliente primeiro</strong> para poder adicionar professores e alunos à escola.
              </div>
            </div>
          ) : (
            <div className="row mb-7">
              {/* COLUNA PROFESSORES */}
              <div className="col-md-6">
                <label className="form-label">Professores</label>
                <AsyncSelectField
                  label=""
                  fieldName="teacherIds"
                  isMulti
                  placeholder="Selecione os professores..."
                  formik={formik}
                  defaultOptions={availableTeacherOptions}
                  loadOptions={(inputValue, callback) => {
                    const filtered = availableTeacherOptions
                      .filter((t) => t.label.toLowerCase().includes(inputValue.toLowerCase()))
                      .slice(0, 10);
                    callback(filtered);
                  }}
                />
                {/* Lista de professores selecionados */}
                {formik.values.teacherIds && formik.values.teacherIds.length > 0 && (
                  <div className="mt-3">
                    <small className="text-muted">Professores adicionados:</small>
                    <div className="mt-2">
                      {formik.values.teacherIds.map((teacherId: string) => {
                        const teacher = availableTeacherOptions.find(t => t.value === teacherId);
                        return teacher ? (
                          <div key={teacherId} className="d-flex align-items-center justify-content-between bg-light-primary p-2 rounded mb-2">
                            <span className="fw-bold text-primary">{teacher.label}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-light-danger"
                              onClick={() => {
                                const currentTeachers = formik.values.teacherIds || [];
                                const updatedTeachers = currentTeachers.filter((id: string) => id !== teacherId);
                                formik.setFieldValue('teacherIds', updatedTeachers);
                              }}
                            >
                              <i className="bi bi-trash fs-6"></i>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* COLUNA ALUNOS */}
              <div className="col-md-6">
                <label className="form-label">Alunos</label>
                <AsyncSelectField
                  label=""
                  fieldName="studentIds"
                  isMulti
                  placeholder="Selecione os alunos..."
                  formik={formik}
                  defaultOptions={availableStudentOptions}
                  loadOptions={(inputValue, callback) => {
                    const filtered = availableStudentOptions
                      .filter((s) => s.label.toLowerCase().includes(inputValue.toLowerCase()))
                      .slice(0, 10);
                    callback(filtered);
                  }}
                />
                {/* Lista de alunos selecionados */}
                {formik.values.studentIds && formik.values.studentIds.length > 0 && (
                  <div className="mt-3">
                    <small className="text-muted">Alunos adicionados:</small>
                    <div className="mt-2">
                      {formik.values.studentIds.map((studentId: string) => {
                        const student = availableStudentOptions.find(s => s.value === studentId);
                        return student ? (
                          <div key={studentId} className="d-flex align-items-center justify-content-between bg-light-success p-2 rounded mb-2">
                            <span className="fw-bold text-success">{student.label}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-light-danger"
                              onClick={() => {
                                const currentStudents = formik.values.studentIds || [];
                                const updatedStudents = currentStudents.filter((id: string) => id !== studentId);
                                formik.setFieldValue('studentIds', updatedStudents);
                              }}
                            >
                              <i className="bi bi-trash fs-6"></i>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
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