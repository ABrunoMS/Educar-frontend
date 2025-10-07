import React, { useState, useEffect } from 'react';
import { useFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { SelectOptions } from '@interfaces/Forms';
import { Class } from '@interfaces/Class';
import { SchoolType } from '@interfaces/School';
import { PaginatedResponse } from '@contexts/PaginationContext';

import { getSchools } from '@services/Schools';
import { getClassesBySchools } from '@services/Classes';

type OptionType = SelectOptions;

const LessonCreateForm: React.FC = () => {
  const navigate = useNavigate();

  const [schoolOptions, setSchoolOptions] = useState<OptionType[]>([]);
  const [classOptions, setClassOptions] = useState<OptionType[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [disciplines] = useState<OptionType[]>([
    { value: '1', label: 'Matemática' },
    { value: '2', label: 'Português' },
  ]);

  const [schoolYears] = useState<OptionType[]>([
    { value: '6', label: '6º Ano' },
    { value: '7', label: '7º Ano' },
  ]);

  const bnccOptions = [
    'BNCC',
    'Saeb',
    'Enem',
    'Educação financeira',
    'Empreendedorismo',
    'Jornada do trabalho',
  ];

  const validationSchema = Yup.object().shape({
    description: Yup.string().required('Descrição obrigatória'),
    school: Yup.string().required('Escola obrigatória'),
    class: Yup.string().required('Turma obrigatória'),
    discipline: Yup.string().required('Disciplina obrigatória'),
    schoolYear: Yup.string().required('Ano escolar obrigatório'),
    combat: Yup.string().required('Combate obrigatório'),
    bncc: Yup.array().min(1, 'Selecione ao menos uma opção BNCC'),
  });

  const formik = useFormik({
    initialValues: {
      description: '',
      school: '',
      class: '',
      discipline: '',
      schoolYear: '',
      combat: '',
      bncc: [] as string[],
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        console.log('Aula sendo salva:', values);

        const lessonId = 'a1b2c3d4';
        navigate(`../steps/${lessonId}`);
      } catch (error) {
        console.error('Erro ao salvar a aula:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Carregar escolas
  useEffect(() => {
    setIsLoadingSchools(true);

    getSchools()
      .then((res: { data: PaginatedResponse<SchoolType> }) => {
        const options: OptionType[] = res.data.data
          .filter((school): school is SchoolType & { id: string } => school.id !== undefined)
          .map((school) => ({
            value: school.id,
            label: school.name || '',
          }));
        setSchoolOptions(options);
      })
      .catch((error) => console.error('Erro ao carregar escolas:', error))
      .finally(() => setIsLoadingSchools(false));
  }, []);

  // Carregar turmas ao selecionar escola
  useEffect(() => {
    const selectedSchoolId = formik.values.school;

    if (!selectedSchoolId) {
      setClassOptions([]);
      return;
    }

    setIsLoadingClasses(true);
    getClassesBySchools([selectedSchoolId])
      .then((res: { data: Class[] }) => {
        const options: OptionType[] = res.data.map((classItem: Class) => ({
          value: classItem.id,
          label: classItem.name,
        }));

        setClassOptions(options);

        if (!options.some((opt) => opt.value === formik.values.class)) {
          formik.setFieldValue('class', '');
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar turmas:', error);
        setClassOptions([]);
      })
      .finally(() => setIsLoadingClasses(false));
  }, [formik.values.school]);

  return (
    <div className="w-100">
      <form
        onSubmit={formik.handleSubmit}
        className="form pb-8 d-flex flex-column gap-4"
        noValidate
      >
        {/* Seção 1 - Informações básicas */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Informações básicas</h6>
          <div className="row g-4">
            <div className="col-md-6">
              <SelectField
                fieldName="schoolYear"
                label="Ano escolar"
                placeholder="---"
                options={schoolYears}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="discipline"
                label="Disciplina"
                placeholder="---"
                options={disciplines}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
              />
            </div>
            <div className="col-12">
              <BasicField
                fieldName="description"
                label="Descrição"
                placeholder="Descrição da aula"
                required
                formik={formik}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Seção 2 - Escola e Turma */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Escola e Turma</h6>
          <div className="row g-4">
            <div className="col-md-6">
              <SelectField
                fieldName="school"
                label="Escola"
                placeholder="---"
                options={schoolOptions}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
                loading={isLoadingSchools}
              />
            </div>
            <div className="col-md-6">
              <SelectField
                fieldName="class"
                label="Turma"
                placeholder={formik.values.school ? '---' : 'Selecione uma escola primeiro'}
                options={classOptions}
                required
                multiselect={false}
                formik={formik as FormikProps<any>}
                loading={isLoadingClasses}
                isDisabled={!formik.values.school || isLoadingClasses}
              />
            </div>
          </div>
        </div>

        {/* Seção 3 - Diretrizes */}
        <div className="bg-body rounded-2xl shadow-sm p-4">
          <h6 className="fw-semibold text-muted mb-3">Diretrizes</h6>
          <div className="row g-4">
            <div className="col-md-6">
              <BasicField
                fieldName="combat"
                label="Combate"
                placeholder="Ex: Evasão escolar"
                required
                formik={formik}
              />
            </div>

            {/* BNCC */}
            <div className="col-md-6">
              <label className="form-label fw-semibold mb-2 required">BNCC</label>
              <div className="d-flex flex-wrap gap-2">
                {bnccOptions.map((opt) => {
                  const checked = formik.values.bncc.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={clsx(
                        'btn btn-sm rounded-pill',
                        checked
                          ? 'btn-primary'
                          : 'btn-outline-secondary text-muted'
                      )}
                      onClick={() => {
                        const newValues = checked
                          ? formik.values.bncc.filter((v) => v !== opt)
                          : [...formik.values.bncc, opt];
                        formik.setFieldValue('bncc', newValues);
                        formik.setFieldTouched('bncc', true);
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Mensagem de erro padronizada */}
              <div className="mt-2" style={{ minHeight: '18px' }}>
                {(formik.touched.bncc || formik.submitCount > 0) &&
                  formik.errors.bncc && (
                    <div className="text-danger small">{formik.errors.bncc as string}</div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerta */}
        <div className="alert alert-info py-2 px-3 d-flex align-items-center gap-2">
          <i className="bi bi-info-circle fs-5"></i>
          <span>Salve a aula antes de vincular etapas e alunos.</span>
        </div>

        {/* Botões */}
        <div className="d-flex justify-content-end gap-3 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/aulas')}
          >
            Voltar
          </button>

          <button
            type="submit"
            className="btn btn-primary px-5 fw-bold"
            disabled={formik.isSubmitting || isLoadingSchools || isLoadingClasses}
          >
            {formik.isSubmitting ? (
              <>
                <span>Aguarde...</span>
                <span className="spinner-border spinner-border-sm ms-2"></span>
              </>
            ) : (
              'Salvar e continuar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonCreateForm;
