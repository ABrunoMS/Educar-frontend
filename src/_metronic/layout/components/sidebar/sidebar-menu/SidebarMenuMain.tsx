import { ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { KTIcon } from '../../../../helpers'
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub'
import { SidebarMenuItem } from './SidebarMenuItem'

import { useRole, Role } from '@contexts/RoleContext'

// Define the props for RoleBasedMenuItem
interface RoleBasedMenuItemProps {
  rolesAllowed: Role[]
  children: ReactNode
}

const RoleBasedMenuItem: React.FC<RoleBasedMenuItemProps> = ({rolesAllowed, children}) => {
  const { hasAnyRole } = useRole()

  if (!hasAnyRole(rolesAllowed)) {
    return null // Don't render if role is not allowed
  }

  return <>{children}</>
}

export {RoleBasedMenuItem}

const SidebarMenuMain = () => {
  const intl = useIntl()

  return (
    <>
      <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title={'Home'}
        fontIcon='bi-app-indicator'
      />

      <RoleBasedMenuItem rolesAllowed={['Teacher']}>
        <SidebarMenuItemWithSub
          to='/apps/grade-management/'
          title='Notas'
          fontIcon='bi-archive'
          icon='award'
        >
          <SidebarMenuItem
            to='/apps/grade-management/grades'
            icon='filter-tablet'
            title='Listagem de notas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/grade-management/create'
            icon='file'
            title='Criar nota'
            hasBullet
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/class-management/'
          title='Turmas'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/class-management/classes'
            icon='abstract-28'
            title='Listagem de Turmas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/class-management/create'
            icon='abstract-28'
            title='Criar Turma'
            hasBullet
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/lesson-management/'
          title='Aulas'
          fontIcon='bi-archive'
          icon='book-open'
        >
          <SidebarMenuItem
            to='/apps/lesson-management/lessons'
            icon='abstract-28'
            title='Minhas aulas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/lesson-management/create'
            icon='abstract-28'
            title='Nova Aula'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/lesson-management/templates'
            icon='abstract-28' // ícone de "layers" ou "templates"
            title='Aulas Template'
            hasBullet
         />
        </SidebarMenuItemWithSub>
        
      </RoleBasedMenuItem>

      <RoleBasedMenuItem rolesAllowed={['Admin']}>
        
        <SidebarMenuItemWithSub
          to='/apps/grade-management/'
          title='Notas'
          fontIcon='bi-archive'
          icon='award'
        >
          <SidebarMenuItem
            to='/apps/grade-management/grades'
            icon='filter-tablet'
            title='Listagem de notas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/grade-management/create'
            icon='file'
            title='Criar nota'
            hasBullet
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/client-management/'
          title='Clientes'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/client-management/clients'
            title='Listagem de Clientes'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/client-management/create'
            title='Criar Cliente'
            hasBullet
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/school-management/'
          title='Escolas'
          fontIcon='bi-archive'
          icon='delete-folder'
         >
          <SidebarMenuItem
            to='/apps/school-management/schools'
            icon='abstract-28'
            title='Listagem de escolas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/school-management/create'
            icon='abstract-28'
            title='Criar escola'
            hasBullet
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/class-management/'
          title='Turmas'
          fontIcon='bi-archive'
          icon='delete-folder'
         >
          <SidebarMenuItem
            to='/apps/class-management/classes'
            icon='abstract-28'
            title='Listagem de Turmas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/class-management/create'
            icon='abstract-28'
            title='Criar Turma'
            hasBullet
          />
        </SidebarMenuItemWithSub>


        <SidebarMenuItemWithSub
          to='/apps/subject-management/'
          title='Disciplinas'
          fontIcon='bi-archive'
          icon='archive'
        >
          <SidebarMenuItem
            to='/apps/subject-management/subjects'
            icon='filter-tablet'
            title='Lista de disciplinas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/subject-management/create'
            icon='file'
            title='Criar disciplina'
            hasBullet
          />
        </SidebarMenuItemWithSub>
        <SidebarMenuItemWithSub
          to='/apps/proficiency-management/'
          title='Habilidades'
          fontIcon='bi-archive'
          icon='book-open'
        >
          <SidebarMenuItem
            to='/apps/proficiency-management/proficiencies'
            icon='filter-tablet'
            title='Listagem de Habilidades'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/proficiency-management/create'
            icon='file'
            title='Criar Habilidade'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/proficiency-management/groups'
            icon='filter-tablet'
            title='Listagem de Habilidades'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/proficiency-management/group-create'
            icon='file'
            title='Criar Grupo'
            hasBullet
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/lesson-management/'
          title='Aulas'
          fontIcon='bi-archive'
          icon='book-open'
        >
          <SidebarMenuItem
            to='/apps/lesson-management/lessons'
            icon='abstract-28'
            title='Minhas aulas'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/lesson-management/create'
            icon='abstract-28'
            title='Nova Aula'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/lesson-management/templates'
            icon='abstract-28' // ícone de "layers" ou "templates"
            title='Aulas Template'
            hasBullet
         />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/account-management/'
          title='Contas'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/account-management/accounts'
            icon='abstract-28'
            title='Listagem de usuários'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/account-management/create'
            icon='abstract-28'
            title='Criar usuário'
            hasBullet
          />
        </SidebarMenuItemWithSub>
        <SidebarMenuItemWithSub
          to='/apps/contract-management/'
          title='Contracts'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/contract-management/contracts'
            icon='abstract-28'
            title='Listagem de contratos'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/contract-management/create'
            icon='abstract-28'
            title='Criar contrato'
            hasBullet
          />
        </SidebarMenuItemWithSub>
        <SidebarMenuItemWithSub
          to='/apps/game-management/'
          title='Games'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/game-management/games'
            icon='abstract-28'
            title='Listagem de games'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/game-management/create'
            icon='abstract-28'
            title='Criar game'
            hasBullet
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub
          to='/apps/dialogue-management/'
          title='Dialogue'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/dialogue-management/dialogues'
            icon='abstract-28'
            title='Listagem de dialogos'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/dialogue-management/create'
            icon='abstract-28'
            title='Criar dialogo'
            hasBullet
          />
        </SidebarMenuItemWithSub>
        <SidebarMenuItemWithSub
          to='/apps/item-management/'
          title='Item'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/item-management/items'
            icon='abstract-28'
            title='Listagem de itens'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/item-management/create'
            icon='abstract-28'
            title='Criar item'
            hasBullet
          />
        </SidebarMenuItemWithSub>
        <SidebarMenuItemWithSub
          to='/apps/npc-management/'
          title='Npc'
          fontIcon='bi-archive'
          icon='delete-folder'
        >
          <SidebarMenuItem
            to='/apps/npc-management/npcs'
            icon='abstract-28'
            title='Listagem de npcs'
            hasBullet
          />
          <SidebarMenuItem
            to='/apps/npc-management/create'
            icon='abstract-28'
            title='Criar npc'
            hasBullet
          />
        </SidebarMenuItemWithSub>

      </RoleBasedMenuItem>

      <SidebarMenuItem
        to='/select-organization'
        icon='abstract-28'
        title='Selecionar organização'
        fontIcon='bi-layers'
      />
    </>
  )
}

export {SidebarMenuMain}
