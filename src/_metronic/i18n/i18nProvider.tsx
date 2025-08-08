import {FC} from 'react'
import {useLang} from './Metronici18n'
import {IntlProvider} from 'react-intl'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/pt'

import enMessages from './messages/en.json'
import ptMessages from './messages/pt.json'
import {WithChildren} from '../helpers'
import { flattenMessages } from '../../utils/flattenMessages';

const allMessages = {
  en: flattenMessages(enMessages),
  pt: flattenMessages(ptMessages),
}

const I18nProvider: FC<WithChildren> = ({children}) => {
  const locale = useLang()
  const messages = allMessages[locale]

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}

export {I18nProvider}
