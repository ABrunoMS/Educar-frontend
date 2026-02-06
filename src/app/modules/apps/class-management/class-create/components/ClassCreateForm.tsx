import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Class } from '@interfaces/Class';
import { SelectOptions } from '@interfaces/Forms';
import AsyncSelectField from '@components/form/AsyncSelectField';
import { useAuth } from '../../../../auth';
import { getSchools } from '@services/Schools';
import { getAccountsBySchool } from '@services/Accounts';
import { createClass, updateClass } from '@services/Classes';
import { getGrades } from '@services/Grades';
import { isNotEmpty } from '@metronic/helpers';

type Props = {
  isUserLoading?: boolean;
  classItem?: Class;
  onFormSubmit: () => void;
  readOnly?: boolean;
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
  studentIds: []
};

const schoolShiftOptions: SelectOptions[] = [
  { value: 'morning', label: 'Matutino' },
  { value: 'afternoon', label: 'Vespertino' },
  { value: 'night', label: 'Noturno' },
];

// Função para filtrar e limitar opções
const filterOptions = (options: SelectOptions[], inputValue: string) => {
  return options
    .filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 10);
};

const editClassSchema = Yup.object().shape({
  name: Yup.string().required('O nome da turma é obrigatório'),
  isActive: Yup.boolean().required('O campo Ativo é obrigatório'),
  schoolId: Yup.string().required('A escola é obrigatória'),
  schoolYear: Yup.string().required('O ano escolar é obrigatório'),
  schoolShift: Yup.string().required('O turno escolar é obrigatório'),
  description: Yup.string().optional(),
  teacherIds: Yup.array().of(Yup.string()).optional(),
  studentIds: Yup.array().of(Yup.string()).optional(),
});


const ClassCreateForm: FC<Props> = ({ classItem = initialClass, isUserLoading, onFormSubmit, readOnly = false }) => {
  const { currentUser } = useAuth();
  const [schoolOptions, setSchoolOptions] = useState<SelectOptions[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<SelectOptions[]>([]);
  const [studentOptions, setStudentOptions] = useState<SelectOptions[]>([]);
  const [schoolYearOptions, setSchoolYearOptions] = useState<SelectOptions[]>([]);

  const formik = useFormik({
    initialValues: {
      ...initialClass,
      ...classItem,
      teacherIds: classItem?.teacherIds || [],
      studentIds: classItem?.studentIds || []
    },
    validationSchema: editClassSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      const finalValues = {
        ...values,
        accountIds: [...(values.teacherIds || []), ...(values.studentIds || [])],
        teacherIds: values.teacherIds || [],
        studentIds: values.studentIds || [],
        isActive: values.isActive ?? true
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
        alert('Ocorreu um erro ao salvar a turma.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Carregar anos letivos do backend
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await getGrades();
        const options = res.data.data.map((grade: any) => ({
          value: grade.name,
          label: grade.name,
        }));
        setSchoolYearOptions(options);
      } catch (error) {
        console.error('Erro ao carregar anos letivos:', error);
      }
    };
    fetchGrades();
  }, []);

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
    // eslint-disable-next-line
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
    // eslint-disable-next-line
  }, [currentUser, formik.values.schoolId]);

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="card-body">
        <div className="row">
          <div className="col-md-12">
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
                <AsyncSelectField
                  label="Escola"
                  placeholder="Selecione..."
                  fieldName="schoolId"
                  formik={formik}
                  defaultOptions={schoolOptions}
                  loadOptions={(inputValue, callback) => {
                    callback(filterOptions(schoolOptions, inputValue));
                  }}
                />
              </div>
              <div className="col-md-4">
                <AsyncSelectField
                  label="Ano escolar"
                  placeholder="Selecione..."
                  fieldName="schoolYear"
                  formik={formik}
                  defaultOptions={schoolYearOptions}
                  loadOptions={(inputValue, callback) => {
                    callback(filterOptions(schoolYearOptions, inputValue));
                  }}
                />
              </div>
              <div className="col-md-4">
                <AsyncSelectField
                  label="Turno escolar"
                  placeholder="Selecione..."
                  fieldName="schoolShift"
                  formik={formik}
                  defaultOptions={schoolShiftOptions}
                  loadOptions={(inputValue, callback) => {
                    callback(filterOptions(schoolShiftOptions, inputValue));
                  }}
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
                    const filtered = teacherOptions
                      .filter((t) =>
                        t.label.toLowerCase().includes(inputValue.toLowerCase())
                      )
                      .slice(0, 10);
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
                    const filtered = studentOptions
                      .filter((s) =>
                        s.label.toLowerCase().includes(inputValue.toLowerCase())
                      )
                      .slice(0, 10);
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
        </div>
        {/* Botões */}
        <div className="card-footer d-flex justify-content-end py-6 px-9">
          {readOnly ? (
            <div className='alert alert-info mb-0'>
              <i className='fas fa-info-circle me-2'></i>
              Você está visualizando esta turma em modo somente leitura.
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export { ClassCreateForm };