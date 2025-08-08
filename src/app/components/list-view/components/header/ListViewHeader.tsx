// import { useListView } from '../../core/ListViewProvider'
import { ListViewToolbar } from './ListViewToolbar'
import { ListViewSearchComponent } from './ListViewSearchComponent'

const ListViewHeader = () => {
  // const {selected} = useListView()
  return (
    <div className='card-header border-0 pt-6'>
      <ListViewSearchComponent />
      {/* begin::Card toolbar */}
      <div className='card-toolbar'>
        <ListViewToolbar />
      </div>
      {/* end::Card toolbar */}
    </div>
  )
}

export { ListViewHeader }
