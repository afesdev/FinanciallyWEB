import { motion, useReducedMotion } from 'motion/react'
import { Icons } from './Icons'
import { getFormattedDate, getGreeting } from '../../utils/format'

type WelcomeBannerProps = {
  nombre: string
  cuentas?: number
  onNavigate: (section: string) => void
}

export default function WelcomeBanner({ nombre, cuentas, onNavigate }: WelcomeBannerProps) {
  const reduceMotion = useReducedMotion()
  const primerNombre = nombre.split(' ')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative isolate mb-5 overflow-hidden rounded-3xl bg-brand-700 p-6 text-white [background-image:radial-gradient(ellipse_60%_120%_at_15%_-20%,#23a85f,rgba(35,168,95,0)_70%)] lg:px-7 lg:py-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/70">
            {getGreeting()}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] lg:text-3xl">
            Hola, {primerNombre}
          </h2>
          <p className="mt-1.5 text-sm text-white/70">
            <span className="first-letter:uppercase">{getFormattedDate()}</span>
            {typeof cuentas === 'number' && cuentas > 0 && (
              <> · {cuentas} {cuentas === 1 ? 'cuenta activa' : 'cuentas activas'}</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <motion.button
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('transactions')}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-brand-800 transition-colors hover:bg-brand-50"
          >
            {Icons.plus}
            Registrar movimiento
          </motion.button>
          <motion.button
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('accounts')}
            className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60"
          >
            {Icons.wallet}
            Nueva cuenta
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
