import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Class } from '@interfaces/Class';
import { SelectOptions } from '@interfaces/Forms';
import SelectField from '@components/form/SelectField';
import AsyncSelectField from '@components/form/AsyncSelectField';
import { useAuth } from '../../../../auth';
import { getSchools } from '@services/Schools';
import { getAccountsBySchool } from '@services/Accounts';
import { createClass, updateClass } from '@services/Classes';
import { isNotEmpty } from '@metronic/helpers';

type Props = {
  isUserLoading?: boolean;
  classItem?: Class;
  onFormSubmit: () => void;
};

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
  teacherIds: [],
  studentIds: [],
};

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

const contentOptions = [
  'Odisséia', 'Educação financeira', 'Saeb', 'Empreendedorismo', 'Enem', 'Jornada do trabalho'
];

const ClassCreateForm: FC<Props> = ({ classItem = initialClass, isUserLoading, onFormSubmit }) => {
  const { currentUser } = useAuth();
  const [schoolOptions, setSchoolOptions] = useState<SelectOptions[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<SelectOptions[]>([]);
  const [studentOptions, setStudentOptions] = useState<SelectOptions[]>([]);

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

  const formik = useFormik({
    initialValues: classItem,
    validationSchema: editClassSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
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
        onFormSubmit();
      } catch (ex) {
        console.error(ex);
        alert('Ocorreu um erro ao salvar a turma.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Carregar escolas
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.roles?.includes('Admin')) {
      getSchools().then((res) => {
        const options = res.data.data.map((school: any) => ({
          value: school.id,
          label: school.name,
        }));
        setSchoolOptions(options);
      });
    } else if (currentUser.schools?.length) {
      const options = currentUser.schools.map((school) => ({
        value: school.id,
        label: school.name,
      }));
      setSchoolOptions(options);
      if (options.length === 1 && !formik.values.schoolId) {
        formik.setFieldValue('schoolId', options[0].value);
      }
    }
  }, [currentUser]);

  // Carregar professores e alunos
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        let id: string;
        if (!currentUser.roles?.includes('Admin')) {
          id = formik.values.schoolId || currentUser.client?.id || '';
        } else {
          id = formik.values.schoolId || '';
        }

        if (!id) return;

        const res = await getAccountsBySchool(id, 1, 1000, '');
        const teachers = res.data
          .filter((acc: any) => acc.role === 'Teacher')
          .map((acc: any) => ({ value: acc.id, label: acc.name }));
        const students = res.data
          .filter((acc: any) => acc.role === 'Student')
          .map((acc: any) => ({ value: acc.id, label: acc.name }));

        setTeacherOptions(teachers);
        setStudentOptions(students);

        // Pré-seleciona no modo edição
        if (classItem.teacherIds?.length) formik.setFieldValue('teacherIds', classItem.teacherIds);
        if (classItem.studentIds?.length) formik.setFieldValue('studentIds', classItem.studentIds);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    fetchUsers();
  }, [currentUser, formik.values.schoolId]);

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            {/* Nome e Ativo */}
            <div className="row mb-7">
              <div className="col-md-10">
                <label className="form-label required">Nome da turma</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Insira o nome da turma"
                  {...formik.getFieldProps('name')}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label required">Ativo</label>
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    {...formik.getFieldProps('isActive')}
                    checked={formik.values.isActive}
                  />
                </div>
              </div>
            </div>

            {/* Escola, Ano, Turno */}
            <div className="row mb-7">
              <div className="col-md-4">
                <SelectField
                  label="Escola"
                  required
                  placeholder="Selecione..."
                  options={schoolOptions}
                  formik={formik}
                  fieldName="schoolId"
                />
              </div>
              <div className="col-md-4">
                <SelectField
                  label="Ano escolar"
                  required
                  placeholder="Selecione..."
                  options={schoolYearOptions}
                  formik={formik}
                  fieldName="schoolYear"
                  multiselect={false}
                />
              </div>
              <div className="col-md-4">
                <SelectField
                  label="Turno escolar"
                  required
                  placeholder="Selecione..."
                  options={schoolShiftOptions}
                  formik={formik}
                  fieldName="schoolShift"
                  multiselect={false}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="row mb-7">
              <div className="col-md-12">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Insira a descrição da turma"
                  {...formik.getFieldProps('description')}
                />
              </div>
            </div>

            {/* Professores e Alunos */}
            <div className="row mb-7">
              <div className="col-md-6">
                <AsyncSelectField
                  label="Professores"
                  fieldName="teacherIds"
                  isMulti
                  placeholder="Selecione os professores..."
                  formik={formik}
                  defaultOptions={teacherOptions} // mostra todos de início
                  loadOptions={(inputValue, callback) => {
                    const filtered = teacherOptions.filter((t) =>
                      t.label.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    callback(filtered);
                  }}
                />
              </div>
              <div className="col-md-6">
                <AsyncSelectField
                  label="Alunos"
                  fieldName="studentIds"
                  isMulti
                  placeholder="Selecione os alunos..."
                  formik={formik}
                  defaultOptions={studentOptions} // mostra todos de início
                  loadOptions={(inputValue, callback) => {
                    const filtered = studentOptions.filter((s) =>
                      s.label.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    callback(filtered);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="col-md-4">
            <div className="mb-7">
              <label className="form-label">Conteúdo</label>
              {contentOptions.map((content) => (
                <div className="form-check mb-3" key={content}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="content"
                    value={content}
                    checked={formik.values.content.includes(content)}
                    onChange={formik.handleChange}
                  />
                  <label className="form-check-label">{content}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="card-footer d-flex justify-content-end py-6 px-9">
          <button type="button" className="btn btn-light me-2" onClick={onFormSubmit}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUserLoading || formik.isSubmitting || !formik.isValid}
          >
            <span className="indicator-label">Salvar</span>
            {formik.isSubmitting && (
              <span className="indicator-progress">
                Aguarde...{' '}
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export { ClassCreateForm };
