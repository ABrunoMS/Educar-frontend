import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import { OrganizationSelectWrapper } from '../pages/organization-select/OrganizationSelectWrapper'

const PrivateRoutes = () => {
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  const ClientsPage = lazy(() => import('../modules/apps/client-management/ClientPage'))
  const ContractPage = lazy(() => import('../modules/apps/contract-management/ContractPage'))
  const GamePage = lazy(() => import('../modules/apps/game-management/GamePage'))
  const AddressPage = lazy(() => import('../modules/apps/address-management/AddressPage'))
  const ClassPage = lazy(() => import('../modules/apps/class-management/ClassPage'))
  const GradePage = lazy(() => import('../modules/apps/grade-management/GradePage'))
  const DialoguePage = lazy(() => import('../modules/apps/dialogue-management/DialoguePage'))
  const ItemPage = lazy(() => import('../modules/apps/item-management/ItemPage'))
  const NpcPage = lazy(() => import('../modules/apps/npc-management/NpcPage'))
  const ProficiencyPage = lazy(() => import('../modules/apps/proficiency-management/ProficiencyPage'))
  const SchoolPage = lazy(() => import('../modules/apps/school-management/SchoolPage'))
  const SubjectPage = lazy(() => import('../modules/apps/subject-management/SubjectPage'))
  const AccountPage = lazy(() => import('../modules/apps/account-management/AccountPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
        <Route path='dashboard' element={<DashboardWrapper />} />
      
        {/* Lazy Modules */}
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/client-management/*'
          element={
            <SuspensedView>
              <ClientsPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/contract-management/*'
          element={
            <SuspensedView>
              <ContractPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/game-management/*'
          element={
            <SuspensedView>
              <GamePage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/address-management/*'
          element={
            <SuspensedView>
              <AddressPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/class-management/*'
          element={
            <SuspensedView>
              <ClassPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/grade-management/*'
          element={
            <SuspensedView>
              <GradePage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/dialogue-management/*'
          element={
            <SuspensedView>
              <DialoguePage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/item-management/*'
          element={
            <SuspensedView>
              <ItemPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/npc-management/*'
          element={
            <SuspensedView>
              <NpcPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/proficiency-management/*'
          element={
            <SuspensedView>
              <ProficiencyPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/school-management/*'
          element={
            <SuspensedView>
              <SchoolPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/subject-management/*'
          element={
            <SuspensedView>
              <SubjectPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/account-management/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
      
      {/* Routes that sould not have the Sidebar component */}
      <Route element={<MasterLayout hasSidebar={false} />}>
        <Route path='select-organization' element={<OrganizationSelectWrapper />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
