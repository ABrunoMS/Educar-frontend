import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import Select from 'react-select';
import { getClassStudentsReport, getClassById } from '@services/Classes';
import { getQuests } from '@services/Lesson';
import { getAccountById } from '@services/Accounts';
import { KTCard } from '@metronic/helpers';

interface Props { classId: string }

const ClassStudentReport: React.FC<Props> = ({ classId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [classInfo, setClassInfo] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  const [filterText, setFilterText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [progressFilter, setProgressFilter] = useState<'all'|'high'|'mid'|'low'>('all');
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [minStudentsFilter, setMinStudentsFilter] = useState<number | ''>('');
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!classId) return;
    let mounted = true;
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [reportResp, classResp] = await Promise.allSettled([
          getClassStudentsReport(classId),
          getClassById(classId),
        ]);

        if (!mounted) return;

        if (reportResp.status === 'fulfilled') setReportData(reportResp.value?.data ?? null);

        let studentIds: string[] = [];
        const cls = classResp.status === 'fulfilled' ? (classResp.value?.data ?? classResp.value ?? null) : null;
        if (cls) {
          const c: any = cls;
          studentIds = c.studentIds || c.accountIds || [];
          setClassInfo(c);
          // try to derive subjects
          try {
            const questsResp = await getQuests(false);
            const allQuests = questsResp?.data?.data || [];
            const contentIds = (c.contentIds || c.content || c.contents || []).map((cc: any) => (cc && cc.id) || cc).filter(Boolean);
            const productIds = (c.productIds || c.products || []).map((p: any) => (p && p.id) || p).filter(Boolean);
            const linked = allQuests.filter((q: any) => contentIds.includes(q.contentId) || productIds.includes(q.productId));
            const subs = new Set<string>();
            linked.forEach((q: any) => { const s = typeof q.subject === 'string' ? q.subject : (q.subject && q.subject.name) || null; if (s) subs.add(s); });
            setSubjectOptions(['all', ...Array.from(subs)]);
          } catch (e) { /* ignore */ }
        }

        const accounts: any[] = [];
        if (studentIds && studentIds.length) {
          const promises = studentIds.map((id) => getAccountById(id).catch(() => null));
          const results = await Promise.all(promises);
          results.forEach((r) => { if (r) accounts.push(r); });
        }
        if (mounted) setStudents(accounts);
      } catch (err: any) {
        if (!mounted) return;
        setError('Não foi possível carregar o relatório');
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, [classId]);

  const normalizeProgress = (v: any) => {
    if (v == null) return 0;
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return n > 1 ? Math.min(100, n) : Math.min(100, Math.round(n * 10000) / 100);
  };

  // build select options from loaded students
  const studentOptionsList = students.map((s: any) => ({
    value: s.id || s.accountId || s.email || s.username || s,
    label: s.fullName || s.name || s.displayName || (s.email || s.username || '').split('@')[0] || 'Aluno'
  }));

  // custom styles to match dark Metronic theme and be responsive
  const selectStyles: any = {
    control: (provided: any, state: any) => ({
      ...provided,
      background: 'var(--kt-body-bg, #0b0d10)',
      borderColor: state.isFocused ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
      boxShadow: 'none',
      minHeight: 44,
      height: 44,
      borderRadius: '0.5rem',
      paddingLeft: 12,
      paddingRight: 8,
      color: 'var(--kt-body-color, #fff)',
      fontFamily: 'inherit',
      fontSize: '0.95rem',
      lineHeight: '1.25'
    }),
    singleValue: (provided: any) => ({ ...provided, color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }),
    menu: (provided: any) => ({ ...provided, background: 'var(--kt-body-bg, #0b0d10)', zIndex: 60, borderRadius: 8, boxShadow: '0 6px 18px rgba(11,13,16,0.6)' }),
    option: (provided: any, state: any) => ({
      ...provided,
      background: state.isFocused ? 'rgba(255,255,255,0.03)' : 'transparent',
      color: state.isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)',
      padding: '8px 12px'
    }),
    placeholder: (provided: any) => ({ ...provided, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
    input: (provided: any) => ({ ...provided, color: 'rgba(255,255,255,0.9)', padding: 0 }),
    dropdownIndicator: (provided: any) => ({ ...provided, color: 'rgba(255,255,255,0.6)', padding: 8 }),
    clearIndicator: (provided: any) => ({ ...provided, color: 'rgba(255,255,255,0.6)', padding: 8 }),
    controlHeight: (provided: any) => ({ ...provided, minHeight: 38 })
  };

  // filters
  const filtered = students.filter((s: any) => {
    if (selectedStudent) {
      const sel = selectedStudent.value;
      const sid = s.id || s.accountId || s.email || s.username;
      if (!sid || sel !== sid) return false;
    }
    const name = (s.fullName || s.name || s.displayName || '').toString().toLowerCase();
    const email = (s.email || s.username || '').toString().toLowerCase();
    const textOk = !filterText || name.includes(filterText.toLowerCase()) || email.includes(filterText.toLowerCase());
    const prog = normalizeProgress(s.progress);
    let progOk = true;
    if (progressFilter === 'high') progOk = prog >= 80;
    if (progressFilter === 'mid') progOk = prog >= 50 && prog < 80;
    if (progressFilter === 'low') progOk = prog < 50;
    return textOk && progOk;
  });

  const bySubject = subjectFilter && subjectFilter !== 'all' ? filtered.filter((s: any) => {
    if (s.subjects && Array.isArray(s.subjects)) return s.subjects.some((x: any) => (x || '').toString().toLowerCase() === subjectFilter.toLowerCase());
    if (s.progressBySubject && typeof s.progressBySubject === 'object') return Object.keys(s.progressBySubject).some((k) => k.toLowerCase() === subjectFilter.toLowerCase());
    return true;
  }) : filtered;

  let finalStudents = bySubject;
  if (minStudentsFilter !== '' && typeof minStudentsFilter === 'number') {
    finalStudents = bySubject.length >= minStudentsFilter ? bySubject : [];
  }

  const sortedFinal = finalStudents.slice().sort((a: any, b: any) => normalizeProgress(b.progress) - normalizeProgress(a.progress));
  const chartNames = sortedFinal.map((s: any) => s?.fullName || s?.name || s?.displayName || (s?.email || '').split('@')[0] || 'Aluno');
  const chartSeries = sortedFinal.map((s: any) => normalizeProgress(s.progress));
  const studentColors = chartSeries.map((p: number) => (p >= 80 ? '#28a745' : p >= 50 ? '#ffc107' : '#6c757d'));

  const radialOptions: any = {
    chart: { sparkline: { enabled: true } },
    plotOptions: { radialBar: { hollow: { size: '60%' }, dataLabels: { name: { show: false }, value: { formatter: (v: any) => `${Number(v).toFixed(1)}%` } } } },
    colors: ['#009ef7']
  };
  const barOptions: any = {
    chart: { toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '50%', borderRadius: 6 } },
    dataLabels: { enabled: true, formatter: (val: any) => `${Number(val).toFixed(1)}%`, style: { colors: ['#fff'] } },
    tooltip: { y: { formatter: (val: any) => `${Number(val).toFixed(1)}%` } },
    colors: studentColors,
    xaxis: { max: 100 }
  };

  const average = () => {
    if (reportData?.average != null) return Number(reportData.average);
    if (reportData?.students && Array.isArray(reportData.students)) {
      const vals = reportData.students.map((s: any) => Number(s.progress || 0));
      if (!vals.length) return 0;
      return Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 100) / 100;
    }
    const vals = finalStudents.map((s: any) => Number(s.progress || 0));
    if (!vals.length) return 0;
    return Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 100) / 100;
  };

  return (
    <KTCard className='p-6'>
      <div className='d-flex flex-stack mb-5'>
        <h3 className='card-title fw-bold'>Relatório de Alunos</h3>
      </div>

      {isLoading && <div className='text-center'>Carregando relatório... <span className='spinner-border spinner-border-sm align-middle ms-2'></span></div>}

      {!isLoading && error && <div className='text-center text-muted p-6'>{error}</div>}

      {!isLoading && !error && (
        <div>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <div className='fw-semibold'>{classInfo?.name || 'Turma'}</div>
              <div className='text-muted fs-8'>{classInfo?.teacherNames ? `Professores: ${classInfo.teacherNames.join(', ')}` : (classInfo?.teacherIds ? `Professores: ${classInfo.teacherIds.length}` : '')}</div>
            </div>
            <div className='d-flex align-items-center'>
              <div style={{ minWidth: 220, maxWidth: 520, width: '100%' }} className='me-3'>
                <Select
                  className='react-select--compact react-select-container form-select form-select-solid form-select-sm'
                  options={studentOptionsList}
                  value={selectedStudent}
                  onChange={(opt: any) => { setSelectedStudent(opt); setFilterText(opt ? opt.label : ''); }}
                  placeholder='Buscar aluno por nome ou email'
                  isClearable
                  isSearchable
                  menuPlacement='auto'
                  styles={selectStyles}
                  classNamePrefix='react-select'
                />
              </div>
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className='form-select form-select-solid form-select-sm me-3'>
                {subjectOptions.length === 0 ? <option value='all'>Todas as matérias</option> : subjectOptions.map((s) => <option key={s} value={s}>{s === 'all' ? 'Todas as matérias' : s}</option>)}
              </select>
              <select value={progressFilter} onChange={(e) => setProgressFilter(e.target.value as any)} className='form-select form-select-solid form-select-sm me-3'>
                <option value='all'>Todos</option>
                <option value='high'>&gt;= 80%</option>
                <option value='mid'>50% - 79%</option>
                <option value='low'>&lt;50%</option>
              </select>
              <input type='number' min={0} value={minStudentsFilter === '' ? '' : minStudentsFilter} onChange={(e) => setMinStudentsFilter(e.target.value === '' ? '' : Number(e.target.value))} placeholder='Mín alunos' className='form-control form-control-solid form-control-sm' style={{ width: 110 }} />
            </div>
          </div>

          <div className='mb-6 row gx-4 gy-4'>
            <div className='col-12 col-md-4'>
              <div className='card p-3'>
                <div className='fw-semibold mb-2'>Progresso médio da turma</div>
                <div className='d-flex align-items-center'>
                    <div style={{ width: 120 }}>
                    <Chart options={radialOptions} series={[Number(average())]} type='radialBar' width={120} />
                  </div>
                  <div className='ms-3'>
                    <div className='text-muted'>Média</div>
                    <div className='fw-bold fs-4'>{Number(average()).toFixed(1)}%</div>
                    <div className='text-muted fs-8'>{finalStudents.length} alunos</div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-12 col-md-8'>
              <div className='card p-3'>
                <div className='d-flex justify-content-between mb-2'><div className='fw-semibold'>Distribuição de progresso por aluno</div></div>
                <div>
                  {chartSeries.length === 0 || chartSeries.every((v) => v === 0) ? (
                    <div className='text-muted p-6'>Nenhum progresso registrado para os alunos desta turma.</div>
                  ) : (
                    <Chart options={{ ...barOptions, xaxis: { categories: chartNames } }} series={[{ name: 'Progresso', data: chartSeries }]} type='bar' height={Math.max(220, chartSeries.length * 36)} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {finalStudents.length > 0 && (
            <div className='mb-4'>
              <div className='fw-semibold mb-2'>Top alunos</div>
              <div className='d-flex flex-wrap'>
                {finalStudents.slice().sort((a: any, b: any) => normalizeProgress(b.progress) - normalizeProgress(a.progress)).slice(0, 8).map((s: any, idx: number) => (
                  <div key={s.id || s.accountId || idx} className='me-4 mb-3' style={{ minWidth: 160 }}>
                    <div className='fs-7 fw-semibold text-truncate'>{(s.fullName || s.name || s.displayName || 'Aluno')}</div>
                    <div className='text-muted fs-8'>{normalizeProgress(s.progress).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className='fs-6 mb-4'>Alunos ({finalStudents.length})</h4>
            {finalStudents.length === 0 && <div className='text-muted'>Nenhum aluno encontrado na turma.</div>}
            {finalStudents.map((student: any) => (
              <div key={student.id || student.accountId || Math.random()} className='d-flex align-items-center mb-4'>
                <div className='me-3' style={{ width: 8 }} />
                <div className='flex-grow-1'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <div className='fw-bold'>{student.fullName || student.name || student.displayName || 'Aluno'}</div>
                      <div className='text-muted fs-7'>{student.email || student.username || ''}</div>
                    </div>
                    <div className='text-end'>
                      <div className='text-muted fs-7'>Progresso</div>
                      <div className='fw-semibold'>{normalizeProgress(student.progress).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className='progress mt-2 h-6'>
                    <div className='progress-bar bg-success' role='progressbar' style={{ width: `${normalizeProgress(student.progress).toFixed(1)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reportData && (
            <div className='mt-6'>
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <h5 className='fs-7 text-muted mb-0'>Dados brutos do relatório</h5>
                <button className='btn btn-sm btn-light' onClick={() => setShowRaw((v) => !v)}>{showRaw ? 'Ocultar' : 'Mostrar'}</button>
              </div>
              {showRaw && <pre className='fs-7 text-muted'>{JSON.stringify(reportData, null, 2)}</pre>}
            </div>
          )}
        </div>
      )}
    </KTCard>
  );
};

export { ClassStudentReport };
