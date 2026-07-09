import { NavLink } from 'react-router-dom'
import { IconHome2, IconSearch, IconUsers, IconUserCircle } from '@tabler/icons-react'

const navItems = [
  { to: '/', label: 'Início', icon: IconHome2 },
  { to: '/buscar', label: 'Buscar', icon: IconSearch },
  { to: '/comunidade', label: 'Comunidade', icon: IconUsers },
  { to: '/perfil', label: 'Perfil', icon: IconUserCircle },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="nav-item">
          <Icon size={20} stroke={1.7} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
