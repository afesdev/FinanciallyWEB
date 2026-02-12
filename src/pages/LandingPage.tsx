import mockup from '../assets/mockoup.png'
import logo from '../assets/logo.svg'
import playStoreLogo from '../assets/google-play.svg'
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo Financially" className="h-9 w-auto md:h-10" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight">Financially</span>
              <span className="text-[0.65rem] font-medium uppercase tracking-widest text-slate-400">
                Finanzas personales
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a href="#features" className="transition-colors hover:text-emerald-500">
              Funcionalidades
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-emerald-500">
              Cómo funciona
            </a>
            <a href="#app" className="transition-colors hover:text-emerald-500">
              App móvil
            </a>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              className="rounded-full px-4 py-2 font-medium text-slate-600 transition-colors hover:text-emerald-600"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </button>
            <button
              className="hidden rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-300/60 transition-all hover:bg-emerald-600 md:inline-flex"
              onClick={() => navigate('/register')}
            >
              Crear cuenta
            </button>
          </div>
        </nav>
      </header>

      {/* Hero - layout con imagen a un lado */}
      <section className="relative bg-emerald-50/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 pt-14 pb-10 md:flex-row md:items-center md:justify-between md:pt-20 md:pb-16">
          {/* Texto */}
          <div className="max-w-xl animate-fade-in-up text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Nuevo · Finanzas personales simplificadas
            </span>

            <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Toma el control de{' '}
              <span className="block bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                tu dinero.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 md:text-lg">
              Centraliza ingresos, gastos, metas y deudas en un solo lugar. Visualiza tu salud financiera
              en tiempo real y toma mejores decisiones todos los días.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 animate-fade-in-up-delay md:justify-start justify-center">
              <button
                className="group relative rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-300/70 transition-all hover:bg-emerald-600 hover:shadow-emerald-400/80 hover:scale-[1.02]"
                onClick={() => navigate('/register')}
              >
                Crear cuenta gratis
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </button>
              <button
                className="rounded-full border border-emerald-100 bg-white px-8 py-3.5 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-800"
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </button>
            </div>

            {/* Descarga en Play Store */}
            <div className="mt-5 flex items-center justify-center gap-3 md:justify-start">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
                También en tu móvil
              </span>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-2 text-left shadow-sm transition-all hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100/70"
              >
                <img
                  src={playStoreLogo}
                  alt="Disponible en Google Play"
                  className="h-8 w-auto"
                />
              </a>
            </div>
          </div>

          {/* Imagen + efectos al lado derecho */}
          <div className="relative flex flex-1 justify-center md:justify-end animate-fade-in-up-delay-2">
            {/* Tarjetas flotantes */}
            <div className="pointer-events-none absolute -top-4 -left-2 sm:-left-6 md:-left-10 lg:-left-16 animate-float">
              <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <span className="text-lg text-emerald-500">↑</span>
                  </div>
                  <div>
                    <p className="text-[0.65rem] text-slate-500">Ingresos del mes</p>
                    <p className="text-sm font-bold text-emerald-600">+$3,240,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta de ahorro */}
            <div className="pointer-events-none absolute bottom-6 -left-6 sm:left-0 md:-left-4 lg:left-2 animate-float-delay">
              <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                    <span className="text-lg text-sky-500">🎯</span>
                  </div>
                  <div>
                    <p className="text-[0.65rem] text-slate-500">Meta de ahorro</p>
                    <p className="text-sm font-bold text-sky-500">78% completado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gastos controlados */}
            <div className="pointer-events-none absolute top-10 right-0 sm:top-6 sm:right-4 md:top-4 md:right-8 lg:top-0 lg:right-12 hidden md:block animate-float-slow">
              <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <span className="text-lg text-violet-500">📊</span>
                  </div>
                  <div>
                    <p className="text-[0.65rem] text-slate-500">Gastos controlados</p>
                    <p className="text-sm font-bold text-violet-500">-12% vs mes ant.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup */}
            <img
              src={mockup}
              alt="Mockup aplicación Financially"
              className="h-auto w-full max-w-[420px] md:max-w-[500px] lg:max-w-[560px] mix-blend-screen pointer-events-none select-none"
            />
          </div>
        </div>
      </section>

      {/* Trusted metrics strip */}
      <section className="border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 py-8 md:gap-16 md:py-10">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 md:text-3xl">100%</p>
            <p className="mt-1 text-xs text-slate-500">Gratis para empezar</p>
          </div>
          <div className="hidden h-8 w-px bg-slate-800 md:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 md:text-3xl">Tiempo real</p>
            <p className="mt-1 text-xs text-slate-500">Sincronización de datos</p>
          </div>
          <div className="hidden h-8 w-px bg-slate-800 md:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 md:text-3xl">256-bit</p>
            <p className="mt-1 text-xs text-slate-500">Encriptación SSL</p>
          </div>
          <div className="hidden h-8 w-px bg-slate-800 md:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 md:text-3xl">Android</p>
            <p className="mt-1 text-xs text-slate-500">App disponible</p>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
            Funcionalidades
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Todo lo que puedes hacer con Financially.
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Registra tus movimientos día a día, organiza tus categorías, crea metas de ahorro y entiende
            cómo se comporta tu dinero con visualizaciones claras y simples.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="group rounded-3xl border border-slate-100 bg-white p-7 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/60 hover:-translate-y-1">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-500 ring-1 ring-emerald-100">
              $
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Seguimiento automático de ingresos y gastos
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Registra de forma rápida tus ingresos y gastos, clasifícalos por categoría y mantén siempre
              actualizado tu balance mensual.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
              Saber más <span>→</span>
            </div>
          </div>

          <div className="group rounded-3xl border border-slate-100 bg-white p-7 transition-all hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60 hover:-translate-y-1">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-xl ring-1 ring-sky-100">
              🎯
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Metas y presupuestos inteligentes
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Define cuánto quieres ahorrar, cuánto puedes gastar en cada categoría y recibe alertas cuando
              estés cerca de pasarte.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-sky-600 opacity-0 transition-opacity group-hover:opacity-100">
              Saber más <span>→</span>
            </div>
          </div>

          <div className="group rounded-3xl border border-slate-100 bg-white p-7 transition-all hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60 hover:-translate-y-1">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl ring-1 ring-violet-100">
              📊
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Panel y reportes en tiempo real
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Consulta tu flujo de caja, deudas, capacidad de ahorro y reportes por periodo para tomar mejores decisiones.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100">
              Saber más <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="how-it-works" className="relative border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid items-start gap-16 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                Cómo funciona
              </span>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Usa la app a tu ritmo, todos los días.
              </h2>
              <p className="mt-4 max-w-lg text-base text-slate-600">
                Financially está pensada para que llevar el control de tu dinero sea algo sencillo y
                rápido, tanto en la web como en tu celular.
              </p>

              <ol className="mt-10 space-y-8">
                <li className="flex gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Crea tu cuenta y personaliza tu perfil</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Regístrate en minutos, define tu moneda, tus cuentas principales y las categorías
                      que usas en tu día a día.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Registra tus movimientos y organiza tus finanzas</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Añade ingresos, gastos, deudas y metas. Asigna cada movimiento a una cuenta y
                      categoría para mantener todo ordenado.
                    </p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Monitorea, ajusta y cumple tus objetivos</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Revisa tu panel, tus reportes y alertas para saber si vas por buen camino y qué
                      debes ajustar para lograr tus metas.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Preview card */}
            <div className="relative">
              <div className="sticky top-28 space-y-5 rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-200/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                    Próximamente
                  </p>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-sm text-slate-700">
                  Resumen en vivo de los datos traídos desde tu API de finanzas:
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-sm">
                        💰
                      </div>
                      <span className="text-sm text-slate-700">Balance general del mes</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">---</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600 text-sm">
                        📂
                      </div>
                      <span className="text-sm text-slate-700">Gastos por categoría</span>
                    </div>
                    <span className="text-sm font-semibold text-sky-600">---</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3 ring-1 ring-violet-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600 text-sm">
                        🎯
                      </div>
                      <span className="text-sm text-slate-700">Progreso de metas de ahorro</span>
                    </div>
                    <span className="text-sm font-semibold text-violet-600">---</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 text-sm">
                        🔔
                      </div>
                      <span className="text-sm text-slate-700">Alertas y pagos próximos</span>
                    </div>
                    <span className="text-sm font-semibold text-amber-600">---</span>
                  </div>
                </div>

                <p className="text-[0.65rem] text-slate-500">
                  Se integrarán estos datos en tiempo real cuando la API esté conectada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App móvil CTA */}
      <section id="app" className="mx-auto max-w-7xl px-6 py-24 md:py-32 bg-white">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-10 md:p-16">
          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Disponible en Android
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Tus finanzas siempre
                <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  en tu bolsillo.
                </span>
              </h2>
              <p className="max-w-md text-base text-slate-600">
                Descarga la app de Financially y lleva el control de tus ingresos, gastos y metas donde quiera que vayas.
              </p>

              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/70"
              >
                <img
                  src={playStoreLogo}
                  alt="Disponible en Google Play"
                  className="h-11 w-auto"
                />
              </a>
            </div>

            {/* Mini mockup */}
            <div className="flex justify-center">
              <div className="relative animate-float">
                <img
                  src={mockup}
                  alt="Financially app móvil"
                  className="h-auto w-full max-w-[260px] md:max-w-[300px] mix-blend-screen pointer-events-none select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Empieza a controlar tu dinero
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {' '}
              hoy mismo.
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Crea tu cuenta gratis y conecta tus finanzas en minutos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              className="rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-300/70 transition-all hover:bg-emerald-600 hover:shadow-emerald-400/80 hover:scale-[1.02]"
              onClick={() => navigate('/register')}
            >
              Crear cuenta gratis
            </button>
            <button
              className="rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Financially" className="h-7 w-auto" />
              <span className="text-sm font-semibold text-slate-500">Financially</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#features" className="transition-colors hover:text-emerald-600">
                Funcionalidades
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-emerald-600">
                Cómo funciona
              </a>
              <a href="#app" className="transition-colors hover:text-emerald-600">
                App móvil
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <button
                className="transition-colors hover:text-emerald-600"
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </button>
              <button
                className="transition-colors hover:text-emerald-600"
                onClick={() => navigate('/register')}
              >
                Crear cuenta
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Financially. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage

