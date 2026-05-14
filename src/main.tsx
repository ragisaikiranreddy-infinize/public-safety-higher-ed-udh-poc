import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { RoleProvider } from '@/lib/role-context';

// R0 routes — Foundation. The full ~65-route tree lands incrementally:
//   R1 — Data (catalog/sources/pipelines/quality/metrics)
//   R2 — Pipeline live-run + Source onboarding wizard
//   R3 — People + Incidents
//   R4 — Campus map + Building intelligence
//   R5 — Thread A (BIT)
//   R6 — Thread B (EOC)
//   R7 — Thread C (Clery)
//   R8 — Module 5B Conduct + Governance
//   R9 — Polish, copilots, AI surfaces, demo script
//
// Until each phase lands, those URLs render the NotFoundPage (404-friendly).

import HomePage from '@/routes/home';
import NotFoundPage from '@/routes/not-found';

import './styles/globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoleProvider initial="chief-of-police">
      <RouterProvider router={router} />
    </RoleProvider>
  </StrictMode>,
);
