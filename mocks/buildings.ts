/**
 * Campus buildings — fictional. Anchored at a synthetic lat/lng so the
 * MapLibre basemap renders consistently. Each polygon is closed
 * (first === last); each carries kind, region, generator + shelter flags.
 *
 * The Thread A "building of concern" is BLD-CARTER-HALL.
 * The Thread B failed-generator building is BLD-WEST-WING-4.
 */

import type { Building, GeoPoint, GeoPolygon } from '@/lib/types';

// Campus anchor — a synthetic point in the upper Midwest. Coordinates picked
// to avoid resemblance to a real institution.
export const CAMPUS_ANCHOR: GeoPoint = { lat: 41.5025, lng: -91.5680 };

/** Build a tight rectangular polygon around a centroid at campus scale. */
function box(centroid: GeoPoint, latDeg: number, lngDeg: number): GeoPolygon {
  const dLat = latDeg / 2;
  const dLng = lngDeg / 2;
  return [
    { lat: centroid.lat - dLat, lng: centroid.lng - dLng },
    { lat: centroid.lat - dLat, lng: centroid.lng + dLng },
    { lat: centroid.lat + dLat, lng: centroid.lng + dLng },
    { lat: centroid.lat + dLat, lng: centroid.lng - dLng },
    { lat: centroid.lat - dLat, lng: centroid.lng - dLng }, // close
  ];
}

const offset = (dLat: number, dLng: number): GeoPoint => ({
  lat: CAMPUS_ANCHOR.lat + dLat,
  lng: CAMPUS_ANCHOR.lng + dLng,
});

export const BUILDINGS: Building[] = [
  // ---- North Campus (residential core + library) ----
  {
    id: 'BLD-ADAMS-HALL',
    name: 'Adams Hall',
    kind: 'residential',
    regionId: 'north-campus',
    centroid: offset(0.0030, -0.0040),
    polygon: box(offset(0.0030, -0.0040), 0.0012, 0.0014),
    addressLine: '210 N Quad Walk',
    yearBuilt: 1924,
    hasBackupGenerator: true,
    isShelterDesignated: false,
    hoursOfOperation: '24/7 residential',
    primaryUseDescription: 'Upper-class residence hall (350 beds).',
  },
  {
    id: 'BLD-CARTER-HALL',
    name: 'Carter Hall',
    kind: 'residential',
    regionId: 'north-campus',
    centroid: offset(0.0026, -0.0028),
    polygon: box(offset(0.0026, -0.0028), 0.0012, 0.0014),
    addressLine: '226 N Quad Walk',
    yearBuilt: 1956,
    hasBackupGenerator: true,
    isShelterDesignated: false,
    hoursOfOperation: '24/7 residential',
    primaryUseDescription:
      'First-year residence hall (412 beds). Co-ed by floor.',
  },
  {
    id: 'BLD-MADDOX-HALL',
    name: 'Maddox Hall',
    kind: 'residential',
    regionId: 'north-campus',
    centroid: offset(0.0032, -0.0014),
    polygon: box(offset(0.0032, -0.0014), 0.0012, 0.0014),
    addressLine: '240 N Quad Walk',
    yearBuilt: 1968,
    hasBackupGenerator: false,
    isShelterDesignated: false,
    hoursOfOperation: '24/7 residential',
    primaryUseDescription: 'First-year residence hall (388 beds).',
  },
  {
    id: 'BLD-MAIN-LIBRARY',
    name: 'Main Library',
    kind: 'academic',
    regionId: 'north-campus',
    centroid: offset(0.0010, -0.0024),
    polygon: box(offset(0.0010, -0.0024), 0.0020, 0.0024),
    addressLine: '100 Library Plaza',
    yearBuilt: 1937,
    hasBackupGenerator: true,
    isShelterDesignated: true,
    hoursOfOperation: 'Sun–Thu 24h · Fri–Sat 07:00–02:00',
    primaryUseDescription:
      'Flagship research library. Shelter-designated for severe weather.',
  },

  // ---- Central Campus (academic + admin core) ----
  {
    id: 'BLD-STUDENT-UNION',
    name: 'Student Union',
    kind: 'mixed',
    regionId: 'central-campus',
    centroid: offset(-0.0004, -0.0008),
    polygon: box(offset(-0.0004, -0.0008), 0.0018, 0.0022),
    addressLine: '50 University Walk',
    yearBuilt: 1988,
    hasBackupGenerator: true,
    isShelterDesignated: true,
    hoursOfOperation: 'Mon–Fri 06:00–24:00 · Sat–Sun 08:00–24:00',
    primaryUseDescription:
      'Dining commons, student services, ballroom. Shelter-designated.',
  },
  {
    id: 'BLD-PD-HQ',
    name: 'Public Safety Building (UPD HQ)',
    kind: 'admin',
    regionId: 'central-campus',
    centroid: offset(-0.0014, 0.0004),
    polygon: box(offset(-0.0014, 0.0004), 0.0010, 0.0012),
    addressLine: '85 Central Walk',
    yearBuilt: 2004,
    hasBackupGenerator: true,
    isShelterDesignated: true,
    hoursOfOperation: '24/7',
    primaryUseDescription:
      'University Police Department, PSAP/dispatch, EOC primary, evidence custody.',
  },
  {
    id: 'BLD-ADMIN-HALL',
    name: 'Administration Hall',
    kind: 'admin',
    regionId: 'central-campus',
    centroid: offset(0.0000, 0.0016),
    polygon: box(offset(0.0000, 0.0016), 0.0012, 0.0014),
    addressLine: '300 University Walk',
    yearBuilt: 1948,
    hasBackupGenerator: true,
    isShelterDesignated: false,
    primaryUseDescription:
      'Provost, General Counsel, Dean of Students, Title IX Coordinator offices.',
  },
  {
    id: 'BLD-SCIENCE-1',
    name: 'Science Building 1',
    kind: 'academic',
    regionId: 'central-campus',
    centroid: offset(-0.0028, 0.0008),
    polygon: box(offset(-0.0028, 0.0008), 0.0014, 0.0018),
    addressLine: '410 Science Loop',
    yearBuilt: 1972,
    hasBackupGenerator: true,
    isShelterDesignated: false,
    primaryUseDescription: 'Biology, chemistry teaching labs.',
  },

  // ---- South Campus (athletics + grad housing + lots) ----
  {
    id: 'BLD-ARENA',
    name: 'Hawkeye Arena',
    kind: 'athletics',
    regionId: 'south-campus',
    centroid: offset(-0.0050, -0.0020),
    polygon: box(offset(-0.0050, -0.0020), 0.0024, 0.0030),
    addressLine: '1 Arena Drive',
    yearBuilt: 1996,
    hasBackupGenerator: true,
    isShelterDesignated: false,
    primaryUseDescription:
      '15,000-seat arena. Game-day and commencement venue.',
  },
  {
    id: 'BLD-GRAD-TOWER',
    name: 'Graduate Tower',
    kind: 'residential',
    regionId: 'south-campus',
    centroid: offset(-0.0044, 0.0014),
    polygon: box(offset(-0.0044, 0.0014), 0.0010, 0.0010),
    addressLine: '500 South Walk',
    yearBuilt: 2012,
    hasBackupGenerator: true,
    isShelterDesignated: false,
    primaryUseDescription: 'Graduate-student apartments (220 units).',
  },
  {
    id: 'BLD-WEST-WING-3',
    name: 'West Wing 3 Residence',
    kind: 'residential',
    regionId: 'south-campus',
    centroid: offset(-0.0056, 0.0026),
    polygon: box(offset(-0.0056, 0.0026), 0.0010, 0.0012),
    addressLine: '610 South Walk',
    yearBuilt: 2018,
    hasBackupGenerator: true,
    isShelterDesignated: true,
    primaryUseDescription:
      'Upper-class residence (180 beds). Shelter-designated for severe weather drills.',
  },
  {
    id: 'BLD-WEST-WING-4',
    name: 'West Wing 4 Residence',
    kind: 'residential',
    regionId: 'south-campus',
    centroid: offset(-0.0058, 0.0036),
    polygon: box(offset(-0.0058, 0.0036), 0.0010, 0.0012),
    addressLine: '620 South Walk',
    yearBuilt: 2019,
    hasBackupGenerator: true,
    isShelterDesignated: true,
    primaryUseDescription:
      'Upper-class residence (180 beds). Shelter-designated — but Thread B exercises a generator-failure anomaly.',
  },
  {
    id: 'BLD-SOUTH-DECK',
    name: 'South Parking Deck',
    kind: 'parking',
    regionId: 'south-campus',
    centroid: offset(-0.0040, -0.0006),
    polygon: box(offset(-0.0040, -0.0006), 0.0014, 0.0020),
    addressLine: '550 Lot Drive',
    yearBuilt: 2008,
    hasBackupGenerator: false,
    isShelterDesignated: false,
    primaryUseDescription: '1,200-stall deck. LPR-equipped at both entrances.',
  },
  {
    id: 'BLD-HEALTH-CTR',
    name: 'Student Health & Counseling Center',
    kind: 'medical',
    regionId: 'central-campus',
    centroid: offset(0.0008, -0.0040),
    polygon: box(offset(0.0008, -0.0040), 0.0010, 0.0012),
    addressLine: '120 Health Walk',
    yearBuilt: 2010,
    hasBackupGenerator: true,
    isShelterDesignated: false,
    primaryUseDescription:
      'Student Health Center plus Counseling Center. Counseling-42CFR2 wall applies; scheduling metadata only.',
  },
];
