/**
 * Shuttle GPS pings — most recent ping per active vehicle.
 *
 * The 7 active vehicles (4 + 3) on the two normal routes each have a recent
 * GPS ping. Suspended routes have no active vehicles.
 */

import type { TransitGPSPing } from '@/lib/types';
import { isoSeconds, minutesAgo } from '@/lib/time';
import { rng, randInt, randFloat, pick } from '@/lib/seed';
import { SHUTTLE_ROUTES } from './transit-routes';

const r = rng('transit-gps-v1');

const pings: TransitGPSPing[] = [];
let seq = 0;
SHUTTLE_ROUTES.forEach((route) => {
  if (route.activeVehicleCount === 0) return;
  for (let i = 0; i < route.activeVehicleCount; i++) {
    const stop = pick(r, route.polyline);
    const minutesBack = randInt(r, 0, 4);
    seq++;
    pings.push({
      id: `GPS-${seq.toString().padStart(5, '0')}`,
      routeId: route.id,
      vehicleId: `SHTL-${route.id.split('-')[1]}-${i + 1}`,
      at: isoSeconds(minutesAgo(minutesBack + r() * 0.5)),
      location: {
        lat: stop.lat + randFloat(r, -0.0002, 0.0002),
        lng: stop.lng + randFloat(r, -0.0002, 0.0002),
      },
      speedMph: randInt(r, 8, 22),
      headingDeg: randInt(r, 0, 359),
      onRoute: true,
    });
  }
});

export const TRANSIT_GPS_PINGS: TransitGPSPing[] = pings.sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);
