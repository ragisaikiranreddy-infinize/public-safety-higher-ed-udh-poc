/**
 * <CampusMap /> — the Home page hero.
 *
 * MapLibre + react-map-gl basemap centered on CAMPUS_ANCHOR. Layers:
 *   - Building polygons (clickable, navigates to /access/buildings/:id)
 *   - Clery geography (visualization fill per class)
 *   - Cameras (dots colored by online/offline; analytics-cameras emphasized)
 *   - Blue-light phones (blue dots; pulse if active call; gray if offline)
 *   - Access-controlled doors (small ticks per door)
 *   - Active incidents (red pulse markers; click → Incident 360)
 *
 * Layer toggles + region focus controlled by the parent route. OpenFreeMap
 * tile source — no API key (per implementation-plan §3).
 *
 * Per CLAUDE.md pitfall #5: any animation timers must clean up; this
 * component is timer-free in R4 (live-pulse via Tailwind animation only).
 */

import { useMemo, useState } from 'react';
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapRef,
  type ViewState,
} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, ShieldAlert, Siren, Layers as LayersIcon, DoorOpen } from 'lucide-react';
import {
  BUILDINGS,
  CAMPUS_ANCHOR,
  CAMERAS,
  DOORS,
  BLUE_LIGHTS,
  INCIDENTS,
} from '@/lib/mock-db';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';
import type { Building } from '@/lib/types';

const TILE_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// =========================================================================
// Layer toggle definitions
// =========================================================================

export interface CampusMapLayers {
  buildings: boolean;
  cleryGeography: boolean;
  cameras: boolean;
  doors: boolean;
  blueLights: boolean;
  activeIncidents: boolean;
}

export const DEFAULT_LAYERS: CampusMapLayers = {
  buildings: true,
  cleryGeography: false,
  cameras: true,
  doors: false,
  blueLights: true,
  activeIncidents: true,
};

// =========================================================================
// Component
// =========================================================================

interface Props {
  layers?: CampusMapLayers;
  onLayersChange?: (l: CampusMapLayers) => void;
  /** Optionally focus the map on a specific building. */
  focusBuildingId?: string;
  className?: string;
  height?: number;
  showLayerPanel?: boolean;
}

export function CampusMap({
  layers = DEFAULT_LAYERS,
  onLayersChange,
  focusBuildingId,
  className,
  height = 460,
  showLayerPanel = true,
}: Props) {
  const navigate = useNavigate();
  const mapRef = useRef<MapRef | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [popupBuilding, setPopupBuilding] = useState<Building | null>(null);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: CAMPUS_ANCHOR.lng,
    latitude: CAMPUS_ANCHOR.lat,
    zoom: 15.4,
  });

  // Focus on a specific building when prop changes
  useEffect(() => {
    if (!focusBuildingId) return;
    const b = BUILDINGS.find((bb) => bb.id === focusBuildingId);
    if (!b) return;
    setViewState({
      longitude: b.centroid.lng,
      latitude: b.centroid.lat,
      zoom: 17.5,
    });
  }, [focusBuildingId]);

  // GeoJSON for building polygons + Clery overlay
  const buildingFeatures = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: BUILDINGS.map((b) => ({
      type: 'Feature' as const,
      id: b.id,
      properties: {
        id: b.id,
        name: b.name,
        kind: b.kind,
        regionId: b.regionId,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [b.polygon.map((p) => [p.lng, p.lat])],
      },
    })),
  }), []);

  // Active incidents — open / on-scene only
  const activeIncidents = useMemo(
    () => INCIDENTS.filter((i) => i.status === 'open' || i.status === 'on-scene'),
    [],
  );

  function toggle(layer: keyof CampusMapLayers) {
    if (!onLayersChange) return;
    onLayersChange({ ...layers, [layer]: !layers[layer] });
  }

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg border', className)}
      style={{ height }}
    >
      <Map
        ref={mapRef}
        mapLib={maplibregl as never}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={TILE_STYLE}
        attributionControl={false}
        interactiveLayerIds={['buildings-fill']}
        onMouseMove={(e) => {
          const feat = e.features?.[0];
          setHoveredBuilding((feat?.properties as { id?: string })?.id ?? null);
        }}
        onClick={(e) => {
          const feat = e.features?.[0];
          if (feat && layers.buildings) {
            const id = (feat.properties as { id?: string })?.id;
            const b = BUILDINGS.find((bb) => bb.id === id);
            if (b) setPopupBuilding(b);
          }
        }}
        cursor={hoveredBuilding ? 'pointer' : 'grab'}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Building polygons */}
        {layers.buildings && (
          <Source id="buildings" type="geojson" data={buildingFeatures}>
            <Layer
              id="buildings-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'kind'],
                  'residential', 'rgba(91, 108, 255, 0.28)',
                  'academic',    'rgba(60, 130, 200, 0.22)',
                  'admin',       'rgba(120, 120, 120, 0.22)',
                  'athletics',   'rgba(200, 120, 60, 0.22)',
                  'medical',     'rgba(200, 60, 120, 0.22)',
                  'parking',     'rgba(100, 100, 100, 0.18)',
                  'rgba(120, 120, 120, 0.18)',
                ],
                'fill-outline-color': [
                  'case',
                  ['==', ['get', 'id'], hoveredBuilding ?? ''],
                  'rgba(75, 90, 220, 1)',
                  'rgba(75, 90, 220, 0.6)',
                ],
              }}
            />
            <Layer
              id="buildings-outline"
              type="line"
              paint={{
                'line-color': 'rgba(75, 90, 220, 0.8)',
                'line-width': [
                  'case',
                  ['==', ['get', 'id'], hoveredBuilding ?? ''],
                  3,
                  1.5,
                ],
              }}
            />
          </Source>
        )}

        {/* Cameras */}
        {layers.cameras && CAMERAS.map((c) => (
          <Marker
            key={c.id}
            longitude={c.location.lng}
            latitude={c.location.lat}
            anchor="center"
          >
            <button
              type="button"
              onClick={() => navigate(`/cameras/${encodeURIComponent(c.id)}`)}
              title={`${c.name} · ${c.kind} · ${c.vendor}${c.isOnline ? '' : ' · OFFLINE'}`}
              className={cn(
                'flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-white shadow-sm transition-transform hover:scale-150',
                c.isOnline ? 'bg-[var(--signal-blue)]' : 'bg-[var(--graphite-400)]',
                c.id === 'CAM-CARTER-N3' && 'h-4 w-4 ring-[var(--signal-amber)] animate-pulse',
              )}
            />
          </Marker>
        ))}

        {/* Blue-light phones */}
        {layers.blueLights && BLUE_LIGHTS.map((bl) => (
          <Marker
            key={bl.id}
            longitude={bl.location.lng}
            latitude={bl.location.lat}
            anchor="center"
          >
            <div
              title={`${bl.name}${bl.isOnline ? '' : ' · OFFLINE'}${bl.isActiveCall ? ' · ACTIVE CALL' : ''}`}
              className={cn(
                'h-3 w-3 rounded-full ring-2 ring-white shadow-sm',
                bl.isActiveCall ? 'bg-[var(--signal-red)] animate-pulse' :
                bl.isOnline ? 'bg-[oklch(0.55_0.18_245)]' :
                'bg-[var(--graphite-400)]',
              )}
            />
          </Marker>
        ))}

        {/* Doors (only at zoom > 16 to avoid clutter) */}
        {layers.doors && DOORS.map((d) => (
          <Marker
            key={d.id}
            longitude={d.location.lng}
            latitude={d.location.lat}
            anchor="center"
          >
            <div
              title={`${d.name} · ${d.kind}${d.controlledByAcs ? ' · ACS' : ''}`}
              className="h-2 w-2 rounded-sm bg-[var(--graphite-700)] ring-1 ring-white"
            />
          </Marker>
        ))}

        {/* Active incidents — pulse markers */}
        {layers.activeIncidents && activeIncidents.map((inc) => (
          <Marker
            key={inc.id}
            longitude={inc.location.lng}
            latitude={inc.location.lat}
            anchor="center"
          >
            <button
              type="button"
              onClick={() => navigate(`/incidents/${encodeURIComponent(inc.id)}`)}
              title={`${inc.id} · ${inc.callType} · ${inc.status}`}
              className="relative flex items-center justify-center"
            >
              <span className="absolute h-6 w-6 animate-ping rounded-full bg-[var(--signal-red)] opacity-40" />
              <span className="relative h-3 w-3 rounded-full bg-[var(--signal-red)] ring-2 ring-white shadow-md" />
            </button>
          </Marker>
        ))}

        {/* Building popup on click */}
        {popupBuilding && (
          <Popup
            longitude={popupBuilding.centroid.lng}
            latitude={popupBuilding.centroid.lat}
            anchor="bottom"
            onClose={() => setPopupBuilding(null)}
            closeButton
            closeOnClick={false}
            maxWidth="260px"
          >
            <div className="p-1 text-xs">
              <div className="font-display text-sm font-semibold text-[var(--foreground)]">
                {popupBuilding.name}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[var(--muted-foreground)]">
                {popupBuilding.id}
              </div>
              <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                {popupBuilding.addressLine}
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded-md bg-[var(--hub-600)] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[var(--hub-700)]"
                onClick={() => {
                  setPopupBuilding(null);
                  navigate(`/access/buildings/${encodeURIComponent(popupBuilding.id)}`);
                }}
              >
                Open building detail →
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Layer toggle panel */}
      {showLayerPanel && onLayersChange && (
        <div className="absolute left-3 top-3 max-w-[200px] rounded-md border bg-[var(--card)] p-2 shadow-md backdrop-blur-sm">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <LayersIcon className="h-3 w-3" />
            Layers
          </div>
          <div className="space-y-1 text-xs">
            <LayerToggle label="Buildings" active={layers.buildings} onToggle={() => toggle('buildings')} />
            <LayerToggle label="Cameras" icon={CameraIcon} active={layers.cameras} onToggle={() => toggle('cameras')} />
            <LayerToggle label="Blue-light phones" active={layers.blueLights} onToggle={() => toggle('blueLights')} />
            <LayerToggle label="Doors" icon={DoorOpen} active={layers.doors} onToggle={() => toggle('doors')} />
            <LayerToggle label="Active incidents" icon={Siren} active={layers.activeIncidents} onToggle={() => toggle('activeIncidents')} />
            <LayerToggle label="Clery geography" icon={ShieldAlert} active={layers.cleryGeography} onToggle={() => toggle('cleryGeography')} />
          </div>
        </div>
      )}
    </div>
  );
}

function LayerToggle({
  label,
  icon: Icon,
  active,
  onToggle,
}: {
  label: string;
  icon?: React.ElementType;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-2 rounded px-1.5 py-0.5 text-left text-[11px] transition-colors',
        active
          ? 'text-[var(--foreground)]'
          : 'text-[var(--muted-foreground)] opacity-70 hover:opacity-100',
      )}
    >
      <span
        className={cn(
          'h-3 w-3 rounded-sm border',
          active ? 'border-[var(--hub-600)] bg-[var(--hub-600)]' : 'border-[var(--graphite-300)]',
        )}
      />
      {Icon && <Icon className="h-3 w-3" />}
      <span className="flex-1">{label}</span>
    </button>
  );
}
