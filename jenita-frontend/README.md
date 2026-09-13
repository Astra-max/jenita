# Jenita — AI Day Planner

Next.js (App Router) + Redux Toolkit + Tailwind CSS + react-hot-toast.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Pages

- `/` — landing page
- `/login` — log in (demo account: demo@jenita.app / jenita123)
- `/signup` — create account
- `/forgot-password` — request a password reset link
- `/dashboard` — placeholder home base shown after logging in

## Notes

- Auth is mocked in `src/store/features/auth/authSlice.ts` with simulated
  network delay — swap the thunks for real API calls when you have a backend.
- Redux store: `src/store/store.ts`, typed hooks in `src/store/hooks.ts`.
- Toasts are wired globally in `src/app/providers.tsx`.
