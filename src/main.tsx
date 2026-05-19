import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { RoleProvider } from '@/lib/role-context';

// R0–R7 routes wired. Remaining phases land incrementally:
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
import PersonsPage from '@/routes/persons';
import PersonDetailPage from '@/routes/person-detail';
import IncidentsPage from '@/routes/incidents';
import IncidentDetailPage from '@/routes/incident-detail';
import CamerasPage from '@/routes/cameras';
import CameraDetailPage from '@/routes/camera-detail';
import AccessPage from '@/routes/access';
import BuildingDetailPage from '@/routes/building-detail';
import BITListPage from '@/routes/bit';
import BITDetailPage from '@/routes/bit-detail';
import TitleIXListPage from '@/routes/title-ix';
import TitleIXDetailPage from '@/routes/title-ix-detail';
import ConductDetailPage from '@/routes/conduct-detail';
import EOCPage from '@/routes/eoc';
import EOCDetailPage from '@/routes/eoc-detail';
import RunbooksPage from '@/routes/runbooks';
import RunbookRunPage from '@/routes/runbook-run';
import NotificationsPage from '@/routes/notifications';
import NotificationDetailPage from '@/routes/notification-detail';
import LockdownsPage from '@/routes/lockdowns';
import TransitPage from '@/routes/transit';
import FacilitiesPage from '@/routes/facilities';
import CleryPage from '@/routes/clery';
import CleryASRPage from '@/routes/clery-asr';
import CleryGeographyPage from '@/routes/clery-geography';
import NIBRISPage from '@/routes/nibris';
import FOIAPage from '@/routes/foia';
import FOIADetailPage from '@/routes/foia-detail';
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

      // Incidents (R3)
      { path: 'incidents', element: <IncidentsPage /> },
      { path: 'incidents/:id', element: <IncidentDetailPage /> },

      // People (R3)
      { path: 'persons', element: <PersonsPage /> },
      { path: 'persons/:id', element: <PersonDetailPage /> },

      // Surveillance + Access (R4)
      { path: 'cameras', element: <CamerasPage /> },
      { path: 'cameras/:id', element: <CameraDetailPage /> },
      { path: 'access', element: <AccessPage /> },
      { path: 'access/buildings/:id', element: <BuildingDetailPage /> },

      // Threat Intel + Title IX + Conduct (R5)
      { path: 'bit', element: <BITListPage /> },
      { path: 'bit/:id', element: <BITDetailPage /> },
      { path: 'title-ix', element: <TitleIXListPage /> },
      { path: 'title-ix/:id', element: <TitleIXDetailPage /> },
      { path: 'conduct/:id', element: <ConductDetailPage /> },

      // EOC + Runbooks + Notifications + Lockdowns + Transit + Facilities (R6)
      { path: 'eoc', element: <EOCPage /> },
      { path: 'eoc/activations/:id', element: <EOCDetailPage /> },
      { path: 'runbooks', element: <RunbooksPage /> },
      { path: 'runbooks/:id/run', element: <RunbookRunPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'notifications/:id', element: <NotificationDetailPage /> },
      { path: 'access/lockdowns', element: <LockdownsPage /> },
      { path: 'transit', element: <TransitPage /> },
      { path: 'facilities', element: <FacilitiesPage /> },

      // Clery + NIBRS + FOIA (R7)
      { path: 'clery', element: <CleryPage /> },
      { path: 'clery/asr/:year', element: <CleryASRPage /> },
      { path: 'clery/geography', element: <CleryGeographyPage /> },
      { path: 'nibris', element: <NIBRISPage /> },
      { path: 'foia', element: <FOIAPage /> },
      { path: 'foia/requests/:id', element: <FOIADetailPage /> },

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
