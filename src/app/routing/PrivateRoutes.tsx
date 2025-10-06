import { lazy, FC, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'
import { OrganizationSelectWrapper } from '../pages/organization-select/OrganizationSelectWrapper'

import { useRole, Role } from '@contexts/RoleContext'

// Define the props for PrivateRoute
interface PrivateRouteProps {
  children: React.ReactElement
  rolesAllowed: Role[]
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({children, rolesAllowed}) => {
  const {role} = useRole()

  if (!rolesAllowed.includes(role)) {
    return <Navigate to="/dashboard" /> // Redirect if not authorized
  }

  return children
}

export {PrivateRoute}

const PrivateRoutes = () => {
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  const ClientsPage = lazy(() => import('../modules/apps/client-management/ClientPage'))
  const ContractPage = lazy(() => import('../modules/apps/contract-management/ContractPage'))
  const GamePage = lazy(() => import('../modules/apps/game-management/GamePage'))
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
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <UsersPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />

        {/* Client (no sidebar aparecerá como Secretarias) */}
        <Route
          path='apps/client-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <ClientsPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />

        <Route
          path='apps/contract-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <ContractPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/game-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <GamePage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/class-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin', 'Teacher']}>
              <SuspensedView>
                <ClassPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />

        {/* rota de secretary-management removida */}

        <Route
          path='apps/grade-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin', 'Teacher']}>
              <SuspensedView>
                <GradePage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/dialogue-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <DialoguePage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/item-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <ItemPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/npc-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <NpcPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/proficiency-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <ProficiencyPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/school-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <SchoolPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/subject-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <SubjectPage />
              </SuspensedView>
            </PrivateRoute>
          }
        />
        <Route
          path='apps/account-management/*'
          element={
            <PrivateRoute rolesAllowed={['Admin']}>
              <SuspensedView>
                <AccountPage />
              </SuspensedView>
            </PrivateRoute>
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
