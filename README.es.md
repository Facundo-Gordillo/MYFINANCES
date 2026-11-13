# MyFinances – App web de finanzas personales

[English](README.md) | **Español**

MyFinances es una app web responsive para llevar las finanzas personales: cuentas, categorías, ingresos y egresos, con los datos de cada usuario guardados en Firebase. Está hecha con React + Vite como trabajo práctico final universitario (*TP Final*).

## Funcionalidades

- **Autenticación** con email y contraseña (Firebase Auth): registro, login y logout, con rutas públicas y privadas.
- **Cuentas**: crear, editar y eliminar cuentas (efectivo, banco, billetera, etc.), cada una con su saldo.
- **Categorías**: crear, editar y eliminar categorías para clasificar las transacciones.
- **Transacciones**: registrar ingresos o egresos con monto, descripción, cuenta y categoría. El saldo de la cuenta se actualiza solo (suma en ingresos, resta en egresos). Las transacciones se pueden eliminar.
- **Filtros**: por rango de fechas (date picker) y por cuenta.
- **Gráficos y resúmenes**: gráfico de torta de gastos por categoría y resumen mensual por categoría con totales y porcentajes.
- **Sincronización en tiempo real**: los datos se leen con listeners de Firestore, separados por usuario (`users/{uid}/...`).
- **Modo oscuro** y diseño responsive con barra lateral colapsable (desktop, tablet y mobile).
- Despliegue en **Firebase Hosting**.

## Stack

| Área | Tecnología |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7 |
| Backend-as-a-Service | Firebase Authentication, Cloud Firestore |
| Gráficos | Chart.js + react-chartjs-2 |
| UI | Íconos lucide-react, react-datepicker, CSS propio |
| Herramientas | ESLint |
| Hosting | Firebase Hosting |

## Estructura

```
MYFINANCES/
├── public/                  # Archivos estáticos (ícono)
├── src/
│   ├── components/
│   │   ├── home.jsx         # Dashboard principal (transacciones, filtros, gráfico)
│   │   ├── home/            # AddTransaction, AddCategoria, BarraLateral, PieChart
│   │   ├── barraLateral/    # Páginas y formularios de cuentas, categorías y resúmenes
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── hooks/               # useBarraLateral (barra responsive), useDarkMode
│   ├── routes/              # PrivateRoute, PublicRoute
│   ├── styles/              # Estilos por componente
│   ├── firebaseConfig.js    # Inicialización de Firebase (lee variables de entorno)
│   ├── App.jsx              # Ruteo
│   └── main.jsx
├── firebase.json            # Configuración de Firebase Hosting
├── .env.example             # Variables de entorno necesarias
└── vite.config.js
```

## Cómo empezar

### Requisitos

- Node.js 20+ y npm
- Un proyecto de Firebase con **Authentication (Email/Password)** y **Cloud Firestore** habilitados

### Instalación

```bash
git clone https://github.com/Facundo-Gordillo/MYFINANCES.git
cd MYFINANCES
cp .env.example .env     # completar con la config web de tu proyecto Firebase
npm install
npm run dev
```

> **Nota:** `package.json` referencia un paquete local `@dataconnect/generated` (código generado de Firebase Data Connect que no está versionado). Si `npm install` falla por eso, quitá esa dependencia de `package.json`: la app no lo importa.

## Variables de entorno

Se definen en `.env` (ver [`.env.example`](.env.example)):

| Variable | Descripción |
| --- | --- |
| `VITE_FIREBASE_apiKey` | API key web de Firebase |
| `VITE_FIREBASE_authDomain` | Dominio de auth de Firebase |
| `VITE_FIREBASE_projectId` | ID del proyecto |
| `VITE_FIREBASE_storageBucket` | Bucket de storage |
| `VITE_FIREBASE_messagingSenderId` | Sender ID de messaging |
| `VITE_FIREBASE_appId` | App ID |

> Los valores de la config web de Firebase no son secretos por diseño, pero el acceso a los datos tiene que estar protegido con **reglas de seguridad de Firestore** (cada usuario solo puede leer/escribir `users/{su uid}/**`).

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | Ejecutar ESLint |

## Despliegue (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` sirve `dist/` y redirige todas las rutas a `index.html` (SPA).

## Autor

**Facundo Gordillo** – [GitHub](https://github.com/Facundo-Gordillo)
