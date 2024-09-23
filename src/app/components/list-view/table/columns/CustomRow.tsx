import clsx from 'clsx'
import {FC} from 'react'
import {Row} from 'react-table'

interface CustomRowProps<T extends object> {
  row: Row<T>
}

const CustomRow = <T extends object>({row}: CustomRowProps<T>) => (
  <tr {...row.getRowProps()}>
    {row.cells.map((cell) => {
      return (
        <td
          {...cell.getCellProps()}
          className={clsx({'text-end min-w-100px': cell.column.id === 'actions'})}
        >
          {cell.render('Cell')}
        </td>
      )
    })}
  </tr>
)

export {CustomRow}
