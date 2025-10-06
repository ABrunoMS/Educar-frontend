import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Class } from '@interfaces/Class';
import { SelectOptions } from '@interfaces/Forms';
import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { useAuth } from '../../../../auth';
import { getAccountsBySchool } from '@services/Accounts';
import { createClass, updateClass } from '@services/Classes';
import { isNotEmpty } from '@metronic/helpers';
import AsyncSelectField from '@components/form/AsyncSelectField';

type Props = {
  isUserLoading?: boolean;
  classItem?: Class;
  onFormSubmit: () => void;
};

// Objeto inicial simplificado
const initialClass: Class = {
  id: '',
  name: '',
  description: '',
  purpose: 'Default',
  schoolId: '',
  accountIds: [],
  isActive: true,
  schoolYear: '',
  schoolShift: '',
  content: [],
  teacherIds: [], // Adicione para o estado inicial
  studentIds: [],
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

const contentOptions = [
  'Odisséia', 'Educação financeira', 'Saeb', 'Empreendedorismo', 'Enem', 'Jornada do trabalho'
]

const ClassCreateForm: FC<Props> = ({ classItem = initialClass, isUserLoading, onFormSubmit }) => {
  const { currentUser } = useAuth();

  // Estados para as opções dos dropdowns dinâmicos
  const [schoolOptions, setSchoolOptions] = useState<SelectOptions[]>([]);

  // Schema de validação com Yup
  const editClassSchema = Yup.object().shape({
    name: Yup.string().required('O nome da turma é obrigatório'),
    isActive: Yup.boolean().required('O campo Ativo é obrigatório'),
    schoolId: Yup.string().required('A escola é obrigatória'),
    schoolYear: Yup.string().required('O ano escolar é obrigatório'),
    schoolShift: Yup.string().required('O turno escolar é obrigatório'),
    description: Yup.string().optional(),
    content: Yup.array().of(Yup.string()).optional(),
    teacherIds: Yup.array().of(Yup.string()).optional(),
    studentIds: Yup.array().of(Yup.string()).optional(),
  });

  // Configuração do Formik
  const formik = useFormik({
    initialValues: classItem,
    validationSchema: editClassSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Antes de enviar, junta os IDs de professores e alunos em 'accountIds'
      const finalValues = {
        ...values,
        accountIds: [...(values.teacherIds || []), ...(values.studentIds || [])],
      };
      
      setSubmitting(true);
      try {
        if (isNotEmpty(finalValues.id)) {
          await updateClass(finalValues.id, finalValues);
          alert('Turma atualizada com sucesso!');
        } else {
          await createClass(finalValues);
          alert('Turma criada com sucesso!');
        }
        onFormSubmit(); // Fecha o modal
      } catch (ex) { 
        console.error(ex);
        alert('Ocorreu um erro ao salvar a turma.');
      } 
      finally { 
        setSubmitting(false);
      }
    },
  });

  // Efeito para carregar as escolas do usuário logado
  useEffect(() => {
    if (currentUser?.schools && currentUser.schools.length > 0) {
      const options = currentUser.schools.map((school) => ({
        value: school.id,
        label: school.name,
      }));
      setSchoolOptions(options);

      if (options.length === 1 && !formik.values.schoolId) {
        formik.setFieldValue('schoolId', options[0].value);
      }
    }
  }, [currentUser, formik]);

  // Função que busca professores sob demanda para o autocomplete
  const loadTeachers = (inputValue: string, callback: (options: SelectOptions[]) => void) => {
    const schoolId = formik.values.schoolId;
    if (!schoolId || inputValue.length < 2) {
      return callback([]);
    }
    getAccountsBySchool(schoolId, 1, 50, inputValue).then((res) => {
      const allAccounts = res.data.map((acc: any) => ({ value: acc.id, label: acc.name, role: acc.role }));
      const teachers = allAccounts.filter(acc => acc.role === 'Teacher');
      callback(teachers);
    });
  };

  // Função que busca alunos sob demanda para o autocomplete
  const loadStudents = (inputValue: string, callback: (options: SelectOptions[]) => void) => {
    const schoolId = formik.values.schoolId;
    if (!schoolId || inputValue.length < 2) {
      return callback([]);
    }
    getAccountsBySchool(schoolId, 1, 50, inputValue).then((res) => {
      const allAccounts = res.data.map((acc: any) => ({ value: acc.id, label: acc.name, role: acc.role }));
      const students = allAccounts.filter(acc => acc.role === 'Student');
      callback(students);
    });
  };

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className='card-body'>
        <div className='row'>
          {/* Coluna da Esquerda */}
          <div className='col-md-8'>
            {/* Nome e Ativo */}
            <div className='row mb-7'>
              <div className='col-md-10'>
                <label className='form-label required'>Nome da turma</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Insira o nome da turma'
                  {...formik.getFieldProps('name')}
                />
              </div>
              <div className='col-md-2'>
                <label className='form-label required'>Ativo</label>
                <div className='form-check form-switch form-check-solid form-check-custom mt-2'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    {...formik.getFieldProps('isActive')}
                    checked={formik.values.isActive}
                  />
                </div>
              </div>
            </div>

            {/* Escola, Ano e Turno */}
            <div className='row mb-7'>
              <div className='col-md-4'>
                <SelectField
                  label='Escola'
                  required={true}
                  placeholder='Selecione...'
                  options={schoolOptions}
                  formik={formik}
                  fieldName='schoolId'
                  multiselect={false}
                  onChange={() => {
                    formik.setFieldValue('teacherIds', []);
                    formik.setFieldValue('studentIds', []);
                  }}
                />
              </div>
              <div className='col-md-4'>
                <SelectField
                  label='Ano escolar'
                  required={true}
                  placeholder='Selecione...'
                  options={schoolYearOptions}
                  formik={formik}
                  fieldName='schoolYear'
                  multiselect={false}
                />
              </div>
              <div className='col-md-4'>
                <SelectField
                  label='Turno escolar'
                  required={true}
                  placeholder='Selecione...'
                  options={schoolShiftOptions}
                  formik={formik}
                  fieldName='schoolShift'
                  multiselect={false}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className='row mb-7'>
              <div className='col-md-12'>
                <label className='form-label'>Descrição</label>
                <textarea
                  className='form-control'
                  rows={3}
                  placeholder='Insira a descrição da turma'
                  {...formik.getFieldProps('description')}
                ></textarea>
              </div>
            </div>

            {/* Listas de Professores e Alunos com Autocomplete */}
            <div className='row mb-7'>
              <div className='col-md-6'>
                <AsyncSelectField
                  label="Professores"
                  fieldName="teacherIds"
                  isMulti={true}
                  placeholder="Digite para buscar..."
                  loadOptions={loadTeachers}
                  formik={formik}
                />
              </div>
              <div className='col-md-6'>
                <AsyncSelectField
                  label="Alunos"
                  fieldName="studentIds"
                  isMulti={true}
                  placeholder="Digite para buscar..."
                  loadOptions={loadStudents}
                  formik={formik}
                />
              </div>
            </div>
          </div>

          {/* Coluna da Direita */}
          <div className='col-md-4'>
            <div className='mb-7'>
              <label className='form-label'>Conteúdo</label>
              {contentOptions.map(content => (
                <div className='form-check form-check-solid mb-3' key={content}>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    name='content'
                    value={content}
                    checked={formik.values.content.includes(content)}
                    onChange={formik.handleChange}
                  />
                  <label className='form-check-label'>{content}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className='card-footer d-flex justify-content-end py-6 px-9'>
          <button type='button' className='btn btn-light me-2' onClick={onFormSubmit}>
            Cancelar
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={isUserLoading || formik.isSubmitting || !formik.isValid}
          >
            <span className='indicator-label'>Salvar</span>
            {formik.isSubmitting && (
              <span className='indicator-progress'>
                Aguarde...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export { ClassCreateForm };
