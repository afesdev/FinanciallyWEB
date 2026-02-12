import { useState, useEffect, type FormEvent } from 'react'
import type { Account, CreateAccountDto, UpdateAccountDto } from '../../services/api'

const ACCOUNT_TYPES = [
  { value: 'BANCARIA', label: 'Bancaria' },
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de crédito' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de débito' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'AHORRO', label: 'Ahorro' },
  { value: 'INVERSION', label: 'Inversión' },
] as const

const MONEDAS = [
  'ARS', 'BOB', 'CLP', 'COP', 'CRC', 'CUP', 'DOP', 'EUR', 'GTQ', 'HNL', 'MXN', 'NIO', 'PAB', 'PEN', 'PYG', 'USD', 'UYU', 'VES',
]

const COLORS = [
  { value: '#10B981', label: 'Verde' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#F59E0B', label: 'Ámbar' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6366F1', label: 'Índigo' },
]

const ICONS = [
  { value: 'account_balance', label: 'Banco', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
    </svg>
  )},
  { value: 'wallet', label: 'Billetera', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
    </svg>
  )},
  { value: 'savings', label: 'Ahorros', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )},
  { value: 'credit_card', label: 'Tarjeta', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  )},
  { value: 'payments', label: 'Pagos', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )},
  { value: 'attach_money', label: 'Dinero', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )},
  { value: 'trending_up', label: 'Inversión', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  )},
  { value: 'account_balance_wallet', label: 'Billetera Banco', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  )},
  { value: 'monetization_on', label: 'Moneda', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v12M15 9H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6"/>
    </svg>
  )},
  { value: 'local_atm', label: 'Cajero', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="12" x="3" y="6" rx="2"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
      <line x1="7" x2="7" y1="6" y2="4"/>
      <line x1="17" x2="17" y1="6" y2="4"/>
    </svg>
  )},
  { value: 'store', label: 'Tienda', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14H5V8Z"/>
      <path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>
      <path d="M9 12h6"/>
    </svg>
  )},
  { value: 'receipt', label: 'Recibo', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/>
      <path d="M14 8H8"/>
      <path d="M16 12H8"/>
      <path d="M13 16H8"/>
    </svg>
  )},
]

function formatNumber(value: string | number): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/\./g, '').replace(',', '.'))
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(num)
}

function parseFormattedNumber(formatted: string): number {
  const cleaned = formatted.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

type AccountFormModalProps = {
  open: boolean
  account?: Account | null
  defaultMoneda?: string
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => Promise<void> | void
}

function AccountFormModal({
  open,
  account,
  defaultMoneda = 'COP',
  loading,
  onClose,
  onSubmit,
}: AccountFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<CreateAccountDto['tipo']>('BANCARIA')
  const [moneda, setMoneda] = useState(defaultMoneda)
  const [saldoInicial, setSaldoInicial] = useState('')
  const [color, setColor] = useState('#10B981')
  const [icono, setIcono] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [activa, setActiva] = useState(true)

  const isEdit = !!account

  useEffect(() => {
    if (account) {
      setNombre(account.nombre)
      setTipo(account.tipo)
      setMoneda(account.moneda)
      setSaldoInicial(formatNumber(account.saldo_inicial || 0))
      setColor(account.color || '#10B981')
      setIcono(account.icono || '')
      setDescripcion(account.descripcion || '')
      setActiva(account.activa)
    } else {
      // Reset para crear
      setNombre('')
      setTipo('BANCARIA')
      setMoneda(defaultMoneda)
      setSaldoInicial(formatNumber(0))
      setColor('#10B981')
      setIcono('')
      setDescripcion('')
      setActiva(true)
    }
  }, [account, defaultMoneda, open])

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validar que el nombre no esté vacío
    const nombreTrimmed = String(nombre || '').trim()
    if (!nombreTrimmed) {
      return // El formulario HTML5 required debería prevenir esto, pero por si acaso
    }
    
    // Construir el objeto de datos exactamente como lo espera el backend
    const data: CreateAccountDto | UpdateAccountDto = {
      nombre: nombreTrimmed, // Siempre string válido
    }

    // Agregar campos opcionales solo si tienen valor
    if (tipo) {
      data.tipo = tipo
    }
    
    if (moneda && moneda.trim()) {
      data.moneda = moneda.trim()
    }
    
    const saldoValue = parseFormattedNumber(saldoInicial)
    if (!isNaN(saldoValue)) {
      data.saldoInicial = saldoValue
    }
    
    if (color && color.trim() && color !== '#10B981') {
      data.color = color.trim()
    }
    
    if (icono && icono.trim()) {
      data.icono = icono.trim()
    }
    
    if (descripcion && descripcion.trim()) {
      data.descripcion = descripcion.trim()
    }

    if (isEdit) {
      ;(data as UpdateAccountDto).activa = activa
    }

    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Editar cuenta' : 'Nueva cuenta'}
          </h2>
          <button
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Body con scroll */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-5">
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">

              {/* Col izquierda */}
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Nombre de la cuenta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Ej: Cuenta Principal"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as CreateAccountDto['tipo'])}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Moneda y Saldo inicial */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Moneda</label>
                    <select
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    >
                      {MONEDAS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Saldo inicial
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={saldoInicial}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '')
                        setSaldoInicial(raw ? formatNumber(parseInt(raw, 10)) : '0')
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Saldo actual (solo lectura en edicion) */}
                {isEdit && account?.saldo_actual !== undefined && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Saldo actual</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: account.moneda || 'COP', minimumFractionDigits: 0 }).format(account.saldo_actual ?? 0)}
                      </span>
                      <span className="text-[11px] text-slate-400">solo lectura</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      saldo inicial + ingresos - gastos
                    </p>
                  </div>
                )}

                {/* Descripcion */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Descripcion (opcional)</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Descripcion adicional..."
                  />
                </div>

                {/* Activa (solo edicion) */}
                {isEdit && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activa"
                      checked={activa}
                      onChange={(e) => setActiva(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                    />
                    <label htmlFor="activa" className="text-sm text-slate-700">Cuenta activa</label>
                  </div>
                )}
              </div>

              {/* Col derecha */}
              <div className="space-y-4">
                {/* Color */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`h-8 w-8 rounded-lg border-2 transition-all ${
                          color === c.value ? 'border-slate-900 scale-110' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Icono */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Icono (opcional)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIcono('')}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 transition-all ${
                        !icono
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                      title="Sin icono"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      <span className="text-[9px]">Ninguno</span>
                    </button>
                    {ICONS.map((ic) => (
                      <button
                        key={ic.value}
                        type="button"
                        onClick={() => setIcono(ic.value)}
                        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 transition-all ${
                          icono === ic.value
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                        title={ic.label}
                      >
                        {ic.icon}
                        <span className="text-[9px]">{ic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-400/60 transition-all hover:shadow-emerald-400/90 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountFormModal
