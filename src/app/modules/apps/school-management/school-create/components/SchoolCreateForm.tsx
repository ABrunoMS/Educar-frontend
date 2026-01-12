import React, { FC, useState, useEffect, useMemo } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
// ... seus imports ...
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import Select from 'react-select'
import { School, SchoolType } from '@interfaces/School'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { getClients } from '@services/Clients'
import { getAddresses } from '@services/Addresses'
import { createSchool, updateSchool } from '@services/Schools'
import { isNotEmpty } from '@metronic/helpers'
import { AddressModal } from './AddressModal'

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
  const [clientOptions, setClientOptions] = useState<SelectOptions[]>([]);
  const [addressOptions, setAddressOptions] = useState<SelectOptions[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]); 
  const [regionalOptions, setRegionalOptions] = useState<SelectOptions[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const currentSchool = schoolItem || school;
  
 
  const dialogueForEdit = useMemo(() => {
  
    const item = currentSchool as any;
    const clientIdValue = item?.clientId || item?.client?.id || (typeof item?.client === 'string' ? item.client : '') || '';
    const addressIdValue = item?.addressId || item?.address?.id || (typeof item?.address === 'string' ? item.address : '') || '';
    const regionalIdValue = item?.regionalId || item?.regional?.id || '';

    return {
        id: currentSchool?.id || '',
        name: currentSchool?.name || '',
        description: currentSchool?.description || '',
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
          alert('Escola atualizada com sucesso!');
        } else {
          await createSchool(schoolData);
          alert('Escola criada com sucesso!');
          formik.resetForm();
        }
        
        if (onFormSubmit) onFormSubmit();
      } catch (ex) {
        console.error('Erro ao salvar escola:', ex);
        alert('Houve um erro ao salvar a escola.');
      } finally {
        setSubmitting(false);
      }
    },
  })

  useEffect(() => {
    getClients().then((response) => {
      const data = response.data.data || [];
      setAllClients(data); 

      const options = data.map((client: any) => ({
        value: client.id,
        label: client.name,
      }));
      setClientOptions(options);
    }).catch((error) => {
      console.error('Erro ao buscar clientes:', error);
    });

    getAddresses().then((response) => {
      const addressOptions = response.data.data.map((address: any) => ({
        value: address.id,
        label: `${address.street}, ${address.city} - ${address.state}`,
      }));
      setAddressOptions(addressOptions);
    }).catch((error) => {
      console.error('Erro ao buscar endereços:', error);
    });
  }, []);

  // 2. CORREÇÃO NO USEEFFECT DA REGIONAL
  useEffect(() => {
    const selectedClientId = formik.values.client;

    // Se ainda não carregou os clientes, PARE. 
    // Isso evita que ele limpe a regional do Formik antes de ter os dados para validar.
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
            // Só limpa se a lista de regionais JÁ FOI CARREGADA e o ID atual não está nela
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

  // ... (Resto do código: handleAddressCreated, renderers, return) ...
  // Mantenha o restante do seu código igual

  const handleAddressCreated = (addressId: string, addressLabel: string) => {
    const newAddressOption = { value: addressId, label: addressLabel };
    setAddressOptions(prev => [...prev, newAddressOption]);
    formik.setFieldValue('address', addressId);
  }

  const renderBasicFieldset = (fieldName: string, label: string, placeholder?: string, required: boolean = true) => (
    <BasicField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      formik={formik}
    />
  )

  const renderSelectFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | undefined,
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
      <form id='kt_modal_add_school_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Nome', 'Nome da escola')}
          {renderBasicFieldset('description', 'Descrição', 'Descrição')}

          {/* Endereço */}
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
                  value={addressOptions.find(option => option.value === formik.values.address)}
                  name='address'
                  onChange={newValue => formik.setFieldValue('address', newValue?.value)}
                  isDisabled={formik.isSubmitting}
                  styles={{
                    container: base => ({ ...base, width: '100%' }),
                    control: base => ({
                      ...base,
                      minHeight: '38px',
                      backgroundColor: 'var(--bs-input-bg, #f5f8fa)',
                      borderColor: formik.getFieldMeta('address').error ? 'var(--bs-danger, #f1416c)' : 'var(--bs-input-border, #e4e6ef)',
                      boxShadow: 'none',
                      '&:hover': { borderColor: formik.getFieldMeta('address').error ? 'var(--bs-danger, #f1416c)' : 'var(--bs-primary, #009ef7)' },
                    }),
                     menu: base => ({ ...base, zIndex: 9999, backgroundColor: 'var(--bs-input-bg, #fff)' }), 
                  }}
                />
                {formik.getFieldMeta('address').touched && formik.getFieldMeta('address').error && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>
                      <span role='alert'>{formik.getFieldMeta('address').error as string}</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                type='button'
                className='btn btn-sm btn-light-primary'
                onClick={() => setIsAddressModalOpen(true)}
              >
                <i className='fas fa-plus'></i> Novo
              </button>
            </div>
          </div>

          {/* Client */}
          {renderSelectFieldset('client', 'Cliente', 'Selecione um cliente', clientOptions, false, true)}

          {/* Regional */}
          {renderSelectFieldset(
            'regionalId', 
            'Regional', 
            formik.values.client 
                ? (regionalOptions.length === 0 ? 'Este cliente não possui regionais' : 'Selecione uma regional')
                : 'Selecione um cliente primeiro', 
            regionalOptions, 
            false, 
            true
          )}
        </div>

        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
          >
            <span className='indicator-label'>Salvar</span>
            {(formik.isSubmitting || isUserLoading) && (
              <span className='indicator-progress'>
                Aguarde...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
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