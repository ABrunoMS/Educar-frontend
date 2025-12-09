import { QueryRequestProvider } from './core/QueryRequestProvider'
import { QueryResponseProvider } from './core/QueryResponseProvider'
import { ListViewHeader } from './components/header/ListViewHeader'
import { ListTable } from './table/ListTable'
import { KTCard } from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'
import { ListViewType } from './table/ListTable'
import { PaginationProvider } from '@contexts/PaginationContext'
import { ReactNode } from 'react'

interface ListViewProps<T extends object> extends ListViewType<T> {
  customFilters?: ReactNode;
  onResetFilters?: () => void;
  onApplyFilters?: () => void;
}

const ListView = <T extends object>({data, columns, isLoading, totalItems, customFilters, onResetFilters, onApplyFilters}: ListViewProps<T>) => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ToolbarWrapper />
      <Content>
      <KTCard>
        <ListViewHeader customFilters={customFilters} onResetFilters={onResetFilters} onApplyFilters={onApplyFilters} />
        <ListTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          totalItems={totalItems}
        />
      </KTCard>
      </Content>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export { ListView }
