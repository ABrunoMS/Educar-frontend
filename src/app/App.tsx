import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import {  ToastContainer  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { I18nProvider } from '@metronic/i18n/i18nProvider'
import { LayoutProvider, LayoutSplashScreen } from '@metronic/layout/core'
import { MasterInit } from '@metronic/layout/MasterInit'
import { ThemeModeProvider } from '@metronic/partials'

import { RoleProvider } from '@contexts/RoleContext'
import { AuthInit } from './modules/auth'

const App = () => {
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <ThemeModeProvider>
            <RoleProvider>
              <AuthInit>
                <Outlet />
                <MasterInit />
                <ToastContainer />
              </AuthInit>
            </RoleProvider>
          </ThemeModeProvider>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export {App}
