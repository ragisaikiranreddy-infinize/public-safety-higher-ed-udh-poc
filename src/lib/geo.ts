/**
 * Lightweight geo math kit for the campus map.
 *
 * For heavier polygon ops, prefer @turf/turf. This module covers the small
 * operations we need in dozens of mock-db helpers without round-trip dep
 * imports: distance, interpolation, bearing, bbox, point-in-polygon.
 *
 * Coordinate convention: { lat, lng } (not GeoJSON's [lng, lat] ordering).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** A closed polygon: first and last point match. Used for buildings + Clery geography. */
export type GeoPolygon = GeoPoint[];

const R_EARTH_M = 6_371_000;

const toRad = (d: number): number => (d * Math.PI) / 180;
const toDeg = (r: number): number => (r * 180) / Math.PI;

/** Great-circle distance in meters. */
export function distance(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH_M * Math.asin(Math.sqrt(h));
}

/** Linear interpolation between two GeoPoints. Good enough at campus scale. */
export function lerpPoint(a: GeoPoint, b: GeoPoint, t: number): GeoPoint {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

/** Initial bearing in degrees (0..360, 0 = north) — used for vehicle marker rotation. */
export function bearingDeg(a: GeoPoint, b: GeoPoint): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Tight bbox around a set of points: [minLng, minLat, maxLng, maxLat] (MapLibre order). */
export function bbox(points: GeoPoint[]): [number, number, number, number] {
  if (!points.length) return [0, 0, 0, 0];
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }
  return [minLng, minLat, maxLng, maxLat];
}

/** Ray-casting point-in-polygon. Polygon should be closed (first === last). */
export function polygonContains(point: GeoPoint, polygon: GeoPolygon): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Centroid of a closed polygon — used for label placement on the map. */
export function polygonCentroid(polygon: GeoPolygon): GeoPoint {
  if (!polygon.length) return { lat: 0, lng: 0 };
  let sumLat = 0;
  let sumLng = 0;
  // Skip the duplicated closing point if present.
  const n =
    polygon.length > 1 &&
    polygon[0].lat === polygon[polygon.length - 1].lat &&
    polygon[0].lng === polygon[polygon.length - 1].lng
      ? polygon.length - 1
      : polygon.length;
  for (let i = 0; i < n; i++) {
    sumLat += polygon[i].lat;
    sumLng += polygon[i].lng;
  }
  return { lat: sumLat / n, lng: sumLng / n };
}
