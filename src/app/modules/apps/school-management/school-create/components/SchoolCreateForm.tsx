import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import Select from 'react-select'
import { School, SchoolType } from '@interfaces/School'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { getClients } from '@services/Clients'
import { getAddresses } from '@services/Addresses'
import { createSchool } from '@services/Schools'
import { isNotEmpty } from '@metronic/helpers'
import { AddressModal } from './AddressModal'

type Props = {
  isUserLoading?: boolean
  school?: School
}

const initialSchool: School = {
  id: '',
  name: '',
  description: '',
  address: '',
  client: ''
}

const SchoolCreateForm: FC<Props> = ({ school, isUserLoading }) => {
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([]);
  const [addressOptions, setAddressOptions] = useState<SelectOptions[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [dialogueForEdit] = useState<School>({
    ...school,
    name: school?.name || initialSchool.name,
    description: school?.description || initialSchool.description,
    address: school?.address || initialSchool.address,
    client: school?.client || initialSchool.client
  })

  const intl = useIntl()

  useEffect(() => {
    // Buscar clientes da API
    getClients().then((response) => {
      const clientOptions = response.data.items.map((client: any) => ({
        value: client.id,
        label: client.name,
      }));
      setClientOptions(clientOptions);
    }).catch((error) => {
      console.error('Erro ao buscar clientes:', error);
    });

    // Buscar endereços da API
    getAddresses().then((response) => {
      const addressOptions = response.data.items.map((address: any) => ({
        value: address.id,
        label: `${address.street}, ${address.city} - ${address.state}`,
      }));
      setAddressOptions(addressOptions);
    }).catch((error) => {
      console.error('Erro ao buscar endereços:', error);
    });
  }, []);

  const editSchema = Yup.object().shape({
    name: Yup.string()
      .required('Nome é obrigatório'),
    description: Yup.string()
      .required('Descrição é obrigatória'),
    address: Yup.string()
      .optional(),
    client: Yup.string()
      .required('Cliente é obrigatório'),
  })

  const handleAddressCreated = (addressId: string, addressLabel: string) => {
    // Adicionar o novo endereço às opções
    const newAddressOption = {
      value: addressId,
      label: addressLabel,
    };
    setAddressOptions(prev => [...prev, newAddressOption]);
    
    // Selecionar automaticamente o novo endereço
    formik.setFieldValue('address', addressId);
  }

  const formik = useFormik({
    initialValues: dialogueForEdit,
    validationSchema: editSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const schoolData: SchoolType = {
          name: values.name,
          description: values.description,
          addressId: values.address || null,
          clientId: values.client,
        };
        
        await createSchool(schoolData);
        alert('Escola criada com sucesso!');
        formik.resetForm();
      } catch (ex) {
        console.error(ex);
        alert('Houve um erro ao salvar a escola. Por favor, tente novamente.');
      } finally {
        setSubmitting(false);
      }
    },
  })

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

  return (
    <>
      <form id='kt_modal_add_game_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* Name */}
          {renderBasicFieldset('name', 'Nome', 'Enter name...')}

          {/* Description */}
          {renderBasicFieldset('description', 'Description', 'Enter description')}

          {/* Address */}
          <div className='fv-row mb-7'>
            <label className='fw-semibold fs-6 mb-2'>Endereço</label>
            <div className='d-flex gap-2'>
              <div className='flex-grow-1'>
                <Select 
                  className={clsx(
                    'react-select-styled react-select-solid mb-3 mb-lg-0',
                    {'is-invalid': formik.getFieldMeta('address').error}
                  )}
                  classNamePrefix='react-select' 
                  options={addressOptions}
                  placeholder='Selecione um endereço'
                  defaultValue={addressOptions.filter(option => option.value === formik.getFieldProps('address').value)}
                  name='address'
                  onChange={(newValue) => formik.setFieldValue('address', newValue?.value)}
                  isDisabled={formik.isSubmitting}
                />
                {formik.getFieldMeta('address').touched && formik.getFieldMeta('address').error && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>
                      <span role='alert'>{formik.getFieldMeta('address').error}</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                type='button'
                className='btn btn-sm btn-light-primary'
                onClick={() => setIsAddressModalOpen(true)}
              >
                <i className='fas fa-plus'></i>
                Novo
              </button>
            </div>
          </div>

          {/* Client */}
          {renderSelectFieldset('client', 'Client', 'Select a client', clientOptions, false, true)}
        </div>

        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
          >
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

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressCreated={handleAddressCreated}
      />
    </>
  )
}

export { SchoolCreateForm }
