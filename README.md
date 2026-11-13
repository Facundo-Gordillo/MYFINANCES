# MyFinances – Personal Finance Web App

**English** | [Español](README.es.md)

MyFinances is a responsive web app to track personal finances: accounts, categories, income and expenses, with per-user data stored in Firebase. It was built with React + Vite as a university final project (*TP Final*).

## Features

- **Authentication** with email and password (Firebase Auth): sign up, log in and log out, with public and private routes.
- **Accounts**: create, edit and delete accounts (e.g., cash, bank, wallet), each with its own balance.
- **Categories**: create, edit and delete categories to classify transactions.
- **Transactions**: record income or expenses with amount, description, account and category. The account balance is updated automatically (added for income, subtracted for expenses). Transactions can be deleted.
- **Filters**: filter transactions by date range (date picker) and by account.
- **Charts & summaries**: pie chart of expenses by category and a monthly per-category summary with totals and percentages.
- **Real-time sync**: data is read with Firestore real-time listeners, scoped to the signed-in user (`users/{uid}/...`).
- **Dark mode** and a responsive layout with a collapsible sidebar (desktop, tablet and mobile).
- Deployable to **Firebase Hosting**.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7 |
| Backend-as-a-Service | Firebase Authentication, Cloud Firestore |
| Charts | Chart.js + react-chartjs-2 |
| UI | lucide-react icons, react-datepicker, custom CSS |
| Tooling | ESLint |
| Hosting | Firebase Hosting |

## Project Structure

```
MYFINANCES/
├── public/                  # Static assets (app icon)
├── src/
│   ├── components/
│   │   ├── home.jsx         # Main dashboard (transactions, filters, chart)
│   │   ├── home/            # AddTransaction, AddCategoria, BarraLateral (sidebar), PieChart
│   │   ├── barraLateral/    # Accounts, categories and summary pages + forms
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── hooks/               # useBarraLateral (responsive sidebar), useDarkMode
│   ├── routes/              # PrivateRoute, PublicRoute
│   ├── styles/              # Component styles
│   ├── firebaseConfig.js    # Firebase initialization (reads env variables)
│   ├── App.jsx              # Routing
│   └── main.jsx
├── firebase.json            # Firebase Hosting config
├── .env.example             # Required environment variables
└── vite.config.js
```

## Getting Started

### Requirements

- Node.js 20+ and npm
- A Firebase project with **Authentication (Email/Password)** and **Cloud Firestore** enabled

### Installation

```bash
git clone https://github.com/Facundo-Gordillo/MYFINANCES.git
cd MYFINANCES
cp .env.example .env     # fill in your Firebase web app config
npm install
npm run dev
```

> **Note:** `package.json` references a local package `@dataconnect/generated` (Firebase Data Connect, generated code that is not committed). If `npm install` fails on it, remove that dependency from `package.json` — the app does not import it.

## Environment Variables

Defined in `.env` (see [`.env.example`](.env.example)):

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_apiKey` | Firebase web API key |
| `VITE_FIREBASE_authDomain` | Firebase auth domain |
| `VITE_FIREBASE_projectId` | Firebase project ID |
| `VITE_FIREBASE_storageBucket` | Firebase storage bucket |
| `VITE_FIREBASE_messagingSenderId` | Firebase messaging sender ID |
| `VITE_FIREBASE_appId` | Firebase app ID |

> Firebase web config values are not secret by design, but access to data must be protected with **Firestore Security Rules** (each user should only read/write `users/{their uid}/**`).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Deployment (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` serves `dist/` and rewrites all routes to `index.html` (SPA).

## Author

**Facundo Gordillo** – [GitHub](https://github.com/Facundo-Gordillo)
