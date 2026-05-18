import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { RoleProvider } from '@/lib/role-context';

// R0/R1 routes. The remaining ~50 routes land incrementally:
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
import CatalogPage from '@/routes/catalog';
import DatasetDetailPage from '@/routes/dataset-detail';
import SourcesPage from '@/routes/sources';
import SourceDetailPage from '@/routes/source-detail';
import SourceNewPage from '@/routes/source-new';
import PipelinesPage from '@/routes/pipelines';
import PipelineDetailPage from '@/routes/pipeline-detail';
import PipelineRunPage from '@/routes/pipeline-run';
import QualityPage from '@/routes/quality';
import MetricsPage from '@/routes/metrics';
import NotFoundPage from '@/routes/not-found';

import './styles/globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },

      // Data (R1 + R2)
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'catalog/:id', element: <DatasetDetailPage /> },
      { path: 'sources', element: <SourcesPage /> },
      { path: 'sources/new', element: <SourceNewPage /> },
      { path: 'sources/:id', element: <SourceDetailPage /> },
      { path: 'pipelines', element: <PipelinesPage /> },
      { path: 'pipelines/:id', element: <PipelineDetailPage /> },
      { path: 'pipelines/:id/run', element: <PipelineRunPage /> },
      { path: 'quality', element: <QualityPage /> },
      { path: 'metrics', element: <MetricsPage /> },

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
