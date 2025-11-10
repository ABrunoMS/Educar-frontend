import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Class } from '@interfaces/Class';
import { SelectOptions } from '@interfaces/Forms';
import AsyncSelectField from '@components/form/AsyncSelectField';
import { useAuth } from '../../../../auth';
import { getSchools, getSchoolById } from '@services/Schools';
import { getAccountsBySchool } from '@services/Accounts';
import { createClass, updateClass } from '@services/Classes';
import { isNotEmpty } from '@metronic/helpers';
import { getClientById } from '@services/Clients';
import { getAllProducts, getCompatibleContents } from '../../../client-management/clients-list/core/_requests';

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

// Conteúdos dinâmicos conforme produtos do cliente
type ContentOption = { value: string; label: string };

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
  content: Yup.array().of(Yup.string()).optional(),
  teacherIds: Yup.array().of(Yup.string()).optional(),
  studentIds: Yup.array().of(Yup.string()).optional(),
});


const ClassCreateForm: FC<Props> = ({ classItem = initialClass, isUserLoading, onFormSubmit }) => {
  const { currentUser } = useAuth();
  const [schoolOptions, setSchoolOptions] = useState<SelectOptions[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<SelectOptions[]>([]);
  const [studentOptions, setStudentOptions] = useState<SelectOptions[]>([]);
  const [contentOptions, setContentOptions] = useState<ContentOption[]>([]);

  // useEffect movido para abaixo da declaração do formik

  const formik = useFormik({
    initialValues: {
      ...initialClass,
      ...classItem,
      teacherIds: classItem?.teacherIds || [],
      studentIds: classItem?.studentIds || [],
      content: classItem?.content || []
    },
    validationSchema: editClassSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      const finalValues = {
        ...values,
        accountIds: [...(values.teacherIds || []), ...(values.studentIds || [])],
        teacherIds: values.teacherIds || [],
        studentIds: values.studentIds || [],
        content: values.content || [],
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

  // Buscar conteúdos baseados na escola selecionada (cliente da escola);
  // Sem escola: fallback para Admin (todos) e não-admin (cliente do usuário)
  useEffect(() => {
    const fetchByClientId = async (clientId: string) => {
      try {
        const { data: client } = await getClientById(clientId);
        let contents: any[] = [];
        if (Array.isArray(client.products)) {
          contents = client.products.flatMap((p: any) => Array.isArray(p.contents) ? p.contents : []);
        }
        if ((!contents || contents.length === 0) && Array.isArray(client.contents)) {
          contents = client.contents;
        }
        const uniqueContents = Array.from(new Map(contents.map((c: any) => [c.id, c])).values());
        const opts = uniqueContents.map((c: any) => ({ value: c.id, label: c.name }));
        setContentOptions(opts);
        // Sanitiza valores selecionados
        const allowed = new Set(opts.map(o => o.value));
        const selected = Array.isArray(formik.values.content) ? formik.values.content : [];
        const filtered = selected.filter((id: string) => allowed.has(id));
        if (filtered.length !== selected.length) {
          formik.setFieldValue('content', filtered);
        }
      } catch (err) {
        setContentOptions([]);
        formik.setFieldValue('content', []);
      }
    };

    const fetchAllContents = async () => {
      try {
        const productsResp = await getAllProducts();
        const allProducts = productsResp.data || [];
        const allContentsArr = await Promise.all(
          allProducts.map((p: any) => getCompatibleContents(p.id))
        );
        const allContents = allContentsArr.flat();
        const uniqueContents = Array.from(new Map(allContents.map((c: any) => [c.id, c])).values());
        const opts = uniqueContents.map((c: any) => ({ value: c.id, label: c.name }));
        setContentOptions(opts);
        const allowed = new Set(opts.map(o => o.value));
        const selected = Array.isArray(formik.values.content) ? formik.values.content : [];
        const filtered = selected.filter((id: string) => allowed.has(id));
        if (filtered.length !== selected.length) {
          formik.setFieldValue('content', filtered);
        }
      } catch {
        setContentOptions([]);
        formik.setFieldValue('content', []);
      }
    };

    const loadContents = async () => {
      const schoolId = formik.values.schoolId;
      if (schoolId) {
        // Busca cliente a partir da escola selecionada
        try {
          const { data: school } = await getSchoolById(schoolId);
          const clientId = school?.client?.id || school?.clientId;
          if (clientId) {
            await fetchByClientId(clientId);
            return;
          }
          // Se escola não tiver cliente, limpa opções
          setContentOptions([]);
          formik.setFieldValue('content', []);
          return;
        } catch {
          setContentOptions([]);
          formik.setFieldValue('content', []);
          return;
        }
      }

      // Sem escola selecionada: fallback
      if (currentUser?.client?.id) {
        await fetchByClientId(currentUser.client.id);
      } else if (currentUser?.roles?.includes('Admin')) {
        await fetchAllContents();
      } else {
        setContentOptions([]);
        formik.setFieldValue('content', []);
      }
    };

    loadContents();
  }, [formik.values.schoolId, currentUser?.client?.id, currentUser?.roles]);

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
          {/* Conteúdo */}
          <div className="col-md-4">
            <div className="mb-7">
              <label className="form-label">Conteúdo</label>
              {contentOptions.length === 0 && (
                <div className="text-muted">Nenhum conteúdo disponível para o cliente.</div>
              )}
              {contentOptions.map((content) => (
                <div className="form-check mb-3" key={content.value}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="content"
                    value={content.value}
                    checked={Array.isArray(formik.values.content) && formik.values.content.includes(content.value)}
                    onChange={formik.handleChange}
                  />
                  <label className="form-check-label">{content.label}</label>
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