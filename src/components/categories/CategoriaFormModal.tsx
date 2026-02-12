import { useState, useEffect, type FormEvent, type ReactNode } from 'react'
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../../services/api'

const CATEGORIA_TYPES = [
  { value: 'GASTO', label: 'Gasto' },
  { value: 'INGRESO', label: 'Ingreso' },
  { value: 'AMBOS', label: 'Ambos' },
] as const

const COLORS = [
  { value: '#EF4444', label: 'Rojo' },
  { value: '#F59E0B', label: 'Ambar' },
  { value: '#10B981', label: 'Verde' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Naranja' },
  { value: '#14B8A6', label: 'Teal' },
]

const icon = (d: string): ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d.split('|').map((p, i) => <path key={i} d={p} />)}</svg>
)

const ICONS: { value: string; label: string; icon: ReactNode }[] = [
  { value: 'home', label: 'Casa', icon: icon('M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8|M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z') },
  { value: 'fastfood', label: 'Comida', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 0 0-8h-9a4 4 0 0 0 0 8h1"/><path d="M2 8h20"/><path d="M19 8v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8"/></svg>
  )},
  { value: 'car', label: 'Transporte', icon: icon('M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L17 10l-2-3H7L5 10 1.5 11.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2|M7 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0|M13 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0') },
  { value: 'school', label: 'Educacion', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
  )},
  { value: 'health', label: 'Salud', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  )},
  { value: 'shopping', label: 'Compras', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
  )},
  { value: 'entertainment', label: 'Ocio', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
  )},
  { value: 'work', label: 'Trabajo', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
  )},
  { value: 'gift', label: 'Regalos', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>
  )},
  { value: 'savings', label: 'Ahorros', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.1C1.5 8 2 7 2 7"/><circle cx="15.5" cy="9.5" r=".5" fill="currentColor"/></svg>
  )},
  { value: 'coffee', label: 'Cafe', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>
  )},
  { value: 'wifi', label: 'Servicios', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
  )},
]

type CategoriaFormModalProps = {
  open: boolean
  categoria?: Categoria | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: CreateCategoriaDto | UpdateCategoriaDto) => Promise<void> | void
}

function CategoriaFormModal({ open, categoria, loading, onClose, onSubmit }: CategoriaFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<CreateCategoriaDto['tipo']>('GASTO')
  const [color, setColor] = useState('#EF4444')
  const [icono, setIcono] = useState('')
  const [activo, setActivo] = useState(true)

  const isEdit = !!categoria

  useEffect(() => {
    if (open && categoria) {
      setNombre(categoria.nombre)
      setTipo(categoria.tipo)
      setColor(categoria.color || '#EF4444')
      setIcono(categoria.icono || '')
      setActivo(categoria.activo)
    } else {
      setNombre('')
      setTipo('GASTO')
      setColor('#EF4444')
      setIcono('')
      setActivo(true)
    }
  }, [categoria, open])

  if (!open) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nombre.trim()) return

    const data: CreateCategoriaDto | UpdateCategoriaDto = {
      nombre: nombre.trim(),
      tipo,
      color,
      icono: icono.trim() || undefined,
    }
    if (isEdit) (data as UpdateCategoriaDto).activo = activo

    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              {nombre ? nombre.charAt(0).toUpperCase() : '?'}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Editar categoria' : 'Nueva categoria'}
            </h2>
          </div>
          <button
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-5">
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              {/* Col izquierda */}
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Ej: Alimentacion"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tipo</label>
                  <div className="flex gap-2">
                    {CATEGORIA_TYPES.map((t) => {
                      const active = tipo === t.value
                      const styles: Record<string, string> = {
                        GASTO: active ? 'border-rose-400 bg-rose-50 text-rose-700' : '',
                        INGRESO: active ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : '',
                        AMBOS: active ? 'border-blue-400 bg-blue-50 text-blue-700' : '',
                      }
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTipo(t.value as CreateCategoriaDto['tipo'])}
                          className={`flex-1 rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all ${
                            active
                              ? styles[t.value]
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

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

                {/* Activo (solo edicion) */}
                {isEdit && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cat-activo"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
                    />
                    <label htmlFor="cat-activo" className="text-sm text-slate-700">Categoria activa</label>
                  </div>
                )}
              </div>

              {/* Col derecha - Iconos */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Icono (opcional)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIcono('')}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2.5 transition-all ${
                      !icono
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    <span className="text-[9px] font-medium">Ninguno</span>
                  </button>
                  {ICONS.map((ic) => (
                    <button
                      key={ic.value}
                      type="button"
                      onClick={() => setIcono(ic.value)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2.5 transition-all ${
                        icono === ic.value
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {ic.icon}
                      <span className="text-[9px] font-medium">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoriaFormModal
