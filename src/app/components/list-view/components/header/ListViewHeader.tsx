// import { useListView } from '../../core/ListViewProvider'
import { ListViewToolbar } from './ListViewToolbar'
import { ListViewSearchComponent } from './ListViewSearchComponent'
import { ReactNode } from 'react'

interface ListViewHeaderProps {
  customFilters?: ReactNode;
  onResetFilters?: () => void;
  onApplyFilters?: () => void;
  showFilters?: boolean;
}

const ListViewHeader = ({ customFilters, onResetFilters, onApplyFilters, showFilters = true }: ListViewHeaderProps) => {
  // const {selected} = useListView()
  return (
    <div className='card-header border-0 pt-6'>
      <ListViewSearchComponent />
      {/* begin::Card toolbar */}
      <div className='card-toolbar'>
        {showFilters && <ListViewToolbar customFilters={customFilters} onResetFilters={onResetFilters} onApplyFilters={onApplyFilters} />}
      </div>
      {/* end::Card toolbar */}
    </div>
  )
}

export { ListViewHeader }
