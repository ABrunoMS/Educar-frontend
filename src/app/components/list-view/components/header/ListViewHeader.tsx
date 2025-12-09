// import { useListView } from '../../core/ListViewProvider'
import { ListViewToolbar } from './ListViewToolbar'
import { ListViewSearchComponent } from './ListViewSearchComponent'
import { ReactNode } from 'react'

interface ListViewHeaderProps {
  customFilters?: ReactNode;
  onResetFilters?: () => void;
  onApplyFilters?: () => void;
}

const ListViewHeader = ({ customFilters, onResetFilters, onApplyFilters }: ListViewHeaderProps) => {
  // const {selected} = useListView()
  return (
    <div className='card-header border-0 pt-6'>
      <ListViewSearchComponent />
      {/* begin::Card toolbar */}
      <div className='card-toolbar'>
        <ListViewToolbar customFilters={customFilters} onResetFilters={onResetFilters} onApplyFilters={onApplyFilters} />
      </div>
      {/* end::Card toolbar */}
    </div>
  )
}

export { ListViewHeader }
