import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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

const NAV_BY_KEY = new Map(NAV_ITEMS.map((item) => [item.key, item]))

const GROUPS: { label: string | null; keys: string[] }[] = [
  { label: null, keys: ['dashboard', 'home'] },
  { label: 'Movimientos', keys: ['accounts', 'transactions', 'categories'] },
  { label: 'Planeación', keys: ['budgets', 'goals', 'loans'] },
  { label: 'Más', keys: ['reports', 'profile'] },
]

type ContentProps = {
  instanceId: string
  activeNav: string
  collapsed: boolean
  isLight: boolean
  onNavChange: (key: string) => void
  onClose: () => void
}

function NavButton({
  instanceId,
  item,
  active,
  collapsed,
  isLight,
  onSelect,
}: {
  instanceId: string
  item: { key: string; label: string; icon: ReactNode }
  active: boolean
  collapsed: boolean
  isLight: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex w-full items-center rounded-xl py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
        collapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
      } ${
        active
          ? isLight
            ? 'text-brand-700'
            : 'text-white'
          : isLight
            ? 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {active && (
        <motion.span
          layoutId={`${instanceId}-active`}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          className={`absolute inset-0 rounded-xl ${
            isLight ? 'bg-brand-50 ring-1 ring-brand-100' : 'bg-white/10'
          }`}
        />
      )}
      {active && !collapsed && (
        <motion.span
          layoutId={`${instanceId}-bar`}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500"
        />
      )}
      <span className={`relative shrink-0 ${active ? 'text-brand-500' : ''}`}>{item.icon}</span>
      {!collapsed && <span className="relative truncate">{item.label}</span>}
    </button>
  )
}

function SidebarContent({
  instanceId,
  activeNav,
  collapsed,
  isLight,
  onNavChange,
  onClose,
}: ContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center gap-2.5 py-6 transition-[padding] ${
          collapsed ? 'justify-center px-0' : 'px-5'
        }`}
      >
        <img src={logo} alt="Financially" className="h-9 w-9 shrink-0" />
        {!collapsed && (
          <span
            className={`text-[1.05rem] font-semibold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Financially
          </span>
        )}
      </div>

      <nav
        className={`flex-1 overflow-y-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-[padding] ${
          collapsed ? 'px-2' : 'px-3'
        }`}
      >
        {GROUPS.map((group, gi) => (
          <div key={group.label ?? `g-${gi}`} className={gi > 0 ? 'mt-5' : ''}>
            {group.label && !collapsed && (
              <p
                className={`mb-1.5 px-3.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {group.label}
              </p>
            )}
            {group.label && collapsed && gi > 0 && (
              <div
                className={`mx-auto mb-2 h-px w-6 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}
              />
            )}
            <div className="space-y-1">
              {group.keys.map((key) => {
                const item = NAV_BY_KEY.get(key)
                if (!item) return null
                return (
                  <NavButton
                    key={key}
                    instanceId={instanceId}
                    item={item}
                    active={activeNav === key}
                    collapsed={collapsed}
                    isLight={isLight}
                    onSelect={() => {
                      onNavChange(key)
                      onClose()
                    }}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {dir === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
  </svg>
)

export default function Sidebar(props: SidebarProps) {
  const { activeNav, sidebarOpen, onClose, collapsed = false, onToggleCollapse, onNavChange } = props
  const { sidebarColor } = useTheme()
  const isLight = sidebarColor.toLowerCase() === '#ffffff'

  return (
    <>
      {/* Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r transition-[width] duration-200 ease-in-out lg:block ${
          isLight ? 'border-slate-200' : 'border-white/10'
        } ${collapsed ? 'w-20' : 'w-64'}`}
        style={{ backgroundColor: sidebarColor }}
      >
        <SidebarContent
          instanceId="desktop"
          activeNav={activeNav}
          collapsed={collapsed}
          onClose={onClose}
          onNavChange={onNavChange}
          isLight={isLight}
        />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border shadow-md transition-colors ${
              isLight
                ? 'border-slate-200 text-slate-500 hover:text-slate-900'
                : 'border-white/10 text-slate-300 hover:text-white'
            }`}
            style={{ backgroundColor: sidebarColor }}
            title={collapsed ? 'Expandir menú' : 'Recoger menú'}
            aria-label={collapsed ? 'Expandir menú' : 'Recoger menú'}
          >
            <Chevron dir={collapsed ? 'right' : 'left'} />
          </button>
        )}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className={`absolute inset-y-0 left-0 w-72 border-r shadow-2xl ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}
              style={{ backgroundColor: sidebarColor }}
            >
              <button
                onClick={onClose}
                aria-label="Cerrar menú"
                className={`absolute right-3 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  isLight
                    ? 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {Icons.x}
              </button>
              <SidebarContent
                instanceId="mobile"
                activeNav={activeNav}
                collapsed={false}
                onClose={onClose}
                onNavChange={onNavChange}
                isLight={isLight}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
