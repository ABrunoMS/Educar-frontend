import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'

import BasicField from '@components/form/BasicField'
import { SelectField } from '@components/form'
import { SelectOptions } from '@interfaces/Forms'
import { Account } from '@interfaces/Account'

import { getClients } from '@services/Clients'
import { getSchoolsByClient } from '@services/Schools'
import { getClassesBySchools } from '@services/Classes'
import { createAccount, updateAccount } from '@services/Accounts'
import { isNotEmpty } from '@metronic/helpers'

type Props = {
  isUserLoading?: boolean
  account?: Account
  schoolOptions?: { value: string; label: string }[]
  classOptions?: { value: string; label: string }[]
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
  clientId: '',
  role: 'Student',
  schoolIds: [],
  classIds: []
}

const AccountCreateForm: FC<Props> = ({ account, isUserLoading, onFormSubmit }) => {
  const [accountForEdit] = useState<Account>({ ...initialAccount, ...account })
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(account?.clientId || undefined)
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>(account?.schoolIds || [])
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([])
  const [schoolOptions, setSchoolOptions] = useState<SelectOptions[]>([])
  const [classOptions, setClassOptions] = useState<SelectOptions[]>([])
  const intl = useIntl()

  const editAccountSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    lastName: Yup.string().required('Field is required'),
    password: Yup.string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .required('A senha é obrigatória'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
      .required('A confirmação de senha é obrigatória'),
    email: Yup.string().email('Invalid email').required('Field is required'),
    registrationNumber: Yup.string().required('Field is required'),
    averageScore: Yup.number().min(0, 'Must be 0 or higher').required('Field is required'),
    eventAverageScore: Yup.number().min(0, 'Must be 0 or higher').required('Field is required'),
    stars: Yup.number().min(0, 'Must be 0 or higher').required('Field is required'),
    clientId: Yup.string().required('Field is required'),
    role: Yup.string().required('Field is required'),
    schoolIds: Yup.array().of(Yup.string()).when('role', {
      is: (role: string) => role !== 'Admin',
      then: (schema) => schema.min(1, 'Field is required'),
      otherwise: (schema) => schema.optional()
    }),
    classIds: Yup.array().of(Yup.string()).optional()
  })

  const formik = useFormik({
    initialValues: accountForEdit,
    validationSchema: editAccountSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true)
      try {
        if (isNotEmpty(values.id)) {
          await updateAccount(values)
          alert('Usuário atualizado com sucesso!')
        } else {
          await createAccount(values)
          alert('Usuário criado com sucesso!')
        }
        resetForm()
        onFormSubmit()
      } catch (ex) {
        console.error(ex)
        alert('Houve um erro ao salvar o usuário.')
      } finally {
        setSubmitting(false)
      }
    }
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

  useEffect(() => {
    getClients().then((res) => {
      const options = res.data.data.map((c: any) => ({ value: c.id, label: c.name }))
      setClientOptions(options)
    })
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      getSchoolsByClient(selectedClientId).then((res) => {
        const options = res.data.data.map((s: any) => ({ value: s.id, label: s.name }))
        setSchoolOptions(options)
      })
    } else {
      setSchoolOptions([])
    }
  }, [selectedClientId])

  useEffect(() => {
    if (selectedSchoolIds.length > 0) {
      getClassesBySchools(selectedSchoolIds).then((res) => {
        const options = res.data.map((c: any) => ({ value: c.id, label: c.name }))
        setClassOptions(options)
      })
    } else {
      setClassOptions([])
    }
  }, [selectedSchoolIds])

  return (
    <form id='kt_modal_add_account_form' className='form' onSubmit={formik.handleSubmit} noValidate>
      <div className='d-flex flex-column me-n7 pe-7'>
        {renderBasicFieldset('name', 'Name', 'Enter account name')}
        {renderBasicFieldset('lastName', 'Sobrenome', 'Insira o sobrenome')}
        {renderBasicFieldset('email', 'Email', 'Enter email address')}
        {renderBasicFieldset('registrationNumber', 'Registration Number', 'Enter registration number')}
        {renderBasicFieldset('averageScore', 'Average Score', 'Enter average score')}
        {renderBasicFieldset('eventAverageScore', 'Event Average Score', 'Enter event average score')}
        {renderBasicFieldset('stars', 'Stars', 'Enter stars')}
        {renderBasicFieldset('password', 'Senha', 'Insira a senha', true, 'password')}
        {renderBasicFieldset('confirmPassword', 'Confirmar Senha', 'Confirme a senha', true, 'password')}

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

        <SelectField
          fieldName='schoolIds'
          label='Escolas'
          placeholder={selectedClientId ? 'Selecione uma ou mais escolas' : undefined}
          options={schoolOptions}
          formik={formik}
          multiselect
          required={false}
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
          placeholder={selectedSchoolIds.length > 0 ? 'Selecione uma ou mais turmas' : undefined}
          options={classOptions}
          formik={formik}
          multiselect
          required={false}
          disabled={selectedSchoolIds.length === 0}
        />

        <div className='mb-7'>
          <label className='required fw-bold fs-6 mb-5'>Role</label>
          {['Admin', 'Teacher', 'Student'].map((role, idx) => (
            <div className='d-flex fv-row' key={idx}>
              <div className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input me-3'
                  {...formik.getFieldProps('role')}
                  name='role'
                  type='radio'
                  value={role}
                  id={`kt_modal_update_role_option_${idx}`}
                  checked={formik.values.role === role}
                  disabled={formik.isSubmitting || isUserLoading}
                />
                <label className='form-check-label' htmlFor={`kt_modal_update_role_option_${idx}`}>
                  <div className='fw-bolder text-gray-800'>
                    {role === 'Admin' ? 'Administrator' : role === 'Teacher' ? 'Professor' : 'Aluno'}
                  </div>
                </label>
              </div>
              {idx < 2 && <div className='separator separator-dashed my-5'></div>}
            </div>
          ))}
        </div>
      </div>

      <div className='text-center pt-15'>
        <button type='submit' className='btn btn-primary' data-kt-users-modal-action='submit'>
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
