import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { School, SchoolType } from '@interfaces/School'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { getClients } from '@services/Clients'
import { getAddresses } from '@services/Addresses'
import { createSchool } from '@services/Schools'
import { isNotEmpty } from '@metronic/helpers'

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
      .required('Endereço é obrigatório'),
    client: Yup.string()
      .required('Cliente é obrigatório'),
  })

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
          addressId: values.address,
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
          {renderSelectFieldset('address', 'Address', 'Select a address', addressOptions, false, true)}

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
    </>
  )
}

export { SchoolCreateForm }
