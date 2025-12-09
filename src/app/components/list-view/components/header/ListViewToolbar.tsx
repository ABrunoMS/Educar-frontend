import { ListViewFilter } from './ListViewFilter'
import { ReactNode } from 'react'

interface ListViewToolbarProps {
  customFilters?: ReactNode;
  onResetFilters?: () => void;
  onApplyFilters?: () => void;
}

const ListViewToolbar = ({ customFilters, onResetFilters, onApplyFilters }: ListViewToolbarProps) => {

  return (
    <div className='d-flex justify-content-end' data-kt-user-table-toolbar='base'>
      <ListViewFilter customFilters={customFilters} onResetFilters={onResetFilters} onApplyFilters={onApplyFilters} />
    </div>
  )
}

export { ListViewToolbar }
