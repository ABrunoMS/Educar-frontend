import {FC} from 'react'
import {ColumnInstance} from 'react-table'
import {User} from '../../core/_models'

type Props<T extends object> = {
  column: ColumnInstance<T>
}

const CustomHeaderColumn = <T extends object>({column}: Props<T>) => (
  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
)

export { CustomHeaderColumn }
