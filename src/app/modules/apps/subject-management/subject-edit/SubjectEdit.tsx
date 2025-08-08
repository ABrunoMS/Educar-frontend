import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import {KTCard} from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'
import { SubjectCreateForm } from '../subject-create/components/SubjectCreateForm'
import { getSubjectById } from '@services/Subjects';
import { toast } from 'react-toastify';
import { Subject } from '@interfaces/Subject';

const SubjectEdit = () => {
  const [subject, setSubject] = useState<Subject>()

  const { id } = useParams()

  useEffect(() => {
    if (id) {
      getSubjectById(id)
        .then((response) => {
          setSubject(response.data);
        })
        .catch((error) => {
          toast.error(`Erro ao recuperar dados no servidor: ${error}`)
        })
    }
  }, [])
  return (
    <>
      <KTCard className='p-5 h-100'>
        {subject ? (
          <SubjectCreateForm subject={subject} editMode />
        ) : (
          <div>
            <span className='indicator-progress'>
              Carregando...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          </div>
        )}
      </KTCard>
    </>
  )
}

const SubjectEditWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <SubjectEdit />
    </Content>
  </div>
)

export {SubjectEditWrapper}
