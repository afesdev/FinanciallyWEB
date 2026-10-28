import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { useAuth } from '../context/AuthContext'
import { getTransactionsSummary, getTransactions } from '../services/api'
import { formatCurrency } from '../utils/format'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import Swal from 'sweetalert2'
import { TIPO_TRANSACCION } from '../services/api'

/* ─── Helpers ──────────────────────────────────────────── */

type PresetKey = 'mes' | 'mes_pasado' | 'tres_meses' | 'ano' | 'personalizado'

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getPresetRange(preset: PresetKey, customStart?: string, customEnd?: string): { start: string; end: string } {
  const now = new Date()
  if (preset === 'personalizado' && customStart && customEnd) {
    return { start: customStart, end: customEnd }
  }
  if (preset === 'mes') {
    return {
      start: toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: toLocalDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    }
  }
  if (preset === 'mes_pasado') {
    return {
      start: toLocalDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      end: toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), 0)),
    }
  }
  if (preset === 'tres_meses') {
    return {
      start: toLocalDateStr(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      end: toLocalDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    }
  }
  if (preset === 'ano') {
    return {
      start: toLocalDateStr(new Date(now.getFullYear(), 0, 1)),
      end: toLocalDateStr(new Date(now.getFullYear(), 11, 31)),
    }
  }
  return getPresetRange('mes')
}

const PRESETS: { key: PresetKey; label: string; icon: ReactNode }[] = [
  {
    key: 'mes',
    label: 'Este mes',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>,
  },
  {
    key: 'mes_pasado',
    label: 'Mes pasado',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>,
  },
  {
    key: 'tres_meses',
    label: 'Últimos 3 meses',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" /></svg>,
  },
  {
    key: 'ano',
    label: 'Este año',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  },
  {
    key: 'personalizado',
    label: 'Personalizado',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
  },
]

/* ─── Component ────────────────────────────────────────── */

function ReportesPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSidebarCollapsed()
  const [preset, setPreset] = useState<PresetKey>('mes')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [loading, setLoading] = useState(true)
  const [summaryRows, setSummaryRows] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  const nombre = user?.nombre ?? 'Usuario'
  const moneda = user?.monedaPredeterminada ?? 'COP'

  const range = useMemo(
    () => getPresetRange(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  )

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true)
        const [summaryRes, txnRes] = await Promise.all([
          getTransactionsSummary(range.start, range.end),
          getTransactions(range.start, range.end),
        ])
        const arr = Array.isArray(summaryRes) ? summaryRes : [summaryRes]
        setSummaryRows(arr.filter((r) => r != null))
        setTransactions(Array.isArray(txnRes) ? txnRes : [])
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'No se pudo cargar el reporte.'
        Swal.fire({ icon: 'error', title: 'Error', text: msg })
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [range.start, range.end])

  /* ─── Computed data ─────────────────────────────────── */

  const totals = useMemo(() => {
    if (summaryRows.length === 0) return { ingresos: 0, gastos: 0, balance: 0 }
    const first = summaryRows[0]
    return {
      ingresos: Number(first.total_ingresos ?? 0),
      gastos: Number(first.total_gastos ?? 0),
      balance: Number(first.balance ?? 0),
    }
  }, [summaryRows])

  const txCount = useMemo(() => {
    let ingresos = 0, gastos = 0
    for (const t of transactions) {
      if (!t.activa) continue
      if (t.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) ingresos++
      else if (t.tipo_transaccion_id === TIPO_TRANSACCION.GASTO) gastos++
    }
    return { ingresos, gastos, total: ingresos + gastos }
  }, [transactions])

  const incomeRatio = totals.ingresos + totals.gastos > 0
    ? (totals.ingresos / (totals.ingresos + totals.gastos)) * 100
    : 50

  const porCategoria = useMemo(() => {
    return summaryRows
      .filter((r) => r.categoria_id != null && r.categoria_nombre)
      .map((r) => ({
        nombre: r.categoria_nombre,
        color: r.categoria_color,
        ingresos: Number(r.ingresos_categoria ?? 0),
        gastos: Number(r.gastos_categoria ?? 0),
        total: Number(r.ingresos_categoria ?? 0) - Number(r.gastos_categoria ?? 0),
      }))
      .sort((a, b) => Math.abs(b.gastos + b.ingresos) - Math.abs(a.gastos + a.ingresos))
  }, [summaryRows])

  const maxCatAmount = useMemo(() => {
    let max = 0
    for (const c of porCategoria) {
      const v = c.ingresos + c.gastos
      if (v > max) max = v
    }
    return max || 1
  }, [porCategoria])

  const porCuenta = useMemo(() => {
    const byAccount: Record<string, { nombre: string; ingresos: number; gastos: number }> = {}
    for (const t of transactions) {
      if (!t.activa) continue
      const name = t.cuenta_nombre || 'Sin cuenta'
      if (!byAccount[name]) byAccount[name] = { nombre: name, ingresos: 0, gastos: 0 }
      if (t.tipo_transaccion_id === TIPO_TRANSACCION.INGRESO) {
        byAccount[name].ingresos += Number(t.monto) || 0
      } else if (t.tipo_transaccion_id === TIPO_TRANSACCION.GASTO) {
        byAccount[name].gastos += Number(t.monto) || 0
      }
    }
    return Object.values(byAccount)
      .map((v) => ({ ...v, total: v.ingresos - v.gastos }))
      .sort((a, b) => Math.abs(b.ingresos + b.gastos) - Math.abs(a.ingresos + a.gastos))
  }, [transactions])

  const maxAccAmount = useMemo(() => {
    let max = 0
    for (const c of porCuenta) {
      const v = c.ingresos + c.gastos
      if (v > max) max = v
    }
    return max || 1
  }, [porCuenta])

  /* ─── Navigation & actions ─────────────────────────── */

  const handleNavigate = (key: string) => {
    if (key === 'home') navigate('/home')
    else if (key === 'accounts') navigate('/accounts')
    else if (key === 'categories') navigate('/categories')
    else if (key === 'goals') navigate('/goals')
    else if (key === 'loans') navigate('/loans')
    else if (key === 'budgets') navigate('/budgets')
    else if (key === 'transactions') navigate('/transactions')
    else if (key === 'dashboard') navigate('/dashboard')
    else if (key === 'reports') navigate('/reports')
    else if (key === 'profile') navigate('/profile')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const periodLabel =
    preset === 'personalizado'
      ? `${range.start} a ${range.end}`
      : PRESETS.find((p) => p.key === preset)?.label ?? range.start

  /* ─── PDF ──────────────────────────────────────────── */

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      let y = 20

      // Encabezado con bloque de color
      doc.setFillColor(30, 41, 59) // slate-800
      doc.rect(0, 0, pageW, 32, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.text('Reporte financiero', 14, 18)
      doc.setFontSize(10)
      doc.setTextColor(203, 213, 225) // slate-300
      doc.text(`Período: ${periodLabel}`, 14, 25)
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 30)
      doc.setTextColor(0, 0, 0)
      y = 42

      // Línea decorativa
      doc.setDrawColor(16, 185, 129) // emerald-500
      doc.setLineWidth(0.8)
      doc.line(14, 38, 50, 38)

      // Resumen en cajas
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumen', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const resumenY = y
      doc.setFillColor(236, 253, 245) // emerald-50
      doc.rect(14, resumenY - 4, 55, 22, 'F')
      doc.setTextColor(5, 150, 105)
      doc.text('Ingresos', 18, resumenY + 4)
      doc.setTextColor(0, 0, 0)
      doc.text(formatCurrency(totals.ingresos, moneda), 18, resumenY + 12)

      doc.setFillColor(255, 241, 242) // rose-50
      doc.rect(72, resumenY - 4, 55, 22, 'F')
      doc.setTextColor(190, 18, 60)
      doc.text('Gastos', 76, resumenY + 4)
      doc.setTextColor(0, 0, 0)
      doc.text(formatCurrency(totals.gastos, moneda), 76, resumenY + 12)

      doc.setFillColor(245, 243, 255) // violet-50
      doc.rect(130, resumenY - 4, 55, 22, 'F')
      doc.setTextColor(109, 40, 217)
      doc.text('Balance', 134, resumenY + 4)
      doc.setTextColor(0, 0, 0)
      doc.text(formatCurrency(totals.balance, moneda), 134, resumenY + 12)
      y = resumenY + 26

      const drawSectionHeader = (title: string, yy: number) => {
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.3)
        doc.line(14, yy - 2, pageW - 14, yy - 2)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 41, 59)
        doc.text(title, 14, yy + 5)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        return yy + 12
      }

      if (porCategoria.length > 0) {
        y = drawSectionHeader('Por categoría', y)
        doc.setFont('helvetica', 'bold')
        doc.text('Categoría', 14, y)
        doc.text('Ingresos', 85, y)
        doc.text('Gastos', 125, y)
        doc.text('Total', 165, y)
        doc.setFont('helvetica', 'normal')
        y += 6
        for (const c of porCategoria) {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.text(c.nombre.substring(0, 28), 14, y)
          doc.text(formatCurrency(c.ingresos, moneda), 85, y)
          doc.text(formatCurrency(c.gastos, moneda), 125, y)
          doc.text(formatCurrency(c.total, moneda), 165, y)
          y += 6
        }
        y += 8
      }

      if (porCuenta.length > 0) {
        if (y > 250) { doc.addPage(); y = 20 }
        y = drawSectionHeader('Por cuenta', y)
        doc.setFont('helvetica', 'bold')
        doc.text('Cuenta', 14, y)
        doc.text('Ingresos', 85, y)
        doc.text('Gastos', 125, y)
        doc.text('Total', 165, y)
        doc.setFont('helvetica', 'normal')
        y += 6
        for (const c of porCuenta) {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.text(c.nombre.substring(0, 28), 14, y)
          doc.text(formatCurrency(c.ingresos, moneda), 85, y)
          doc.text(formatCurrency(c.gastos, moneda), 125, y)
          doc.text(formatCurrency(c.total, moneda), 165, y)
          y += 6
        }
      }

      // Pie de página en última hoja
      const totalPages = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Financially · Página ${i} de ${totalPages} · ${new Date().toLocaleDateString('es-CO')}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        )
      }

      const fileName = `reporte-financiero-${range.start}-${range.end}.pdf`
      doc.save(fileName)
      Swal.fire({ icon: 'success', title: 'PDF descargado', text: fileName, timer: 2000, showConfirmButton: false })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo generar el PDF.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    }
  }

  /* ─── Render ───────────────────────────────────────── */

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-slate-950 dark:to-slate-900">
      <Sidebar
        activeNav="reports"
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
        <Navbar nombre={nombre} email={user?.email} onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 lg:px-8">
          {/* Hero header con periodo y descarga */}
          <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-800 to-emerald-900 px-6 py-6 shadow-xl shadow-slate-900/20 lg:px-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20" />
            <div className="absolute bottom-0 right-0 top-0 w-64 bg-gradient-to-l from-emerald-500/10 to-transparent" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Reportes</h1>
                <p className="mt-0.5 text-sm text-slate-300">Resumen de ingresos, gastos y balance por periodo</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-300"><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>
                  {periodLabel}
                </div>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-lg transition-all hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-emerald-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                  Descargar PDF
                </button>
              )}
            </div>
          </div>

          {/* Preset chips */}
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900 dark:ring-slate-800">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Período</p>
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    preset === p.key
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
            {preset === 'personalizado' && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <span className="text-sm text-slate-400 dark:text-slate-500">a</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {loading ? (
            /* Skeleton */
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="h-7 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
              <div className="h-8 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="grid gap-6 lg:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-4 h-5 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j}>
                          <div className="mb-2 flex justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                          </div>
                          <div className="h-3 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {/* Ingresos */}
                <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-white p-5 shadow-lg shadow-emerald-500/5 transition-all hover:shadow-xl hover:shadow-emerald-500/10 dark:border-emerald-700/60 dark:bg-slate-900">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/10 transition-all group-hover:bg-emerald-400/15" />
                  <div className="relative mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ingresos</span>
                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                    </div>
                  </div>
                  <p className="relative text-2xl font-bold tabular-nums text-emerald-600">{formatCurrency(totals.ingresos, moneda)}</p>
                  <p className="relative mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600/90">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5">{txCount.ingresos}</span> transacciones
                  </p>
                </div>

                {/* Gastos */}
                <div className="group relative overflow-hidden rounded-2xl border border-rose-200/60 bg-white p-5 shadow-lg shadow-rose-500/5 transition-all hover:shadow-xl hover:shadow-rose-500/10 dark:border-rose-700/60 dark:bg-slate-900">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-rose-600" />
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-400/10 transition-all group-hover:bg-rose-400/15" />
                  <div className="relative mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gastos</span>
                    <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                  <p className="relative text-2xl font-bold tabular-nums text-rose-600">{formatCurrency(totals.gastos, moneda)}</p>
                  <p className="relative mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600/90">
                    <span className="rounded-full bg-rose-100 px-2 py-0.5">{txCount.gastos}</span> transacciones
                  </p>
                </div>

                {/* Balance */}
                <div className="group relative overflow-hidden rounded-2xl border border-violet-200/60 bg-white p-5 shadow-lg shadow-violet-500/5 transition-all hover:shadow-xl hover:shadow-violet-500/10 dark:border-violet-700/60 dark:bg-slate-900">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-violet-600" />
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-400/10 transition-all group-hover:bg-violet-400/15" />
                  <div className="relative mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Balance</span>
                    <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="m8 8 4-5 4 5" /><path d="m8 16 4 5 4-5" /></svg>
                    </div>
                  </div>
                  <p className={`relative text-2xl font-bold tabular-nums ${totals.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(totals.balance, moneda)}
                  </p>
                  <p className="relative mt-2 text-xs text-slate-500 dark:text-slate-400">{periodLabel}</p>
                </div>
              </div>

              {/* Income vs Expense ratio bar */}
              {(totals.ingresos > 0 || totals.gastos > 0) && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-slate-900/50 dark:ring-slate-800">
                  <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" /></svg>
                      Ingresos vs Gastos
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="flex h-6 overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-slate-800">
                      <div
                        className="rounded-l-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                        style={{ width: `${incomeRatio}%` }}
                      />
                      <div
                        className="rounded-r-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500"
                        style={{ width: `${100 - incomeRatio}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-emerald-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
                        Ingresos {incomeRatio.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-2 font-semibold text-rose-600">
                        Gastos {(100 - incomeRatio).toFixed(0)}%
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Breakdowns */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Por categoría */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50 transition-shadow hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-slate-900/50 dark:ring-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                      </span>
                      Por categoría
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">{porCategoria.length}</span>
                  </div>
                  <div className="p-5">
                    {porCategoria.length > 0 ? (
                      <div className="space-y-4">
                        {porCategoria.map((cat, i) => {
                          const catTotal = cat.ingresos + cat.gastos
                          const barWidth = (catTotal / maxCatAmount) * 100
                          const ingPct = catTotal > 0 ? (cat.ingresos / catTotal) * 100 : 0
                          return (
                            <div key={i}>
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                                  <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: cat.color || '#94a3b8' }}
                                  />
                                  {cat.nombre}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${cat.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {cat.total >= 0 ? '+' : ''}{formatCurrency(cat.total, moneda)}
                                </span>
                              </div>
                              {/* Stacked bar */}
                              <div className="mb-1 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" style={{ width: `${Math.max(barWidth, 8)}%` }}>
                                {cat.ingresos > 0 && (
                                  <div className="bg-emerald-400" style={{ width: `${ingPct}%` }} />
                                )}
                                {cat.gastos > 0 && (
                                  <div className="bg-rose-400" style={{ width: `${100 - ingPct}%` }} />
                                )}
                              </div>
                              <div className="flex gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  {formatCurrency(cat.ingresos, moneda)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                  {formatCurrency(cat.gastos, moneda)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-10 text-center">
                        <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No hay datos por categoria en este periodo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Por cuenta */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50 transition-shadow hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-slate-900/50 dark:ring-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/15">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                      </span>
                      Por cuenta
                    </h3>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">{porCuenta.length}</span>
                  </div>
                  <div className="p-5">
                    {porCuenta.length > 0 ? (
                      <div className="space-y-4">
                        {porCuenta.map((cuenta, i) => {
                          const accTotal = cuenta.ingresos + cuenta.gastos
                          const barWidth = (accTotal / maxAccAmount) * 100
                          const ingPct = accTotal > 0 ? (cuenta.ingresos / accTotal) * 100 : 0
                          return (
                            <div key={i}>
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                                  </span>
                                  {cuenta.nombre}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${cuenta.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {cuenta.total >= 0 ? '+' : ''}{formatCurrency(cuenta.total, moneda)}
                                </span>
                              </div>
                              {/* Stacked bar */}
                              <div className="mb-1 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" style={{ width: `${Math.max(barWidth, 8)}%` }}>
                                {cuenta.ingresos > 0 && (
                                  <div className="bg-emerald-400" style={{ width: `${ingPct}%` }} />
                                )}
                                {cuenta.gastos > 0 && (
                                  <div className="bg-rose-400" style={{ width: `${100 - ingPct}%` }} />
                                )}
                              </div>
                              <div className="flex gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  {formatCurrency(cuenta.ingresos, moneda)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                  {formatCurrency(cuenta.gastos, moneda)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-10 text-center">
                        <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No hay movimientos por cuenta en este periodo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default ReportesPage
