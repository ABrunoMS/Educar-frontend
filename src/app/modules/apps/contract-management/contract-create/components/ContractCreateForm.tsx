import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import Select from 'react-select'
import Flatpickr from "react-flatpickr"
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { ContractCreate } from '@interfaces/Contract'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { SelectOptions } from '@interfaces/Forms'
import { isNotEmpty } from '@metronic/helpers'

import { getClients } from '@services/Clients'
import { getGames } from '@services/Games'
import { createContract, updateContract } from '@services/Contracts'
import { useNavigate } from 'react-router'

type Props = {
  isUserLoading?: boolean
  contract?: ContractCreate
  onFormSubmit: () => void
}

export const initialContract: ContractCreate = {
  contractDurationInYears: 0,
  contractSigningDate: null,
  implementationDate: null,
  totalAccounts: 0,
  remainingAccounts: 0,
  deliveryReport: '',
  status: 'Signed',
  clientId: '',
  gameId: '',
}

const options: SelectOptions[] = [
  { value: '1', label: 'Client 1' },
  { value: '2', label: 'Client 2' },
  { value: '3', label: 'Client 3' },
  { value: '4', label: 'Client 4' },
]

const gameOptions: SelectOptions[] = [
  { value: '1', label: 'Game 1' },
  { value: '2', label: 'Game 2' },
  { value: '3', label: 'Game 3' },
  { value: '4', label: 'Game 4' },
]

const statusOptions: SelectOptions[] = [
  { value: 'Signed', label: 'Assinado' },
  { value: 'Expired', label: 'Expirado' },
  { value: 'Canceled', label: 'Cancelado' }
]

const ContractCreateForm: FC<Props> = ({ contract = initialContract, isUserLoading, onFormSubmit }) => {
  const navigate = useNavigate();

  // Estados para as opções dinâmicas
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([]);
  const [gameOptions, setGameOptions] = useState<SelectOptions[]>([]);

  // Efeito para buscar os dados dos dropdowns na API
  useEffect(() => {
    // Buscar Clientes
    getClients().then((res) => {
      const options = res.data.data.map((c: any) => ({ value: c.id, label: c.name }));
      setClientOptions(options);
    });

    // Buscar Games
    getGames().then((res) => {
      const options = res.data.map((g: any) => ({ value: g.id, label: g.name }));
      setGameOptions(options);
    });
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  const editUserSchema = Yup.object().shape({
    contractDurationInYears: Yup.number()
      .min(1, 'At least one year')
      .required('Field is required'),
    contractSigningDate: Yup.date()
      .required('Field is required'),
    implementationDate: Yup.date()
      .required('Field is required'),
    totalAccounts: Yup.number()
      .moreThan(0, 'Bigger than zero'),
    remainingAccounts: Yup.number()
      .required('Field is required'),
    deliveryReport: Yup.string()
      .required('Field is required'),
    status: Yup.string()
      .required('Field is required'),
    clientId: Yup.string()
      .required('Field is required'),
    gameId: Yup.string()
      .required('Field is required'),
  })

  const formik = useFormik({
    initialValues: contract,
    validationSchema: editUserSchema,
    enableReinitialize: true, // Importante para o modo de edição
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        if (isNotEmpty(values.id)) {
          // Lógica de Atualização (você precisará criar o updateContract)
          await updateContract(values.id!, values as any);
          alert('Contrato atualizado com sucesso!');
        } else {
          // Lógica de Criação
          await createContract(values as any);
          alert('Contrato criado com sucesso!');
        }
        resetForm();
        onFormSubmit(); // Chama a função para fechar/redirecionar
      } catch (ex) {
        console.error(ex);
        alert('Houve um erro ao salvar o contrato.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getDefaultSelectValue = (name: string): SelectOptions[] => {
    const initialValue = formik.getFieldProps(name).value; 
    return options.filter(option => option.value === initialValue);
  }

  const updateCalendarValue = (newValue: Date | undefined, field: string) => {
    formik.setFieldValue(field, newValue)
  }

  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    required: boolean = true
  ) =>
  <BasicField
    fieldName={fieldName}
    label={label}
    placeholder={placeholder}
    required={required}
    formik={formik}
  />

  const renderSelectFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    options: SelectOptions[],
    multiselect: boolean = false,
    required: boolean = true
  ) => (
    <SelectField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      multiselect={multiselect}
      options={options}
      formik={formik}
    />
  )

  const renderCalendarField = (fieldName: string, label: string, placeholder: string | null, required: boolean = true) => (
    <div className=' mb-7'>
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          {'required': required}
        )}
      >{label}</label>
      <Flatpickr
        className='form-control form-control-solid'
        placeholder={placeholder || ''}
        data-enable-time
        // value={getDefaultSelectValue(fieldName)}
        onChange={(date: Date[]) => {
          if(date[0] instanceof Date) return updateCalendarValue(date[0], fieldName)
          return updateCalendarValue(undefined, fieldName)
        }}
      />

      {formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{formik.getFieldMeta(fieldName).error}</span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('contractDurationInYears', 'Contract Duration (Years)', 'Enter duration in years')}
          {renderCalendarField('contractSigningDate', 'Contract Signing Date', 'Select signing date')}
          {renderCalendarField('implementationDate', 'Implementation Date', 'Select implementation date')}
          {renderBasicFieldset('totalAccounts', 'Total Accounts', 'Enter total accounts')}
          {renderBasicFieldset('remainingAccounts', 'Remaining Accounts', 'Enter remaining accounts')}
          {renderBasicFieldset('deliveryReport', 'Delivery Report', 'Enter delivery report')}
          {renderSelectFieldset('status', 'Status', 'Select status', statusOptions)}
          {/* Client (Agora usa dados da API) */}
          {renderSelectFieldset('clientId', 'Client', 'Select...', clientOptions)}

          {/* Game (Agora usa dados da API) */}
          {renderSelectFieldset('gameId', 'Game', 'Select...', gameOptions)}
        </div>

        <div className='text-center pt-15'>
          <button type='submit' className='btn btn-primary' disabled={formik.isSubmitting || !formik.isValid}>
            <span className='indicator-label'>Submit</span>
            {/* ... */}
          </button>
        </div>
      </form>
    </>
  )
}

export {ContractCreateForm}
