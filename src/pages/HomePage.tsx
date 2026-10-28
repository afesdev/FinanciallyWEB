import { useState, useEffect, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getAccounts,
  getTransactions,
  getGoals,
  getDashboard,
  getPrestamos,
  getPagosRecurrentes,
} from '../services/api'
import type {
  Account,
  DashboardResponse,
  Meta,
  PagoRecurrente,
  Prestamo,
  Transaccion,
} from '../services/api'

import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import WelcomeBanner from '../components/dashboard/WelcomeBanner'
import StatsCards from '../components/dashboard/StatsCards'
import BudgetAlerts from '../components/dashboard/BudgetAlerts'
import MonthlyFlow from '../components/dashboard/MonthlyFlow'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import AccountsList from '../components/dashboard/AccountsList'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import UpcomingPayments from '../components/dashboard/UpcomingPayments'
import GoalsCard from '../components/dashboard/GoalsCard'
import LoansSummary from '../components/dashboard/LoansSummary'
import NextSteps from '../components/dashboard/NextSteps'

function Reveal({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [activeNav, setActiveNav] = useState('home')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaccion[]>([])
  const [goals, setGoals] = useState<Meta[]>([])
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [recurrentes, setRecurrentes] = useState<PagoRecurrente[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  useEffect(() => {
    async function fetchData() {
      try {
        const now = new Date()
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
        const recentStart = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10)
        const [acc, txnRecent, gls, dash, loans, recur] = await Promise.allSettled([
          getAccounts(),
          getTransactions(recentStart, monthEnd),
          getGoals('ACTIVAS'),
          getDashboard(),
          getPrestamos('ACTIVOS'),
          getPagosRecurrentes(),
        ])
        if (acc.status === 'fulfilled') setAccounts(acc.value)
        if (txnRecent.status === 'fulfilled') setTransactions(txnRecent.value)
        if (gls.status === 'fulfilled') setGoals(gls.value)
        if (dash.status === 'fulfilled') setDashboard(dash.value)
        if (loans.status === 'fulfilled') setPrestamos(loans.value)
        if (recur.status === 'fulfilled') setRecurrentes(recur.value)
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const totalBalance = accounts.reduce(
    (sum, a) => sum + (Number(a.saldo_actual ?? a.saldo_inicial ?? 0) || 0),
    0,
  )
  const resumen = dashboard?.resumen_mensual
  const incomeThisMonth = resumen?.ingresos ?? transactions
    .filter((t) => t.tipo_nombre === 'INGRESO')
    .reduce((sum, t) => sum + (Number(t.monto) || 0), 0)
  const expensesThisMonth = resumen?.gastos ?? transactions
    .filter((t) => t.tipo_nombre === 'GASTO')
    .reduce((sum, t) => sum + (Number(t.monto) || 0), 0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavigate = (key: string) => {
    setActiveNav(key)
    if (key === 'accounts') navigate('/accounts')
    else if (key === 'categories') navigate('/categories')
    else if (key === 'goals') navigate('/goals')
    else if (key === 'loans') navigate('/loans')
    else if (key === 'budgets') navigate('/budgets')
    else if (key === 'transactions') navigate('/transactions')
    else if (key === 'dashboard') navigate('/dashboard')
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

  const onboardingPendiente =
    !loadingData && (accounts.length === 0 || transactions.length === 0 || goals.length === 0)

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeNav={activeNav}
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
        nombre={nombre}
        email={user?.email}
        onNavChange={handleNavigate}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar
          nombre={nombre}
          email={user?.email}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 px-4 py-6 lg:px-8">
          <WelcomeBanner
            nombre={nombre}
            cuentas={accounts.length}
            onNavigate={handleNavigate}
          />

          <StatsCards
            loading={loadingData}
            totalBalance={totalBalance}
            incomeThisMonth={incomeThisMonth}
            expensesThisMonth={expensesThisMonth}
            moneda={moneda}
            variacionIngresos={resumen?.variacion_ingresos}
            variacionGastos={resumen?.variacion_gastos}
          />

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-5">
              <Reveal delay={0.05}>
                <BudgetAlerts
                  loading={loadingData}
                  presupuestos={dashboard?.presupuestos ?? []}
                  moneda={moneda}
                  onNavigate={handleNavigate}
                />
              </Reveal>

              <Reveal delay={0.1}>
                <MonthlyFlow
                  loading={loadingData}
                  evolucion={dashboard?.evolucion_mensual ?? []}
                  moneda={moneda}
                />
              </Reveal>

              <Reveal delay={0.12}>
                <CategoryBreakdown
                  loading={loadingData}
                  categorias={dashboard?.gastos_por_categoria ?? []}
                  moneda={moneda}
                  onNavigate={handleNavigate}
                />
              </Reveal>

              <Reveal delay={0.15}>
                <AccountsList
                  featured
                  loading={loadingData}
                  accounts={accounts}
                  moneda={moneda}
                  onNavigate={handleNavigate}
                />
              </Reveal>

              <Reveal delay={0.18}>
                <RecentTransactions
                  loading={loadingData}
                  transactions={transactions}
                  moneda={moneda}
                  onNavigate={handleNavigate}
                />
              </Reveal>
            </div>

            <div className="space-y-5">
              <Reveal delay={0.08}>
                <UpcomingPayments
                  loading={loadingData}
                  pagos={recurrentes}
                  moneda={moneda}
                />
              </Reveal>

              <Reveal delay={0.12}>
                <GoalsCard
                  loading={loadingData}
                  goals={goals}
                  moneda={moneda}
                  onNavigate={handleNavigate}
                />
              </Reveal>

              <Reveal delay={0.16}>
                <LoansSummary
                  loading={loadingData}
                  prestamos={prestamos}
                  moneda={moneda}
                  onNavigate={handleNavigate}
                />
              </Reveal>

              {onboardingPendiente && (
                <Reveal delay={0.2}>
                  <NextSteps
                    hasAccounts={accounts.length > 0}
                    hasTransactions={transactions.length > 0}
                    hasGoals={goals.length > 0}
                  />
                </Reveal>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage
