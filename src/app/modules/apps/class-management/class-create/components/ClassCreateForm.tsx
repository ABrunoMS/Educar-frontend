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
  clientId: '',
  schoolId: '',
  accountIds: [],
  isActive: 'true', // novo campo
  schoolYear: '',   // novo campo
  schoolShift: '',  // novo campo
};

const purposeOptions: SelectOptions[] = [
  { value: 'Default', label: 'Padrão' },
  { value: 'Reinforcement', label: 'Reforços' },
  { value: 'SpecialProficiencies', label: 'Habilidade especial' },
];

const schoolYearOptions: SelectOptions[] = [
  { value: '1', label: '1º Ano' },
  { value: '2', label: '2º Ano' },
  { value: '3', label: '3º Ano' },
  { value: '4', label: '4º Ano' },
  { value: '5', label: '5º Ano' },
  { value: '6', label: '6º Ano' },
  { value: '7', label: '7º Ano' },
  { value: '8', label: '8º Ano' },
  { value: '9', label: '9º Ano' },
];

const schoolShiftOptions: SelectOptions[] = [
  { value: 'morning', label: 'Matutino' },
  { value: 'afternoon', label: 'Vespertino' },
  { value: 'night', label: 'Noturno' },
];

const activeOptions: SelectOptions[] = [
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' },
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
      const clientOptions = response.data.data.map((client: any) => ({
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
        const schoolOptions = response.data.data.map((school: any) => ({
          value: school.id,
          label: school.name,
        }));
        setSchools(schoolOptions);
      });

      // Busca os alunos da secretaria selecionada
      getAccountsByClient(selectedClientId).then((response) => {
        const accountOptions = response.data.data.map((account: any) => ({
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
    name: Yup.string().required('O nome da turma é obrigatório'),
    isActive: Yup.string().required('O campo Ativo é obrigatório'),
    clientId: Yup.string().required('A escola é obrigatória'),
    schoolId: Yup.string().required('A escola é obrigatória'),
    schoolYear: Yup.string().required('O ano escolar é obrigatório'),
    schoolShift: Yup.string().required('O turno escolar é obrigatório'),
    description: Yup.string(),
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
        <div className='row mb-3'>
          <div className='col-md-8'>
            {renderBasicFieldset('name', 'Nome da turma *', 'Nome da turma')}
          </div>
          <div className='col-md-4'>
            {renderSelectFieldset('isActive', 'Ativo *', 'Selecione', activeOptions, false, true)}
          </div>
        </div>
        <div className='row mb-3'>
          <div className='col-md-4'>
            <SelectField
              fieldName='schoolId'
              label='Escola *'
              placeholder='--- Selecione ---'
              required={true}
              options={schools}
              formik={formik}
              multiselect={false}
              onChange={(value) => {
                if (typeof value === 'string') {
                  setSelectedClientId(value);
                  formik.setFieldValue('schoolId', '');
                  formik.setFieldValue('accountIds', []);
                }
              }}
            />
          </div>
          <div className='col-md-4'>
            {renderSelectFieldset('schoolYear', 'Ano escolar *', '--- Selecione ---', schoolYearOptions, false, true)}
          </div>
          <div className='col-md-4'>
            {renderSelectFieldset('schoolShift', 'Turno escolar *', '--- Selecione ---', schoolShiftOptions, false, true)}
          </div>
        </div>
        <div className='row mb-3'>
          <div className='col-md-12'>
            {renderBasicFieldset('description', 'Descrição da turma', 'Descrição da turma', false)}
          </div>
        </div>
        <div className='row mb-3'>
          <div className='col-md-12'>
            <div className='fw-bold mb-2'>Professores</div>
            <div className='mb-2'>
              <button type='button' className='btn btn-sm btn-light me-2'>Adicionar</button>
              <button type='button' className='btn btn-sm btn-light me-2'>Editar</button>
              <button type='button' className='btn btn-sm btn-light me-2'>Excluir</button>
              <button type='button' className='btn btn-sm btn-light'>Visualizar</button>
            </div>
            <table className='table table-bordered'>
              <thead>
                <tr>
                  <th>idusuario</th>
                  <th>Usuário</th>
                  <th>Disciplina</th>
                </tr>
              </thead>
              <tbody>
                {/* Aqui será renderizada a lista de professores vinculados */}
              </tbody>
            </table>
          </div>
        </div>
        <div className='row mb-3'>
          <div className='col-md-12'>
            <div className='alert alert-info py-2 px-3'>Salve a turma antes de vincular as aulas e alunos</div>
          </div>
        </div>
      </div>
      <div className='text-center pt-15'>
        <button
          type='submit'
          className='btn btn-primary me-2'
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
        <button type='button' className='btn btn-light'>Voltar</button>
      </div>
    </form>
  );
};

export { ClassCreateForm };