import logo from '../../assets/logo.svg'
import { Icons, NAV_ITEMS } from './Icons'
import { useTheme } from '../../context/ThemeContext'

type SidebarProps = {
  activeNav: string
  sidebarOpen: boolean
  nombre: string
  email?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavChange: (key: string) => void
  onClose: () => void
  onLogout: () => void
}

function SidebarContent({
  activeNav,
  nombre,
  email,
  collapsed = false,
  onNavChange,
  onClose,
  onLogout,
  isLight,
}: Omit<SidebarProps, 'sidebarOpen' | 'onToggleCollapse'> & { collapsed?: boolean; isLight: boolean }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 py-6 transition-[padding] ${
          collapsed ? 'justify-center px-0' : 'px-6'
        }`}
      >
        <img src={logo} alt="Financially" className="h-9 w-9 shrink-0" />
        {!collapsed && (
          <span
            className={`text-lg font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Financially
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className={`mt-2 flex-1 space-y-1 transition-[padding] ${collapsed ? 'px-2' : 'px-3'}`}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              onNavChange(item.key)
              onClose()
            }}
            title={collapsed ? item.label : undefined}
            className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-all ${
              collapsed ? 'justify-center px-0' : 'gap-3 px-4'
            } ${
              activeNav === item.key
                ? 'bg-emerald-500/15 text-emerald-500'
                : isLight
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      {/* User card + logout */}
      <div
        className={`border-t ${
          isLight ? 'border-slate-200' : 'border-white/10'
        } py-4 transition-[padding] ${collapsed ? 'px-2' : 'px-4'}`}
      >
        <div
          className={`mb-3 flex items-center rounded-xl py-2.5 ${
            isLight ? 'bg-slate-100' : 'bg-white/5'
          } ${
            collapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-slate-900">
            {nombre.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {nombre}
              </p>
              <p className={`truncate text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {email}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-all hover:bg-rose-500/10 hover:text-rose-500 ${
            collapsed ? 'justify-center px-0' : 'gap-3 px-4'
          } ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
        >
          {Icons.logout}
          {!collapsed && 'Cerrar sesion'}
        </button>
      </div>
    </div>
  )
}

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
)
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export default function Sidebar(props: SidebarProps) {
  const { sidebarOpen, onClose, collapsed = false, onToggleCollapse, ...rest } = props
  const { sidebarColor } = useTheme()
  const isLightSidebar = sidebarColor.toLowerCase() === '#ffffff'

  return (
    <>
      {/* Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 transition-[width] duration-200 ease-in-out lg:block ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        style={{ backgroundColor: sidebarColor }}
      >
        <SidebarContent {...rest} collapsed={collapsed} onClose={onClose} isLight={isLightSidebar} />
        {/* Botón para recoger / expandir (solo desktop) */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border text-slate-300 shadow-md transition-colors hover:text-white ${
              isLightSidebar ? 'border-slate-200 text-slate-500 hover:text-slate-900' : 'border-white/10'
            }`}
            style={{ backgroundColor: sidebarColor }}
            title={collapsed ? 'Expandir menú' : 'Recoger menú'}
            aria-label={collapsed ? 'Expandir menú' : 'Recoger menú'}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl" style={{ backgroundColor: sidebarColor }}>
            <button
              onClick={onClose}
              className={`absolute right-3 top-5 rounded-lg p-1 ${
                isLightSidebar ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {Icons.x}
            </button>
            <SidebarContent {...rest} onClose={onClose} isLight={isLightSidebar} />
          </aside>
        </div>
      )}
    </>
  )
}
