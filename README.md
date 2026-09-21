# Northstar CRM

Northstar is a focused CRM admin workspace for managing customer relationships. It uses React, TypeScript, Ant Design, Redux Toolkit, RTK Query, React Router, and Supabase.

## Run locally

```bash
npm install
npm run dev
```

Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never put a Supabase service-role key in the frontend. Run `supabase/schema.sql` in the Supabase SQL editor before using live contacts. It creates the contacts table, indexes, RLS policies, and four seed records. The policies allow authenticated users to manage the shared internship workspace; replace them with ownership or tenant policies for production.

The login screen includes a demo workspace for local UI exploration when Supabase is unavailable. Live authentication remains the primary path and uses Supabase email/password auth. The authenticated shell has Overview, Contacts, Analytics, and Activity sections. Contact list, create, edit, delete, and date-range filtering go through the typed RTK Query API. Unchanged query arguments reuse RTK Query cache entries for five minutes after unsubscription; successful CRUD operations invalidate the contact list/entity tags, causing active pages to fetch the latest data without a full-page reload. Demo contacts are persisted in local storage and are guarded by the demo owner ID; live contacts are scoped by the Supabase RLS policies in `supabase/schema.sql`.

## Structure

The source is feature-first: `features/auth` owns authentication and route protection, `features/contacts` owns the data contract, filters, API, and CRUD UI, `features/dashboard` owns the overview, `features/analytics` owns charts and metrics, `features/activity` owns the workspace log, and `features/layout` owns the authenticated shell. Shared Redux wiring lives in `redux` and typed hooks in `app`.

## Checks

```bash
npm run lint
npm run build
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

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

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

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
