import {useEffect} from 'react'
import {useListView} from '../core/ListViewProvider' // Importe o hook
import {UserEditModalHeader} from './UserEditModalHeader'
import {UserEditModalFormWrapper} from './UserEditModalFormWrapper'

const UserEditModal = () => {
  // Pega o ID e a função para limpá-lo do contexto
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()

  const handleClose = () => {
    setItemIdForUpdate(undefined)
  }

  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  return (
    <>
      <div className='modal fade show d-block' id='kt_modal_add_user' role='dialog'>
        <div className='modal-dialog modal-dialog-centered mw-650px'>
          <div className='modal-content'>
            <UserEditModalHeader />
            <div className='modal-body scroll-y mx-5 mx-xl-15 my-7'>
              {/* PASSE O ID E A FUNÇÃO DE FECHAR COMO PROPS */}
              <UserEditModalFormWrapper id={itemIdForUpdate} onClose={handleClose} />
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  )
}

export {UserEditModal}