import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAccounts, getTransactions, getTransactionsSummary, getGoals } from '../services/api'

import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import WelcomeBanner from '../components/dashboard/WelcomeBanner'
import StatsCards from '../components/dashboard/StatsCards'
import AccountsList from '../components/dashboard/AccountsList'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import ProfileCard from '../components/dashboard/ProfileCard'
import GoalsCard from '../components/dashboard/GoalsCard'
import QuickActions from '../components/dashboard/QuickActions'
import NextSteps from '../components/dashboard/NextSteps'

function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [activeNav, setActiveNav] = useState('home')
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState<{ total_ingresos?: number; total_gastos?: number; balance?: number } | null>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  useEffect(() => {
    async function fetchData() {
      try {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
        const recentStart = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10)
        const [acc, txnMonth, txnRecent, sumRes, gls] = await Promise.allSettled([
          getAccounts(),
          getTransactions(monthStart, monthEnd),
          getTransactions(recentStart, monthEnd),
          getTransactionsSummary(monthStart, monthEnd),
          getGoals('ACTIVAS'),
        ])
        if (acc.status === 'fulfilled') setAccounts(acc.value)
        if (txnMonth.status === 'fulfilled' && txnRecent.status === 'fulfilled') {
          setTransactions(txnRecent.value)
        } else if (txnRecent.status === 'fulfilled') {
          setTransactions(txnRecent.value)
        } else if (txnMonth.status === 'fulfilled') {
          setTransactions(txnMonth.value)
        }
        if (sumRes.status === 'fulfilled') {
          const arr = Array.isArray(sumRes.value) ? sumRes.value : [sumRes.value]
          const first = arr[0]
          if (first && (first.total_ingresos != null || first.total_gastos != null)) {
            setSummary({
              total_ingresos: Number(first.total_ingresos ?? 0),
              total_gastos: Number(first.total_gastos ?? 0),
              balance: Number(first.balance ?? 0),
            })
          } else setSummary(null)
        }
        if (gls.status === 'fulfilled') setGoals(gls.value)
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
  const incomeThisMonth = summary?.total_ingresos ?? transactions
    .filter((t) => t.tipo_nombre === 'INGRESO')
    .reduce((sum, t) => sum + (Number(t.monto) || 0), 0)
  const expensesThisMonth = summary?.total_gastos ?? transactions
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
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

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
          <WelcomeBanner nombre={nombre} onNavigate={handleNavigate} />

          <StatsCards
            loading={loadingData}
            totalBalance={totalBalance}
            incomeThisMonth={incomeThisMonth}
            expensesThisMonth={expensesThisMonth}
            moneda={moneda}
          />

          {/* Grid principal: contenido + sidebar derecho */}
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <AccountsList
                loading={loadingData}
                accounts={accounts}
                moneda={moneda}
                onNavigate={handleNavigate}
              />
              <RecentTransactions
                loading={loadingData}
                transactions={transactions}
                moneda={moneda}
                onNavigate={handleNavigate}
              />
            </div>

            <div className="space-y-6">
              <ProfileCard
                nombre={nombre}
                email={user?.email}
                moneda={user?.monedaPredeterminada}
                onNavigate={handleNavigate}
              />
              <GoalsCard
                loading={loadingData}
                goals={goals}
                moneda={moneda}
                onNavigate={handleNavigate}
              />
              <QuickActions onNavigate={handleNavigate} />
              <NextSteps
                hasAccounts={accounts.length > 0}
                hasTransactions={transactions.length > 0}
                hasGoals={goals.length > 0}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage
