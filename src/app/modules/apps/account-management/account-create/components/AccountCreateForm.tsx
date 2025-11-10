import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'

import BasicField from '@components/form/BasicField'
import { SelectField } from '@components/form'
import { SelectOptions } from '@interfaces/Forms'
import { Account } from '@interfaces/Account'
import { Role, ALL_ROLES } from '@contexts/roles.generated'

// Importe as APIs que você já usa (caminhos baseados no seu arquivo)
import { getClients } from '@services/Clients'
import { getSchoolsByClient } from '@services/Schools'
import { getClassesBySchools } from '@services/Classes'
import { createAccount, updateAccount } from '@services/Accounts'
import { isNotEmpty } from '@metronic/helpers'

type Props = {
  isUserLoading?: boolean
  account?: Account
  clientId?: string // <-- NOVO: Prop opcional para o ID do cliente
  onFormSubmit: () => void
}

export const initialAccount: Account = {
  avatar: '',
  name: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  registrationNumber: '',
  averageScore: 0,
  eventAverageScore: 0,
  stars: 0,
  clientId: '', // Será preenchido
  role: 'Student',
  schoolIds: [],
  classIds: []
}

const AccountCreateForm: FC<Props> = ({
  account,
  isUserLoading,
  clientId, // <-- Recebe a prop
  onFormSubmit,
}) => {
  // MODIFICADO: Preenche o 'clientId' da prop se ele existir
  const [accountForEdit] = useState<Account>({
    ...initialAccount,
    ...account,
    clientId: account?.clientId || clientId || '', // <-- Preenche automaticamente
  })

  // MODIFICADO: Define o cliente selecionado baseado na prop ou na conta
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    account?.clientId || clientId || undefined
  )
  
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>(
    account?.schoolIds || []
  )
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([])
  const [schoolOptions, setSchoolOptions] = useState<SelectOptions[]>([])
  const [classOptions, setClassOptions] = useState<SelectOptions[]>([])
  const intl = useIntl()

  // MODIFICADO: Schema de validação
  const editAccountSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    lastName: Yup.string().required('Field is required'),
    password: Yup.string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .when('id', {
        is: (id: string) => !isNotEmpty(id), // Obrigatório só na CRIAÇÃO
        then: (schema) => schema.required('A senha é obrigatória'),
        otherwise: (schema) => schema.optional(), // Opcional na EDIÇÃO
      }),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
      .when('password', { // Só exige confirmação se a senha foi digitada
        is: (password: string) => isNotEmpty(password),
        then: (schema) => schema.required('A confirmação de senha é obrigatória'),
      }),
    email: Yup.string().email('Invalid email').required('Field is required'),
    registrationNumber: Yup.string().required('Field is required'),
    
    // Tornados opcionais
    averageScore: Yup.number().min(0).optional(),
    eventAverageScore: Yup.number().min(0).optional(),
    stars: Yup.number().min(0).optional(),
    
    clientId: Yup.string().optional(), // <-- TORNADO OPCIONAL (vem da prop)
    role: Yup.string().required('Field is required'),
    schoolIds: Yup.array().of(Yup.string()).optional(), // <-- TORNADO OPCIONAL
    classIds: Yup.array().of(Yup.string()).optional(),
  })

  const formik = useFormik({
    initialValues: accountForEdit,
    validationSchema: editAccountSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true)
      
      const payload = { ...values }
      // Não envia senha/confirmação se estiver editando e não foram alteradas
      if (isNotEmpty(values.id) && !isNotEmpty(values.password)) {
        delete (payload as Partial<Account>).password
        delete (payload as Partial<Account>).confirmPassword
      }
      
      try {
        if (isNotEmpty(payload.id)) {
          await updateAccount(payload)
          alert('Usuário atualizado com sucesso!')
        } else {
          await createAccount(payload)
          alert('Usuário criado com sucesso!')
        }
        resetForm()
        onFormSubmit() // <-- Chama o callback para fechar o modal
      } catch (ex) {
        console.error(ex)
        alert('Houve um erro ao salvar o usuário.')
      } finally {
        setSubmitting(false)
      }
    },
  })

  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder?: string,
    required: boolean = true,
    type: 'text' | 'password' | 'number' = 'text'
  ) => (
    <BasicField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      formik={formik}
      type={type}
    />
  )

  // MODIFICADO: Só busca clientes se 'clientId' NÃO foi passado via prop
  useEffect(() => {
    // Se estamos no contexto de um cliente (prop 'clientId' existe), não busca a lista
    if (!clientId) {
      getClients().then((res) => {
        const options = res.data.data.map((c: any) => ({
          value: c.id,
          label: c.name,
        }))
        setClientOptions(options)
      })
    }
  }, [clientId]) // Adiciona 'clientId' como dependência

  // MODIFICADO: Este useEffect agora roda automaticamente se 'clientId' (via prop)
  // for definido, disparando a busca por escolas.
  useEffect(() => {
    if (selectedClientId) {
      getSchoolsByClient(selectedClientId).then((res) => {
        const options = res.data.data.map((s: any) => ({
          value: s.id,
          label: s.name,
        }))
        setSchoolOptions(options)
      })
    } else {
      setSchoolOptions([])
    }
  }, [selectedClientId])

  // Este useEffect não muda
  useEffect(() => {
    if (selectedSchoolIds.length > 0) {
      getClassesBySchools(selectedSchoolIds).then((res) => {
        const options = res.data.map((c: any) => ({
          value: c.id,
          label: c.name,
        }))
        setClassOptions(options)
      })
    } else {
      setClassOptions([])
    }
  }, [selectedSchoolIds])

  return (
    // ID do formulário alterado para ser mais genérico
    <form id='kt_modal_add_account_form_in_client' className='form' onSubmit={formik.handleSubmit} noValidate>
      {/* Adicionado scroll para o modal */}
      <div 
        className='d-flex flex-column me-n7 pe-7'
        style={{ maxHeight: '65vh', overflowY: 'auto', overflowX: 'hidden'}}
      >
        {renderBasicFieldset('name', 'Name', 'Enter account name')}
        {renderBasicFieldset('lastName', 'Sobrenome', 'Insira o sobrenome')}
        {renderBasicFieldset('email', 'Email', 'Enter email address')}
        {renderBasicFieldset('registrationNumber', 'Registration Number', 'Enter registration number')}
        
        {/* Campos de pontuação opcionais */}
        {renderBasicFieldset('averageScore', 'Average Score', '0', false, 'number')}
        {renderBasicFieldset('eventAverageScore', 'Event Average Score', '0', false, 'number')}
        {renderBasicFieldset('stars', 'Stars', '0', false, 'number')}

        {/* Campos de senha */}
        {renderBasicFieldset(
          'password',
          'Senha',
          account?.id ? 'Deixe em branco para não alterar' : 'Insira a senha',
          !account?.id, // Obrigatório só na criação
          'password'
        )}
        {renderBasicFieldset(
          'confirmPassword',
          'Confirmar Senha',
          'Confirme a senha',
          !account?.id, // Obrigatório só na criação
          'password'
        )}

        {/* MODIFICADO: Oculta o campo 'Cliente' se 'clientId' foi passado via prop */}
        {!clientId && (
          <SelectField
            fieldName='clientId'
            label='Cliente'
            placeholder='Selecione uma Cliente'
            options={clientOptions}
            formik={formik}
            multiselect={false}
            required
            onChange={(value) => {
              if (typeof value === 'string') {
                setSelectedClientId(value)
                formik.setFieldValue('schoolIds', [])
                formik.setFieldValue('classIds', [])
                setSelectedSchoolIds([])
              }
            }}
          />
        )}

        {/* MODIFICADO: Campo de escolas agora é opcional */}
        <SelectField
          fieldName='schoolIds'
          label='Escolas (Opcional)'
          placeholder={selectedClientId ? 'Selecione uma ou mais escolas' : 'Selecione um cliente primeiro'}
          options={schoolOptions}
          formik={formik}
          multiselect
          required={false} // <-- TORNADO OPCIONAL
          disabled={!selectedClientId}
          onChange={(value) => {
            if (Array.isArray(value)) {
              setSelectedSchoolIds(value)
              formik.setFieldValue('classIds', [])
            }
          }}
        />

        <SelectField
          fieldName='classIds'
          label='Turmas (Opcional)'
          placeholder={selectedSchoolIds.length > 0 ? 'Selecione uma ou mais turmas' : 'Selecione uma escola primeiro'}
          options={classOptions}
          formik={formik}
          multiselect
          required={false}
          disabled={selectedSchoolIds.length === 0}
        />

        {/* Campo de Cargo (Roles) */}
        <div className='mb-7'>
          <label className='required fw-bold fs-6 mb-5'>Cargo</label>
          <div className='d-flex flex-wrap gap-3'>
            {ALL_ROLES.map((role, idx) => {
              const label =
                role === 'Admin' ? 'Administrador'
                : role === 'Teacher' ? 'Professor'
                : role === 'TeacherEducar' ? 'Professor Educar'
                : role === 'Student' ? 'Aluno'
                : role === 'AgenteComercial' ? 'Agente Comercial'
                : role === 'Diretor' ? 'Diretor'
                : role === 'Distribuidor' ? 'Distribuidor'
                : role === 'Secretario' ? 'Secretário'
                : role
              return (
                <div className='form-check form-check-custom form-check-solid p-0' key={idx} style={{minWidth: 140}}>
                  <input
                    className='form-check-input d-none'
                    {...formik.getFieldProps('role')}
                    name='role'
                    type='radio'
                    value={role}
                    id={`kt_modal_update_role_option_${idx}`}
                    checked={formik.values.role === role}
                    disabled={formik.isSubmitting || isUserLoading}
                  />
                  <label
                    className={`form-check-label w-100 px-4 py-3 rounded border text-center ${formik.values.role === role ? 'bg-primary text-white border-primary shadow-sm' : 'bg-light border-gray-300 text-gray-800'}`}
                    htmlFor={`kt_modal_update_role_option_${idx}`}
                    style={{cursor: 'pointer', display: 'block'}}>
                    <span className='fw-bold fs-6'>{label}</span>
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className='text-center pt-15'>
        <button type='submit' className='btn btn-primary' data-kt-users-modal-action='submit' disabled={formik.isSubmitting || isUserLoading}>
          <span className='indicator-label'>Submit</span>
          {(formik.isSubmitting || isUserLoading) && (
            <span className='indicator-progress'>
              Please wait...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>
    </form>
  )
}

export { AccountCreateForm }