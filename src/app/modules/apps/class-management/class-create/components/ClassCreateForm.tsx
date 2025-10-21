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

  // Log para debug
  useEffect(() => {
    console.log('ClassCreateForm: classItem mudou:', classItem);
  }, [classItem]);

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
    initialValues: {
      ...initialClass,
      ...classItem,
      // Garante que os arrays existam
      teacherIds: classItem?.teacherIds || [],
      studentIds: classItem?.studentIds || [],
      content: classItem?.content || []
    },
    validationSchema: editClassSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      console.log('Valores do formulário antes de enviar:', values);
      const finalValues = {
        ...values,
        // Garante que o formato esteja correto para o backend
        accountIds: [...(values.teacherIds || []), ...(values.studentIds || [])],
        teacherIds: values.teacherIds || [],
        studentIds: values.studentIds || [],
        content: values.content || [],
        isActive: values.isActive ?? true
      };
      console.log('Valores finais enviados para o backend:', finalValues);
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
        console.error('Erro ao salvar turma:', ex);
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

  // Carregar professores e alunos quando schoolId mudar
  useEffect(() => {
    if (!currentUser || !formik.values.schoolId) return;

    const fetchUsers = async () => {
      try {
        const res = await getAccountsBySchool(formik.values.schoolId, 1, 1000, '');
        const teachers = res.data
          .filter((acc: any) => acc.role === 'Teacher')
          .map((acc: any) => ({ value: acc.id, label: acc.name }));
        const students = res.data
          .filter((acc: any) => acc.role === 'Student')
          .map((acc: any) => ({ value: acc.id, label: acc.name }));

        setTeacherOptions(teachers);
        setStudentOptions(students);
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
                <label className="form-label">Professores</label>
                <AsyncSelectField
                  label=""
                  fieldName="teacherIds"
                  isMulti
                  placeholder="Selecione os professores..."
                  formik={formik}
                  defaultOptions={teacherOptions}
                  loadOptions={(inputValue, callback) => {
                    const filtered = teacherOptions.filter((t) =>
                      t.label.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    callback(filtered);
                  }}
                />
                
                {/* Lista de professores selecionados */}
                {formik.values.teacherIds && formik.values.teacherIds.length > 0 && (
                  <div className="mt-3">
                    <small className="text-muted">Professores adicionados:</small>
                    <div className="mt-2">
                      {formik.values.teacherIds.map((teacherId) => {
                        const teacher = teacherOptions.find(t => t.value === teacherId);
                        return teacher ? (
                          <div key={teacherId} className="d-flex align-items-center justify-content-between bg-light-primary p-2 rounded mb-2">
                            <span className="fw-bold text-primary">{teacher.label}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-light-danger"
                              onClick={() => {
                                const currentTeachers = formik.values.teacherIds || [];
                                const updatedTeachers = currentTeachers.filter(id => id !== teacherId);
                                formik.setFieldValue('teacherIds', updatedTeachers);
                              }}
                            >
                              <i className="bi bi-trash fs-6"></i>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Alunos</label>
                <AsyncSelectField
                  label=""
                  fieldName="studentIds"
                  isMulti
                  placeholder="Selecione os alunos..."
                  formik={formik}
                  defaultOptions={studentOptions}
                  loadOptions={(inputValue, callback) => {
                    const filtered = studentOptions.filter((s) =>
                      s.label.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    callback(filtered);
                  }}
                />
                
                {/* Lista de alunos selecionados */}
                {formik.values.studentIds && formik.values.studentIds.length > 0 && (
                  <div className="mt-3">
                    <small className="text-muted">Alunos adicionados:</small>
                    <div className="mt-2">
                      {formik.values.studentIds.map((studentId) => {
                        const student = studentOptions.find(s => s.value === studentId);
                        return student ? (
                          <div key={studentId} className="d-flex align-items-center justify-content-between bg-light-info p-2 rounded mb-2">
                            <span className="fw-bold text-info">{student.label}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-light-danger"
                              onClick={() => {
                                const currentStudents = formik.values.studentIds || [];
                                const updatedStudents = currentStudents.filter(id => id !== studentId);
                                formik.setFieldValue('studentIds', updatedStudents);
                              }}
                            >
                              <i className="bi bi-trash fs-6"></i>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
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
                      checked={Array.isArray(formik.values.content) && formik.values.content.includes(content)}
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
