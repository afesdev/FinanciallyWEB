const API_URL = import.meta.env.VITE_API_URL

export type AuthUser = {
  id: number
  nombre: string
  email: string
  telefono?: string
  monedaPredeterminada?: string
  fechaNacimiento?: string | null
}

export type UpdateProfileDto = {
  nombre: string
  telefono?: string
  fechaNacimiento?: string
  monedaPredeterminada?: string
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

function getStoredAuth(): AuthResponse | null {
  try {
    const raw = localStorage.getItem('financially_auth')
    if (!raw) return null
    return JSON.parse(raw) as AuthResponse
  } catch {
    return null
  }
}

function getToken(): string | null {
  return getStoredAuth()?.accessToken ?? null
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const { headers, ...rest } = options
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    },
  })

  if (!response.ok) {
    let message = 'Error al comunicarse con el servidor.'
    try {
      const data = await response.json()
      if (data?.message) message = Array.isArray(data.message) ? data.message[0] : data.message
    } catch {
      // ignorar parseo
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  if (!token) throw new Error('No hay sesión activa.')
  return request<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: { name: string; email: string; password: string }) {
  const body = {
    nombre: payload.name,
    email: payload.email,
    password: payload.password,
  }
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getProfile() {
  return authRequest<AuthUser>('/api/auth/profile')
}

export function updateProfile(payload: UpdateProfileDto) {
  const body: Record<string, unknown> = { nombre: payload.nombre.trim() }
  if (payload.telefono !== undefined) body.telefono = payload.telefono.trim() || null
  if (payload.fechaNacimiento !== undefined) body.fechaNacimiento = payload.fechaNacimiento || null
  if (payload.monedaPredeterminada !== undefined) body.monedaPredeterminada = payload.monedaPredeterminada || null
  return authRequest<AuthUser>('/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

// ─── Tipos de Cuentas ───
export type Account = {
  id: number
  usuario_id: number
  nombre: string
  tipo: 'BANCARIA' | 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'DIGITAL' | 'AHORRO' | 'INVERSION'
  moneda: string
  saldo_inicial: number
  saldo_actual?: number
  color?: string
  icono?: string
  descripcion?: string
  activa: boolean
  fecha_creacion: Date
}

export type CreateAccountDto = {
  nombre: string
  tipo?: 'BANCARIA' | 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'DIGITAL' | 'AHORRO' | 'INVERSION'
  moneda?: string
  saldoInicial?: number
  color?: string
  icono?: string
  descripcion?: string
}

export type UpdateAccountDto = Partial<CreateAccountDto> & {
  activa?: boolean
}

// ─── Tipos de Categorías ───
export type Categoria = {
  id: number;
  usuarioId: number | null;
  nombre: string;
  icono: string | null;
  color: string | null;
  tipo: 'INGRESO' | 'GASTO' | 'AMBOS';
  activo: boolean;
  fechaCreacion: Date;
}

export type CreateCategoriaDto = {
  nombre: string;
  icono?: string;
  color?: string;
  tipo?: 'INGRESO' | 'GASTO' | 'AMBOS';
}

export type UpdateCategoriaDto = Partial<CreateCategoriaDto> & {
  activo?: boolean;
}


// ─── Funciones de Cuentas ───
export function getAccounts() {
  return authRequest<Account[]>('/api/cuentas')
}

// ─── Tipos de Transacciones ───
export const TIPO_TRANSACCION = { INGRESO: 1, GASTO: 2, TRANSFERENCIA: 3 } as const

export type Transaccion = {
  id: number
  usuario_id: number
  cuenta_id?: number | null
  cuenta_nombre?: string
  tipo_transaccion_id: number
  tipo_nombre: string
  categoria_id?: number | null
  categoria_nombre?: string
  categoria_color?: string
  categoria_icono?: string
  metodo_pago_id?: number | null
  metodo_pago_nombre?: string
  monto: number
  moneda: string
  titulo?: string
  descripcion?: string
  fecha_transaccion: string
  archivo_adjunto?: string
  notas?: string
  repetir: boolean
  activa: boolean
  fecha_creacion?: string
}

export type CreateTransaccionDto = {
  cuentaId?: number
  tipoTransaccionId: number
  categoriaId?: number
  metodoPagoId?: number
  monto: number
  moneda?: string
  titulo?: string
  descripcion?: string
  fechaTransaccion?: string
  archivoAdjunto?: string
  notas?: string
  repetir?: boolean
}

export type UpdateTransaccionDto = Partial<CreateTransaccionDto> & {
  activa?: boolean
}

export type CreateTransferDto = {
  cuentaOrigenId: number
  cuentaDestinoId: number
  monto: number
  moneda?: string
  titulo?: string
  descripcion?: string
  fechaTransaccion?: string
  notas?: string
}

function mapTransaccionFromApi(raw: any): Transaccion {
  return {
    id: raw.id,
    usuario_id: raw.usuario_id,
    cuenta_id: raw.cuenta_id,
    cuenta_nombre: raw.cuenta_nombre,
    tipo_transaccion_id: Number(raw.tipo_transaccion_id),
    tipo_nombre: raw.tipo_nombre || '',
    categoria_id: raw.categoria_id,
    categoria_nombre: raw.categoria_nombre,
    categoria_color: raw.categoria_color,
    categoria_icono: raw.categoria_icono,
    metodo_pago_id: raw.metodo_pago_id,
    metodo_pago_nombre: raw.metodo_pago_nombre,
    monto: Number(raw.monto ?? 0),
    moneda: raw.moneda || 'COP',
    titulo: raw.titulo,
    descripcion: raw.descripcion,
    fecha_transaccion: raw.fecha_transaccion,
    archivo_adjunto: raw.archivo_adjunto,
    notas: raw.notas,
    repetir: Boolean(raw.repetir),
    activa: Boolean(raw.activa),
    fecha_creacion: raw.fecha_creacion,
  }
}

export function getTransactions(fechaInicio?: string, fechaFin?: string) {
  const params = new URLSearchParams()
  if (fechaInicio) params.set('fechaInicio', fechaInicio)
  if (fechaFin) params.set('fechaFin', fechaFin)
  const query = params.toString() ? `?${params.toString()}` : ''
  return authRequest<any[]>(`/api/transacciones${query}`).then((list) =>
    (list || []).map(mapTransaccionFromApi)
  )
}

export function getTransaction(id: number) {
  return authRequest<any>(`/api/transacciones/${id}`).then(mapTransaccionFromApi)
}

export function getTransactionsSummary(fechaInicio?: string, fechaFin?: string) {
  const params = new URLSearchParams()
  if (fechaInicio) params.set('fechaInicio', fechaInicio)
  if (fechaFin) params.set('fechaFin', fechaFin)
  const query = params.toString() ? `?${params.toString()}` : ''
  return authRequest<any>(`/api/transacciones/summary${query}`)
}

export function createTransaction(payload: CreateTransaccionDto) {
  const body: any = {
    tipoTransaccionId: payload.tipoTransaccionId,
    monto: Number(payload.monto),
  }
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.categoriaId !== undefined) body.categoriaId = payload.categoriaId
  if (payload.metodoPagoId !== undefined) body.metodoPagoId = payload.metodoPagoId
  if (payload.moneda) body.moneda = payload.moneda
  if (payload.titulo?.trim()) body.titulo = payload.titulo.trim()
  if (payload.descripcion?.trim()) body.descripcion = payload.descripcion.trim()
  if (payload.fechaTransaccion) body.fechaTransaccion = payload.fechaTransaccion
  if (payload.archivoAdjunto) body.archivoAdjunto = payload.archivoAdjunto
  if (payload.notas?.trim()) body.notas = payload.notas.trim()
  if (payload.repetir !== undefined) body.repetir = payload.repetir
  return authRequest<any>('/api/transacciones', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(mapTransaccionFromApi)
}

export function updateTransaction(id: number, payload: UpdateTransaccionDto) {
  const body: any = {}
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.tipoTransaccionId !== undefined) body.tipoTransaccionId = payload.tipoTransaccionId
  if (payload.categoriaId !== undefined) body.categoriaId = payload.categoriaId
  if (payload.metodoPagoId !== undefined) body.metodoPagoId = payload.metodoPagoId
  if (payload.monto !== undefined) body.monto = Number(payload.monto)
  if (payload.moneda !== undefined) body.moneda = payload.moneda
  if (payload.titulo !== undefined) body.titulo = payload.titulo?.trim()
  if (payload.descripcion !== undefined) body.descripcion = payload.descripcion?.trim()
  if (payload.fechaTransaccion !== undefined) body.fechaTransaccion = payload.fechaTransaccion
  if (payload.archivoAdjunto !== undefined) body.archivoAdjunto = payload.archivoAdjunto
  if (payload.notas !== undefined) body.notas = payload.notas?.trim()
  if (payload.repetir !== undefined) body.repetir = payload.repetir
  if (payload.activa !== undefined) body.activa = payload.activa
  return authRequest<any>(`/api/transacciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then(mapTransaccionFromApi)
}

export function deleteTransaction(id: number, permanent?: boolean) {
  const query = permanent ? '?permanent=true' : ''
  return authRequest<{ message: string }>(`/api/transacciones/${id}${query}`, {
    method: 'DELETE',
  })
}

export function createTransfer(payload: CreateTransferDto) {
  const body = {
    cuentaOrigenId: payload.cuentaOrigenId,
    cuentaDestinoId: payload.cuentaDestinoId,
    monto: Number(payload.monto),
    moneda: payload.moneda || 'COP',
    titulo: payload.titulo?.trim(),
    descripcion: payload.descripcion?.trim(),
    fechaTransaccion: payload.fechaTransaccion,
    notas: payload.notas?.trim(),
  }
  return authRequest<any[]>('/api/transacciones/transfer', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getCategories() {
  return authRequest<any[]>(`/api/categorias`).then(categorias =>
    categorias.map(cat => ({
      ...cat,
      id: Number(cat.id),
      usuarioId: cat.usuario_id !== undefined ? Number(cat.usuario_id) : null,
    })) as Categoria[]
  )
}

export function getCategoriesSummary() {
  return authRequest<any[]>('/api/categorias/summary')
}

export function getAccountsSummary() {
  return authRequest<any[]>('/api/cuentas/summary')
}

// ─── Tipos de Metas ───
export type Meta = {
  id: number
  usuario_id: number
  nombre: string
  descripcion?: string | null
  monto_objetivo: number
  monto_actual: number
  fecha_objetivo: string
  icono?: string | null
  color?: string | null
  activa: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export type CreateMetaDto = {
  nombre: string
  descripcion?: string
  montoObjetivo: number
  fechaObjetivo: string
  icono?: string
  color?: string
}

export type UpdateMetaDto = Partial<CreateMetaDto> & {
  activa?: boolean
}

export type CreateAporteDto = {
  cuentaId?: number
  montoAporte: number
  notas?: string
}

function mapMetaFromApi(raw: any): Meta {
  return {
    id: raw.id,
    usuario_id: raw.usuario_id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    monto_objetivo: Number(raw.monto_objetivo ?? 0),
    monto_actual: Number(raw.monto_actual ?? 0),
    fecha_objetivo: raw.fecha_objetivo,
    icono: raw.icono,
    color: raw.color,
    activa: Boolean(raw.activa),
    fecha_creacion: raw.fecha_creacion,
    fecha_actualizacion: raw.fecha_actualizacion,
  }
}

export function getGoals(filtro?: 'ACTIVAS' | 'COMPLETADAS' | 'TODAS') {
  const query = filtro ? `?filtro=${filtro}` : ''
  return authRequest<any[]>(`/api/metas${query}`).then((list) =>
    (list || []).map(mapMetaFromApi)
  )
}

export function getGoal(id: number) {
  return authRequest<any>(`/api/metas/${id}`).then(mapMetaFromApi)
}

export function createMeta(payload: CreateMetaDto) {
  const body: any = {
    nombre: payload.nombre.trim(),
    montoObjetivo: Number(payload.montoObjetivo),
    fechaObjetivo: payload.fechaObjetivo,
  }
  if (payload.descripcion?.trim()) body.descripcion = payload.descripcion.trim()
  if (payload.icono?.trim()) body.icono = payload.icono.trim()
  if (payload.color?.trim()) body.color = payload.color.trim()
  return authRequest<any>('/api/metas', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(mapMetaFromApi)
}

export function updateMeta(id: number, payload: UpdateMetaDto) {
  const body: any = {}
  if (payload.nombre !== undefined) body.nombre = payload.nombre.trim()
  if (payload.descripcion !== undefined) body.descripcion = payload.descripcion?.trim()
  if (payload.montoObjetivo !== undefined) body.montoObjetivo = Number(payload.montoObjetivo)
  if (payload.fechaObjetivo !== undefined) body.fechaObjetivo = payload.fechaObjetivo
  if (payload.icono !== undefined) body.icono = payload.icono?.trim()
  if (payload.color !== undefined) body.color = payload.color?.trim()
  if (payload.activa !== undefined) body.activa = payload.activa
  return authRequest<any>(`/api/metas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then(mapMetaFromApi)
}

export function deleteMeta(id: number) {
  return authRequest<{ message: string }>(`/api/metas/${id}`, {
    method: 'DELETE',
  })
}

export function toggleMetaActiva(id: number, activa: boolean) {
  return authRequest<any>(`/api/metas/${id}/toggle?activa=${activa}`, {
    method: 'PATCH',
  }).then(mapMetaFromApi)
}

export function createAporte(metaId: number, payload: CreateAporteDto) {
  const body: any = {
    montoAporte: Number(payload.montoAporte),
  }
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.notas?.trim()) body.notas = payload.notas.trim()
  return authRequest<any>(`/api/metas/${metaId}/aportes`, {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(mapMetaFromApi)
}

export function getAportes(metaId: number) {
  return authRequest<any[]>(`/api/metas/${metaId}/aportes`)
}

// ─── Tipos de Préstamos ───
export type Prestamo = {
  id: number
  usuario_id: number
  cuenta_id?: number | null
  nombre: string
  tipo: 'PRESTAMO' | 'DEUDA'
  monto_total: number
  saldo_pendiente: number
  tasa_interes?: number | null
  fecha_inicio: string
  fecha_fin?: string | null
  notas?: string | null
  activa: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
  monto_pagado?: number
}

export type CreatePrestamoDto = {
  nombre: string
  tipo: 'PRESTAMO' | 'DEUDA'
  montoTotal: number
  tasaInteres?: number
  fechaInicio?: string
  fechaFin?: string
  cuentaId?: number
  notas?: string
}

export type UpdatePrestamoDto = Partial<CreatePrestamoDto> & {
  activa?: boolean
}

export type PagoPrestamo = {
  id: number
  prestamo_id: number
  cuenta_id?: number | null
  monto?: number
  monto_pago?: number
  fecha_pago: string
  notas?: string | null
  fecha_creacion?: string
}

export type CreatePagoPrestamoDto = {
  monto: number
  fechaPago?: string
  cuentaId?: number
  notas?: string
}

export type UpdatePagoPrestamoDto = {
  monto?: number
  fechaPago?: string
  cuentaId?: number
  notas?: string
}

function mapPrestamoFromApi(raw: any): Prestamo {
  return {
    id: raw.id,
    usuario_id: raw.usuario_id,
    cuenta_id: raw.cuenta_id,
    nombre: raw.nombre,
    tipo: raw.tipo === 'PRESTAMO' ? 'PRESTAMO' : 'DEUDA',
    monto_total: Number(raw.monto_total ?? 0),
    saldo_pendiente: Number(raw.saldo_pendiente ?? raw.monto_total ?? 0),
    tasa_interes: raw.tasa_interes != null ? Number(raw.tasa_interes) : null,
    fecha_inicio: raw.fecha_inicio,
    fecha_fin: raw.fecha_fin,
    notas: raw.notas,
    activa: Boolean(raw.activa),
    fecha_creacion: raw.fecha_creacion,
    fecha_actualizacion: raw.fecha_actualizacion,
    monto_pagado: raw.monto_pagado != null ? Number(raw.monto_pagado) : undefined,
  }
}

export function getPrestamos(activosSolo?: boolean) {
  const query = activosSolo === undefined ? '' : `?activos=${activosSolo}`
  return authRequest<any[]>(`/api/prestamos${query}`).then((list) =>
    (list || []).map(mapPrestamoFromApi)
  )
}

export function getPrestamo(id: number) {
  return authRequest<any>(`/api/prestamos/${id}`).then(mapPrestamoFromApi)
}

export function createPrestamo(payload: CreatePrestamoDto) {
  const body: any = {
    nombre: payload.nombre.trim(),
    tipo: payload.tipo,
    montoTotal: Number(payload.montoTotal),
  }
  if (payload.tasaInteres !== undefined) body.tasaInteres = Number(payload.tasaInteres)
  if (payload.fechaInicio) body.fechaInicio = payload.fechaInicio
  if (payload.fechaFin) body.fechaFin = payload.fechaFin
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.notas?.trim()) body.notas = payload.notas.trim()
  return authRequest<any>('/api/prestamos', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(mapPrestamoFromApi)
}

export function updatePrestamo(id: number, payload: UpdatePrestamoDto) {
  const body: any = {}
  if (payload.nombre !== undefined) body.nombre = payload.nombre.trim()
  if (payload.tipo !== undefined) body.tipo = payload.tipo
  if (payload.montoTotal !== undefined) body.montoTotal = Number(payload.montoTotal)
  if (payload.tasaInteres !== undefined) body.tasaInteres = payload.tasaInteres
  if (payload.fechaInicio !== undefined) body.fechaInicio = payload.fechaInicio
  if (payload.fechaFin !== undefined) body.fechaFin = payload.fechaFin
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.notas !== undefined) body.notas = payload.notas?.trim()
  if (payload.activa !== undefined) body.activa = payload.activa
  return authRequest<any>(`/api/prestamos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then(mapPrestamoFromApi)
}

export function deletePrestamo(id: number) {
  return authRequest<{ success?: boolean }>(`/api/prestamos/${id}`, {
    method: 'DELETE',
  })
}

export function togglePrestamo(id: number, activa: boolean) {
  return authRequest<any>(`/api/prestamos/${id}/toggle?activa=${activa}`, {
    method: 'PATCH',
  }).then(mapPrestamoFromApi)
}

export function createPagoPrestamo(prestamoId: number, payload: CreatePagoPrestamoDto) {
  const body: any = { monto: Number(payload.monto) }
  if (payload.fechaPago) body.fechaPago = payload.fechaPago
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.notas?.trim()) body.notas = payload.notas.trim()
  return authRequest<any>(`/api/prestamos/${prestamoId}/pagos`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getPagosPrestamo(prestamoId: number) {
  return authRequest<any[]>(`/api/prestamos/${prestamoId}/pagos`)
}

export function updatePagoPrestamo(pagoId: number, payload: UpdatePagoPrestamoDto) {
  const body: any = {}
  if (payload.monto !== undefined) body.monto = Number(payload.monto)
  if (payload.fechaPago !== undefined) body.fechaPago = payload.fechaPago
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.notas !== undefined) body.notas = payload.notas?.trim()
  return authRequest<any>(`/api/prestamos/pagos/${pagoId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deletePagoPrestamo(pagoId: number) {
  return authRequest<{ success?: boolean }>(`/api/prestamos/pagos/${pagoId}`, {
    method: 'DELETE',
  })
}

// ─── Tipos de Presupuestos ───
export type Presupuesto = {
  id: number
  usuario_id: number
  nombre: string
  periodo: 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'PERSONALIZADO'
  fecha_inicio: string
  fecha_fin: string
  monto_limite: number
  monto_gastado: number
  categoria_id?: number | null
  cuenta_id?: number | null
  activo: boolean
  notas?: string | null
  fecha_creacion?: string
  fecha_actualizacion?: string
}

export type CreatePresupuestoDto = {
  nombre: string
  periodo: 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'PERSONALIZADO'
  fechaInicio?: string
  fechaFin?: string
  montoLimite: number
  categoriaId?: number
  cuentaId?: number
  notas?: string
}

export type UpdatePresupuestoDto = Partial<CreatePresupuestoDto> & {
  activo?: boolean
}

function mapPresupuestoFromApi(raw: any): Presupuesto {
  return {
    id: raw.id,
    usuario_id: raw.usuario_id,
    nombre: raw.nombre,
    periodo: raw.periodo === 'SEMANAL' || raw.periodo === 'MENSUAL' || raw.periodo === 'ANUAL' ? raw.periodo : 'PERSONALIZADO',
    fecha_inicio: raw.fecha_inicio,
    fecha_fin: raw.fecha_fin,
    monto_limite: Number(raw.monto_limite ?? 0),
    monto_gastado: Number(raw.monto_gastado ?? 0),
    categoria_id: raw.categoria_id,
    cuenta_id: raw.cuenta_id,
    activo: Boolean(raw.activo),
    notas: raw.notas,
    fecha_creacion: raw.fecha_creacion,
    fecha_actualizacion: raw.fecha_actualizacion,
  }
}

export function getBudgets(activosSolo?: boolean) {
  const query = activosSolo === undefined ? '' : `?activos=${activosSolo}`
  return authRequest<any[]>(`/api/presupuestos${query}`).then((list) =>
    (list || []).map(mapPresupuestoFromApi)
  )
}

export function getBudget(id: number) {
  return authRequest<any>(`/api/presupuestos/${id}`).then(mapPresupuestoFromApi)
}

export function createPresupuesto(payload: CreatePresupuestoDto) {
  const body: any = {
    nombre: payload.nombre.trim(),
    periodo: payload.periodo,
    montoLimite: Number(payload.montoLimite),
  }
  if (payload.fechaInicio) body.fechaInicio = payload.fechaInicio
  if (payload.fechaFin) body.fechaFin = payload.fechaFin
  if (payload.categoriaId !== undefined) body.categoriaId = payload.categoriaId
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.notas?.trim()) body.notas = payload.notas.trim()
  return authRequest<any>('/api/presupuestos', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(mapPresupuestoFromApi)
}

export function updatePresupuesto(id: number, payload: UpdatePresupuestoDto) {
  const body: any = {}
  if (payload.nombre !== undefined) body.nombre = payload.nombre.trim()
  if (payload.periodo !== undefined) body.periodo = payload.periodo
  if (payload.fechaInicio !== undefined) body.fechaInicio = payload.fechaInicio
  if (payload.fechaFin !== undefined) body.fechaFin = payload.fechaFin
  if (payload.montoLimite !== undefined) body.montoLimite = Number(payload.montoLimite)
  if (payload.categoriaId !== undefined) body.categoriaId = payload.categoriaId
  if (payload.cuentaId !== undefined) body.cuentaId = payload.cuentaId
  if (payload.activo !== undefined) body.activo = payload.activo
  if (payload.notas !== undefined) body.notas = payload.notas?.trim()
  return authRequest<any>(`/api/presupuestos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then(mapPresupuestoFromApi)
}

export function deletePresupuesto(id: number) {
  return authRequest<{ success?: boolean }>(`/api/presupuestos/${id}`, {
    method: 'DELETE',
  })
}

export function togglePresupuesto(id: number, activo: boolean) {
  return authRequest<any>(`/api/presupuestos/${id}/toggle?activo=${activo}`, {
    method: 'PATCH',
  }).then(mapPresupuestoFromApi)
}

export function recalcPresupuesto(id: number) {
  return authRequest<any>(`/api/presupuestos/${id}/recalc`, {
    method: 'PATCH',
  }).then(mapPresupuestoFromApi)
}

export function getPresupuestoResumen(fecha?: string) {
  const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : ''
  return authRequest<any>(`/api/presupuestos/resumen${query}`)
}

export function getAccount(id: number) {
  return authRequest<Account>(`/api/cuentas/${id}`)
}

export function createAccount(payload: CreateAccountDto) {
  // Validar y limpiar el nombre
  const nombreValue = payload.nombre
  if (!nombreValue || (typeof nombreValue !== 'string') || !nombreValue.trim()) {
    throw new Error('El nombre de la cuenta es requerido y debe ser un texto')
  }
  
  // Construir payload limpio - solo campos con valores válidos
  const body: any = {
    nombre: nombreValue.trim(),
  }
  
  // Agregar campos opcionales solo si tienen valor válido
  if (payload.tipo) {
    body.tipo = payload.tipo
  }
  
  if (payload.moneda && payload.moneda.trim()) {
    body.moneda = payload.moneda.trim()
  }
  
  if (payload.saldoInicial !== undefined && payload.saldoInicial !== null) {
    const saldo = Number(payload.saldoInicial)
    if (!isNaN(saldo) && isFinite(saldo)) {
      body.saldoInicial = saldo
    }
  }
  
  if (payload.color && payload.color.trim()) {
    body.color = payload.color.trim()
  }
  
  if (payload.icono && payload.icono.trim()) {
    body.icono = payload.icono.trim()
  }
  
  if (payload.descripcion && payload.descripcion.trim()) {
    body.descripcion = payload.descripcion.trim()
  }
  
  return authRequest<Account>('/api/cuentas', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateAccount(id: number, payload: UpdateAccountDto) {
  return authRequest<Account>(`/api/cuentas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteAccount(id: number) {
  return authRequest<{ message: string }>(`/api/cuentas/${id}`, {
    method: 'DELETE',
  })
}

// ─── Funciones de Categorías ───
export function createCategoria(payload: CreateCategoriaDto) {
  return authRequest<Categoria>('/api/categorias', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategoria(id: number, payload: UpdateCategoriaDto) {
  return authRequest<Categoria>(`/api/categorias/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteCategoria(id: number) {
  const numericId = Number(id)
  if (isNaN(numericId)) {
    return Promise.reject(new Error('ID de categoría no válido'))
  }
  return authRequest<{ message: string }>(`/api/categorias/${numericId}`, {
    method: 'DELETE',
  })
}
