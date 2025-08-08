import { QueryRequestProvider } from './core/QueryRequestProvider'
import { QueryResponseProvider } from './core/QueryResponseProvider'
import { ListViewHeader } from './components/header/ListViewHeader'
import { ListTable } from './table/ListTable'
import { KTCard } from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'
import { ListViewType } from './table/ListTable'
import { PaginationProvider } from '@contexts/PaginationContext'

const ListView = <T extends object>({data, columns, isLoading, totalItems}: ListViewType<T>) => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ToolbarWrapper />
      <Content>
      <KTCard>
        <ListViewHeader />
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
