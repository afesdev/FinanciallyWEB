## FinanciallyWEB

Aplicación web para **gestión financiera personal** (cuentas, transacciones, presupuestos, metas, préstamos y reportes), construida con **React + TypeScript + Vite**.

### Logo

El logo de la aplicación se encuentra en:

- `src/assets/logo.svg`

Se usa como:
- Favicon principal.
- Logo de carga (preload) en `index.html`.
- Logo en el `Sidebar` del dashboard.

### Descripción general

FinanciallyWEB es un panel financiero moderno que permite:

- Registrar y visualizar **cuentas bancarias, efectivo y tarjetas**.
- Gestionar **categorías** de ingreso/gasto.
- Registrar **transacciones**, transferencias entre cuentas y ver el historial.
- Crear y seguir **metas de ahorro**.
- Administrar **préstamos y deudas** con registro de pagos.
- Definir **presupuestos** por categoría/período.
- Consultar **reportes** con resumen de ingresos, gastos y balances, incluyendo descarga de **PDF**.
- Personalizar la apariencia con **modo claro/oscuro** y color del **sidebar**.

La experiencia está diseñada como un dashboard tipo SaaS, con una UI moderna, responsiva y consistente.

---

### Estructura principal del proyecto

- `index.html`  
  Entrada principal del front. Define meta tags, favicon, logo de carga y el punto de montaje de React.

- `src/main.tsx`  
  Punto de arranque de React; monta el `App` sobre el DOM.

- `src/App.tsx`  
  Define las **rutas** principales de la aplicación (login, home, cuentas, categorías, metas, préstamos, presupuestos, transacciones, reportes, perfil) y envuelve todo con los contextos globales (`AuthProvider`, `ThemeProvider`).

#### Contextos

- `src/context/AuthContext.tsx`  
  Manejo de autenticación y datos del usuario (nombre, email, moneda predeterminada, etc.).

- `src/context/ThemeContext.tsx`  
  - Controla el modo **claro/oscuro**.
  - Guarda el **color del sidebar**.
  - Persiste preferencias en `localStorage`.
  - Aplica la clase `dark` sobre `<html>` para el modo oscuro.

#### Dashboard

- `src/components/dashboard/Navbar.tsx`  
  Barra superior con:
  - Saludo al usuario.
  - Icono sol/luna según la hora.
  - Botón para abrir el panel de personalización de tema.
  - Acceso al menú en mobile.

- `src/components/dashboard/Sidebar.tsx`  
  Menú lateral con:
  - Logo y nombre de la app.
  - Navegación entre secciones.
  - Avatar y datos del usuario.
  - Botón de cerrar sesión.
  - Comportamiento **colapsable** y color totalmente configurable (incluyendo blanco, con ajustes de contraste).

- `src/components/dashboard/ThemeDrawer.tsx`  
  Panel lateral derecho para:
  - Cambiar entre modo **claro** y **oscuro**.
  - Seleccionar el color del **sidebar** (varios tonos oscuros y blanco).

- Tarjetas del home:
  - `StatsCards.tsx`: resumen de saldos (total, ingresos, gastos).
  - `AccountsList.tsx`: resumen de cuentas.
  - `RecentTransactions.tsx`: últimas transacciones.
  - `ProfileCard.tsx`: mini tarjeta de perfil.
  - `GoalsCard.tsx`: metas activas.
  - `NextSteps.tsx`: acciones recomendadas / próximos pasos.

#### Cuentas

- `src/pages/AccountsPage.tsx`  
  - Lista de cuentas con tarjetas.
  - Resumen de saldo total.
  - Estados de carga y vacío.
  - Acciones: crear, editar, eliminar.

- `src/components/accounts/AccountFormModal.tsx`  
  Modal para crear/editar cuentas:
  - Tipo (bancaria, efectivo, tarjeta, digital, ahorro, inversión…).
  - Moneda.
  - Saldo inicial.
  - Color e icono.
  - Descripción.
  - Estado **activa/inactiva**.

#### Categorías

- `src/pages/CategoriasPage.tsx`  
  - Lista de categorías.
  - Contadores por tipo (Gastos, Ingresos, Ambos).
  - Filtros por tipo.
  - Estados de carga y vacío.

- `src/components/categories/CategoriaFormModal.tsx`  
  Modal para crear/editar categorías:
  - Tipo (`GASTO`, `INGRESO`, `AMBOS`).
  - Color.
  - Icono.
  - Estado **activa**.

#### Metas de ahorro

- `src/pages/MetasPage.tsx`  
  - Lista de metas con barra de progreso.
  - Filtros (todas, activas, completadas).
  - Resumen total ahorrado vs objetivo.
  - Acciones: crear, editar, activar/desactivar, eliminar, aportar.

- `src/components/goals/MetaFormModal.tsx`  
  Modal para crear/editar metas:
  - Nombre, descripción.
  - Monto objetivo y fecha objetivo.
  - Color.
  - Estado **activa**.

- `src/components/goals/AporteModal.tsx`  
  Modal para registrar aportes a una meta desde una cuenta.

#### Préstamos y deudas

- `src/pages/PrestamosPage.tsx`  
  - Lista de préstamos/deudas.
  - Filtros (activos / todos).
  - Barra de progreso (pagado vs total, saldo pendiente).
  - Acciones: crear, editar, activar/desactivar, eliminar, registrar pago, ver lista de pagos.

- `src/components/loans/PrestamoFormModal.tsx`  
  Modal (con scroll) para crear/editar préstamos:
  - Tipo (yo debo / me deben).
  - Monto total, tasa de interés.
  - Fechas de inicio/fin.
  - Cuenta asociada.
  - Notas.
  - Estado **activo**.

- `src/components/loans/PagoPrestamoModal.tsx`  
  Modal para registrar pagos de un préstamo.

#### Presupuestos

- `src/pages/PresupuestosPage.tsx`  
  - Lista de presupuestos.
  - Filtros (activos / todos).
  - Barra de progreso de gasto vs límite.
  - Acciones: crear, editar, activar/desactivar, eliminar, recalcular gasto.

- `src/components/budgets/PresupuestoFormModal.tsx`  
  Modal (scrollable) para crear/editar presupuestos:
  - Período (semanal, mensual, anual, personalizado).
  - Fechas de inicio/fin (con cálculo automático según período).
  - Monto límite.
  - Categoría y cuenta opcionales.
  - Notas.
  - Estado **activo**.
  - Totalmente adaptado a modo oscuro.

#### Transacciones

- `src/pages/TransaccionesPage.tsx`  
  - Lista avanzada de transacciones:
    - Filtros por tipo (todos, ingresos, gastos, transferencias).
    - Búsqueda por título, descripción, categoría.
    - Tabs para **activas** y **archivadas**.
    - Navegación por mes.
    - Resumen de ingresos, gastos y balance.
  - Acciones:
    - Crear transacción.
    - Crear transferencia.
    - Ver detalle.
    - Archivar / eliminar permanentemente.

- `src/components/transactions/TransaccionFormModal.tsx`  
  Modal para crear transacciones:
  - Tipo (ingreso / gasto).
  - Cuenta, categoría, monto, fecha.
  - Campos para transacciones **recurrentes**.

- `src/components/transactions/TransferModal.tsx`  
  Modal para transferencias entre cuentas:
  - Cuenta origen y destino (layout en dos columnas).
  - Monto y fecha.
  - Modo oscuro.

- `src/components/transactions/TransaccionDetailModal.tsx`  
  Modal con detalle de una transacción.

#### Reportes

- `src/pages/ReportesPage.tsx`  
  - Resumen de:
    - Ingresos.
    - Gastos.
    - Balance.
  - Barra “Ingresos vs Gastos”.
  - Desglose:
    - **Por categoría**.
    - **Por cuenta**.
  - Filtros de período:
    - Este mes, mes pasado, últimos 3 meses, este año, personalizado.
  - Botón para descargar **PDF** con:
    - Encabezado con bloque de color.
    - Cajas de resumen.
    - Tablas por categoría y por cuenta.
    - Pie de página con paginación.

#### Perfil

- `src/pages/ProfilePage.tsx`  
  - Vista de perfil con cabecera tipo hero y avatar con inicial.
  - Edición de:
    - Nombre.
    - Teléfono.
    - Fecha de nacimiento.
    - Moneda predeterminada.
  - Correo mostrado como campo de solo lectura.

#### Servicios y utilidades

- `src/services/api.ts`  
  Cliente de API y definición de tipos (`Account`, `Categoria`, `Meta`, `Prestamo`, `Presupuesto`, `Transaccion`, `Create/Update*Dto`, etc.), centralizando toda la comunicación con el backend.

- `src/utils/format.ts`  
  Utilidades de formato, como `formatCurrency`.

- `src/hooks/useSidebarCollapsed.ts`  
  Hook para recordar en `localStorage` si el sidebar está **colapsado** o no entre recargas.

- `src/index.css`  
  Estilos globales:
  - Configuración de Tailwind 4.
  - Variante `dark` basada en la clase `dark` en `<html>`.
  - Colores base de fondo y texto para modo claro/oscuro.

---

Este README está enfocado en **describir el proyecto, su estructura y funcionalidades**, no en cómo instalarlo ni en la configuración de herramientas.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
