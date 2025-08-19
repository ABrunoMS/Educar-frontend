import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Class } from '@interfaces/Class';
import { SelectOptions } from '@interfaces/Forms';
import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
// Importe as funções de busca da API que já criamos
import { getClients } from '@services/Clients';
import { getSchoolsByClient } from '@services/Schools';
import { getAccountsByClient } from '@services/Accounts'; // Usaremos esta agora!
import { createClass } from '@services/Classes';

type Props = {
  isUserLoading?: boolean;
  classItem?: Class;
  editMode?: boolean;
};

// 1. Atualize a interface e o objeto inicial para incluir o Cliente (Secretaria)
const initialClass: Class = {
  id: '',
  name: '',
  description: '',
  purpose: 'Default',
  clientId: '', // <-- Adicionado
  schoolId: '',
  accountIds: [],
};

const purposeOptions: SelectOptions[] = [
  { value: 'Default', label: 'Padrão' },
  { value: 'Reinforcement', label: 'Reforços' },
  { value: 'SpecialProficiencies', label: 'Habilidade especial' },
];

const ClassCreateForm: FC<Props> = ({ classItem, isUserLoading }) => {
  const [classForEdit] = useState<Class>({
    ...initialClass,
    ...classItem,
  });

  // 2. Estados para gerenciar as opções dos dropdowns em cascata
  const [clients, setClients] = useState<SelectOptions[]>([]);
  const [schools, setSchools] = useState<SelectOptions[]>([]);
  const [accounts, setAccounts] = useState<SelectOptions[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(classForEdit.clientId || null);

  // 3. Efeito para buscar as Secretarias (Clientes) quando o componente carregar
  useEffect(() => {
    getClients().then((response) => {
      const clientOptions = response.data.items.map((client: any) => ({
        value: client.id,
        label: client.name,
      }));
      setClients(clientOptions);
    });
  }, []);

  // 4. Efeito para buscar Escolas E Alunos quando uma Secretaria for selecionada
  useEffect(() => {
    if (selectedClientId) {
      // Limpa as listas anteriores
      setSchools([]);
      setAccounts([]);
      
      // Busca as escolas da secretaria selecionada
      getSchoolsByClient(selectedClientId).then((response) => {
        const schoolOptions = response.data.items.map((school: any) => ({
          value: school.id,
          label: school.name,
        }));
        setSchools(schoolOptions);
      });

      // Busca os alunos da secretaria selecionada
      getAccountsByClient(selectedClientId).then((response) => {
        const accountOptions = response.data.items.map((account: any) => ({
          value: account.id,
          label: account.name,
        }));
        setAccounts(accountOptions);
      });
    } else {
      // Se nenhuma secretaria for selecionada, limpa as listas dependentes
      setSchools([]);
      setAccounts([]);
    }
  }, [selectedClientId]); // Este efeito depende do 'selectedClientId'

  // 5. Atualizar o schema de validação
  const editClassSchema = Yup.object().shape({
    name: Yup.string().required('O nome é obrigatório'),
    clientId: Yup.string().required('A secretaria é obrigatória'), // <-- Adicionado
    schoolId: Yup.string().required('A escola é obrigatória'),
    purpose: Yup.string().oneOf(['Reinforcement', 'Default', 'SpecialProficiencies']).required('O propósito é obrigatório'),
    accountIds: Yup.array().of(Yup.string()).optional(),
  });

  const formik = useFormik({
    initialValues: classForEdit,
    validationSchema: editClassSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        await createClass(values);
        alert('Turma criada com sucesso!');
        resetForm();
      } catch (ex) {
        console.error(ex);
        alert('Houve um erro ao salvar a turma. Por favor, tente novamente.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Funções 'render'
  const renderBasicFieldset =  (
    fieldName: string,
    label: string,
    placeholder: string | null,
    required: boolean = true
  ) => (
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
    placeholder: string | null,
    options: SelectOptions[],
    multiselect: boolean = false,
    required: boolean = true,
    disabled: boolean = false,
    // Define o tipo explícito para o parâmetro do onChange
    onChange?: (value: string | string[]) => void
  ) => (
    <SelectField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      multiselect={multiselect}
      options={options}
      formik={formik}
      disabled={disabled}
      onChange={onChange}
    />
  )

  return (
    <form id='kt_modal_add_class_form' className='form' onSubmit={formik.handleSubmit} noValidate>
      <div className='d-flex flex-column me-n7 pe-7'>
        {renderBasicFieldset('name', 'Nome da Turma', 'Insira o nome da turma')}
        
        {/* 6. Adicionar o campo de seleção de Secretaria (Cliente) */}
        <SelectField
          fieldName='clientId'
          label='Secretaria'
          placeholder='Selecione uma secretaria'
          required={true}
          options={clients}
          formik={formik}
          multiselect={false}
          onChange={(value) => {
              if (typeof value === 'string') {
                setSelectedClientId(value);
                // Limpa os campos dependentes ao trocar de secretaria
                formik.setFieldValue('schoolId', '');
                formik.setFieldValue('accountIds', []);
              }
            }}
        />
        
        {/* O campo de Escola agora depende da Secretaria */}
        <SelectField
          fieldName='schoolId'
          label='Escola'
          placeholder={selectedClientId ? 'Selecione uma escola' : 'Selecione uma secretaria primeiro'}
          required={true}
          options={schools}
          multiselect={false}
          formik={formik}
          disabled={!selectedClientId || schools.length === 0}
        />

        {renderBasicFieldset('description', 'Descrição', 'Insira a descrição')}
        {renderSelectFieldset('purpose', 'Propósito', 'Selecione o propósito', purposeOptions, false, true)}
        
        {/* O campo de Alunos agora também depende da Secretaria */}
        <SelectField
          fieldName='accountIds'
          label='Alunos (Opcional)'
          placeholder={selectedClientId ? 'Selecione os alunos' : 'Selecione uma secretaria primeiro'}
          options={accounts}
          multiselect={true}
          required={false}
          formik={formik}
          disabled={!selectedClientId}
        />
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
  );
};

export { ClassCreateForm };