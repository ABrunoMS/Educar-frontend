import {useIntl} from 'react-intl'
import {KTIcon} from '../../../../helpers'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

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
      {/* <SidebarMenuItem to='/builder' icon='switch' title='Layout Builder' fontIcon='bi-layers' /> */}
      {/* <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Crafted</span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to='/crafted/pages'
        title='Pages'
        fontIcon='bi-archive'
        icon='delete-folder'
      >
        <SidebarMenuItemWithSub to='/crafted/pages/profile' title='Profile' hasBullet={true}>
          <SidebarMenuItem to='/crafted/pages/profile/overview' title='Overview' hasBullet={true} />
          <SidebarMenuItem to='/crafted/pages/profile/projects' title='Projects' hasBullet={true} />
          <SidebarMenuItem
            to='/crafted/pages/profile/campaigns'
            title='Campaigns'
            hasBullet={true}
          />
          <SidebarMenuItem
            to='/crafted/pages/profile/documents'
            title='Documents'
            hasBullet={true}
          />
          <SidebarMenuItem
            to='/crafted/pages/profile/connections'
            title='Connections'
            hasBullet={true}
          />
        </SidebarMenuItemWithSub>

        <SidebarMenuItemWithSub to='/crafted/pages/wizards' title='Wizards' hasBullet={true}>
          <SidebarMenuItem
            to='/crafted/pages/wizards/horizontal'
            title='Horizontal'
            hasBullet={true}
          />
          <SidebarMenuItem to='/crafted/pages/wizards/vertical' title='Vertical' hasBullet={true} />
        </SidebarMenuItemWithSub>
      </SidebarMenuItemWithSub> */}
      {/* <SidebarMenuItemWithSub
        to='/crafted/accounts'
        title='Accounts'
        icon='profile-circle'
        fontIcon='bi-person'
      >
        <SidebarMenuItem to='/crafted/account/overview' title='Overview' hasBullet={true} />
        <SidebarMenuItem to='/crafted/account/settings' title='Settings' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub to='/error' title='Errors' fontIcon='bi-sticky' icon='cross-circle'>
        <SidebarMenuItem to='/error/404' title='Error 404' hasBullet={true} />
        <SidebarMenuItem to='/error/500' title='Error 500' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/crafted/widgets'
        title='Widgets'
        icon='element-7'
        fontIcon='bi-layers'
      >
        <SidebarMenuItem to='/crafted/widgets/lists' title='Lists' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/statistics' title='Statistics' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/charts' title='Charts' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/mixed' title='Mixed' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/tables' title='Tables' hasBullet={true} />
        <SidebarMenuItem to='/crafted/widgets/feeds' title='Feeds' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>Apps</span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to='/apps/chat'
        title='Chat'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/apps/chat/private-chat' title='Private Chat' hasBullet={true} />
        <SidebarMenuItem to='/apps/chat/group-chat' title='Group Chart' hasBullet={true} />
        <SidebarMenuItem to='/apps/chat/drawer-chat' title='Drawer Chart' hasBullet={true} />
      </SidebarMenuItemWithSub> */}

      <SidebarMenuItemWithSub
        to='/apps/subject-management/'
        title='Disciplina'
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
        to='/apps/client-management/'
        title='Clients'
        fontIcon='bi-archive'
        icon='delete-folder'
      >
        <SidebarMenuItem
          to='/apps/client-management/clients'
          // icon='abstract-28'
          title='Listagem de cliente'
          hasBullet
        />
        <SidebarMenuItem
          to='/apps/client-management/create'
          // icon='abstract-28'
          title='Criar cliente'
          hasBullet
        />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/apps/account-management/'
        title='Accounts'
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
        to='/apps/address-management/'
        title='Address'
        fontIcon='bi-archive'
        icon='delete-folder'
      >
        <SidebarMenuItem
          to='/apps/address-management/addresses'
          icon='abstract-28'
          title='Listagem de endereços'
          hasBullet
        />
        <SidebarMenuItem
          to='/apps/address-management/create'
          icon='abstract-28'
          title='Criar endereço'
          hasBullet
        />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/apps/class-management/'
        title='Class'
        fontIcon='bi-archive'
        icon='delete-folder'
      >
        <SidebarMenuItem
          to='/apps/class-management/classes'
          icon='abstract-28'
          title='Listagem de classes'
          hasBullet
        />
        <SidebarMenuItem
          to='/apps/class-management/create'
          icon='abstract-28'
          title='Criar classe'
          hasBullet
        />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/apps/grade-management/'
        title='Grade'
        fontIcon='bi-archive'
        icon='delete-folder'
      >
        <SidebarMenuItem
          to='/apps/grade-management/grades'
          icon='abstract-28'
          title='Listagem de notas'
          hasBullet
        />
        <SidebarMenuItem
          to='/apps/grade-management/create'
          icon='abstract-28'
          title='Criar nota'
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
      <SidebarMenuItemWithSub
        to='/apps/proficiency-management/'
        title='Proficiency'
        fontIcon='bi-archive'
        icon='delete-folder'
      >
        <SidebarMenuItem
          to='/apps/proficiency-management/proficiencies'
          icon='abstract-28'
          title='Listagem de proficiencies'
          hasBullet
        />
        <SidebarMenuItem
          to='/apps/proficiency-management/create'
          icon='abstract-28'
          title='Criar proficiency'
          hasBullet
        />
        <SidebarMenuItem
          to='/apps/proficiency-management/group-create'
          icon='abstract-28'
          title='Criar Grupo'
          hasBullet
        />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/apps/school-management/'
        title='School'
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
      <SidebarMenuItem
        to='/select-organization'
        icon='abstract-28'
        title='Selecionar organização'
        fontIcon='bi-layers'
      />
      {/* <div className='menu-item'>
        <a
          target='_blank'
          className='menu-link'
          href={import.meta.env.VITE_APP_PREVIEW_DOCS_URL + '/changelog'}
        >
          <span className='menu-icon'>
            <KTIcon iconName='code' className='fs-2' />
          </span>
          <span className='menu-title'>Changelog {import.meta.env.VITE_APP_VERSION}</span>
        </a>
      </div> */}
    </>
  )
}

export {SidebarMenuMain}
