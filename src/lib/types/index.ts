/**
 * Type catalog — Public Safety / Higher Education UDH POC.
 *
 * One file. Numbered sections §1..§21. All FKs are string IDs. All
 * timestamps are ISO strings derived from `src/lib/time.ts`. Union types,
 * not TS enums. xyflow v12 custom-node data extends Record<string, unknown>
 * via intersection.
 *
 * R0 ships §1..§7 stubbed. Later phases extend; this file is the
 * source-of-truth for the domain model and must stay sectioned.
 */

import type { GeoPoint, GeoPolygon } from '../geo';
export type { GeoPoint, GeoPolygon };

// =========================================================================
// §1 — Core enums
// =========================================================================

export type MedallionLayer = 'bronze' | 'silver' | 'gold';

/**
 * 10-tier classification scale specific to higher-ed public safety.
 *
 *  - public                   — published / press-releasable
 *  - internal                 — staff-only
 *  - ferpa-edu-record         — FERPA-protected educational record
 *  - cji                      — Criminal Justice Information (CJIS-protected)
 *  - title-ix-sensitive       — Title IX records (walled)
 *  - counseling-42cfr2        — Counseling records under 42 CFR Part 2 (hard wall)
 *  - pii                      — Personally identifiable (SSN, DOB, etc.)
 *  - phi                      — Protected health information (student health center)
 *  - juvenile                 — Minor's records
 *  - restricted-investigation — Active-investigation hold
 */
export type Classification =
  | 'public'
  | 'internal'
  | 'ferpa-edu-record'
  | 'cji'
  | 'title-ix-sensitive'
  | 'counseling-42cfr2'
  | 'pii'
  | 'phi'
  | 'juvenile'
  | 'restricted-investigation';

export type Severity = 'critical' | 'warning' | 'info';

export type Priority = 1 | 2 | 3 | 4;

/** Nine active personas exercised by the role switcher. */
export type RoleId =
  | 'chief-of-police'
  | 'dispatcher'
  | 'eoc-director'
  | 'dean-of-students'
  | 'title-ix-coordinator'
  | 'bit-chair'
  | 'clery-officer'
  | 'ciso'
  | 'executive';

/** Campus geographic region — for region-scoped filtering in the header. */
export type RegionId = 'all' | 'north-campus' | 'central-campus' | 'south-campus';

/** Incident status lifecycle. */
export type IncidentStatus =
  | 'open'
  | 'on-scene'
  | 'cleared'
  | 'pending'
  | 'closed'
  | 'unfounded';

/** NIBRS offense codes — incomplete; expand as fixtures land. */
export type NIBRSCode =
  | '13A' | '13B' | '13C' | '23F' | '23G' | '23H' | '24A'
  | '26A' | '35A' | '35B' | '90A' | '90C' | '90D' | '90F' | '90Z';

/** Clery geography classification per the 34 CFR 668.46 polygon rules. */
export type CleryGeographyClass =
  | 'on-campus'
  | 'on-campus-residential'
  | 'non-campus'
  | 'public-property'
  | 'off-campus'
  | 'tbd';

/** Time-window selector in the header. */
export type TimeWindow = '24h' | '7d' | '30d' | '90d';

/** Cross-narrative thread tag — every fixture that participates in a thread carries this. */
export type ThreadTag = 'A' | 'B' | 'C';

// =========================================================================
// §2 — Geography & facility
// =========================================================================

export type BuildingKind =
  | 'academic'
  | 'residential'
  | 'admin'
  | 'athletics'
  | 'utility'
  | 'medical'
  | 'parking'
  | 'mixed';

export interface Building {
  id: string;                      // 'BLD-CARTER-HALL'
  name: string;
  kind: BuildingKind;
  regionId: RegionId;
  centroid: GeoPoint;
  polygon: GeoPolygon;             // closed; first === last
  addressLine: string;
  yearBuilt?: number;
  hasBackupGenerator: boolean;
  isShelterDesignated: boolean;
  hoursOfOperation?: string;       // "24/7" or "07:00-23:00 daily"
  primaryUseDescription?: string;
}

export interface ResidenceHall {
  id: string;                      // 'RES-CARTER-HALL'
  buildingId: string;
  capacity: number;
  currentOccupancy?: number;
  residentTypes: ('first-year' | 'upper-class' | 'graduate' | 'family' | 'greek')[];
  resourceCoordinatorPersonId?: string;
}

export interface Beat {
  id: string;                      // 'BEAT-CENTRAL'
  name: string;
  regionId: RegionId;
  polygon: GeoPolygon;
  averageDailyCalls: number;
}

export interface Lot {
  id: string;                      // 'LOT-NORTH-DECK'
  name: string;
  regionId: RegionId;
  polygon: GeoPolygon;
  capacity: number;
  hasLPR: boolean;
  permitTypes: string[];           // 'student', 'faculty-staff', 'visitor', 'reserved'
}

export interface Region {
  id: RegionId;
  name: string;
  description?: string;
}

/** Clery geography polygon set — bi-temporal. Polygon changes never silently
 *  re-classify historical incidents; new polygon takes effect from `validFrom` forward. */
export interface CleryGeographyPolygon {
  id: string;                              // 'CGP-MAIN-CAMPUS-2025'
  cleryClass: CleryGeographyClass;
  name: string;
  polygon: GeoPolygon;
  validFrom: string;                       // ISO
  validTo?: string;                        // ISO; undefined === current
  recordedAt: string;                      // when this entry was committed
  recordedByPersonId: string;
  rationale: string;                       // why this polygon was drawn this way
}

// =========================================================================
// §3 — Person & identity
// =========================================================================

export type PersonAffiliation =
  | 'student'
  | 'employee'
  | 'visitor'
  | 'contractor'
  | 'alumnus'
  | 'no-trespass'
  | 'unknown';

export type PersonIdentifierKind =
  | 'sis-id'
  | 'emplid'
  | 'onecard-id'
  | 'state-pd-id'
  | 'license-plate'
  | 'phone'
  | 'email'
  | 'device-id'
  | 'biometric-template-id';

export interface PersonIdentifier {
  kind: PersonIdentifierKind;
  value: string;
  classification: Classification;
  confidence: number;              // 0..100 for probabilistic merges
  source: string;                  // dataset/source ID
  matchMethod: 'deterministic-exact' | 'deterministic-fuzzy' | 'probabilistic';
}

export interface Person {
  id: string;                      // 'PER-008470'
  fullName: string;                // canonical chosen name
  legalName?: string;              // ferpa-edu-record
  dob?: string;                    // pii
  affiliations: PersonAffiliation[];
  identifiers: PersonIdentifier[];
  resolvedFromSourceIds: string[];
  mergeConfidence: number;         // 0..100
  primaryResidenceBuildingId?: string;
  roomAssignment?: string;
  primaryWorkBuildingId?: string;
  hasActiveNoContact: boolean;
  hasActiveTrespass: boolean;
  inOpenBITCase: boolean;
  inOpenTitleIXCase: boolean;
  inOpenInvestigation: boolean;
  isCSAEnabled?: boolean;
  classificationTier: Classification;
  consentFlags: ConsentFlag[];
  createdAt: string;
  lastReviewedAt: string;
  threadTag?: ThreadTag;
}

export interface ConsentFlag {
  kind:
    | 'ferpa-directory-info-optout'
    | 'photo-release'
    | 'communications-optout'
    | 'research-participation';
  granted: boolean;
  source: string;
  effectiveFrom: string;
}

export interface NoContactOrder {
  id: string;                      // 'NCO-2026-0042'
  partyAPersonId: string;
  partyBPersonId: string;
  issuedAt: string;
  expiresAt?: string;
  scope: 'mutual' | 'one-way';
  issuingOffice: 'student-conduct' | 'title-ix' | 'court' | 'pd';
  classification: Classification;
}

export interface TrespassOrder {
  id: string;                      // 'TRO-2026-0011'
  subjectPersonId: string;
  issuedAt: string;
  expiresAt?: string;
  scope: 'campus-wide' | 'building-specific';
  buildingIds?: string[];
  issuedByPersonId: string;
  rationale: string;
  classification: Classification;
}

// =========================================================================
// §4 — Vehicle
// =========================================================================

export interface Vehicle {
  id: string;                      // 'VEH-2104'
  plate: string;                   // tokenized in PII roles
  plateClassification: Classification;
  state: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registeredToPersonId?: string;
  permitId?: string;
  isHotlisted: boolean;
  hotlistReason?: string;
}

export interface VehiclePermit {
  id: string;                      // 'PRM-S-12847'
  vehicleId: string;
  personId: string;
  permitType: string;              // 'student', 'faculty-staff', 'visitor', etc.
  validFrom: string;
  validTo: string;
  authorizedLotIds: string[];
}

export interface VehicleHotlist {
  vehicleId: string;
  reason: 'BOLO' | 'stolen' | 'banned' | 'no-trespass-vehicle' | 'investigation-of-interest';
  addedAt: string;
  expiresAt?: string;
  source: 'NCIC' | 'state-DMV' | 'local-PD' | 'campus-PD-internal';
  classification: Classification;
}

export interface LPRDetection {
  id: string;                      // 'LPR-2026-04881-A'
  vehicleId?: string;              // resolved against canonical Vehicle (may be unknown)
  plateRead: string;
  state?: string;
  capturedAt: string;
  capturedByCameraId: string;
  location: GeoPoint;
  isHotlistHit: boolean;
  confidence: number;              // 0..100
  classification: Classification;
}

// =========================================================================
// §5 — Roster sources (feed Person resolution)
// =========================================================================

export interface Student {
  id: string;                      // 'STU-2024-0008470' (system-of-record SIS ID)
  sourceSystem: 'banner' | 'peoplesoft' | 'workday-student' | 'colleague' | 'jenzabar';
  resolvedToPersonId?: string;
  fullName: string;
  legalName?: string;
  dob?: string;
  classStanding: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'non-degree';
  major?: string;
  enrollmentStatus: 'enrolled' | 'leave-of-absence' | 'withdrawn' | 'graduated' | 'suspended';
  housingAssignment?: string;
  classification: Classification;
}

export interface Employee {
  id: string;                      // 'EMP-104271'
  sourceSystem: 'workday-hcm' | 'banner-hr';
  resolvedToPersonId?: string;
  fullName: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  isCSADesignated?: boolean;
  classification: Classification;
}

export interface Visitor {
  id: string;                      // 'VIS-2026-009912'
  resolvedToPersonId?: string;
  fullName?: string;
  sponsorPersonId?: string;
  visitStart: string;
  visitEnd?: string;
  purpose: string;
  classification: Classification;
}

export interface Contractor {
  id: string;                      // 'CTR-2026-0488'
  resolvedToPersonId?: string;
  fullName: string;
  vendorOrganization: string;
  workOrderRef?: string;
  authorizedFrom: string;
  authorizedTo: string;
  classification: Classification;
}

export interface Alumnus {
  id: string;                      // 'ALM-2018-007711'
  resolvedToPersonId?: string;
  fullName: string;
  graduationYear: number;
  classification: Classification;
}

// =========================================================================
// §6 — Dispatch & response
// =========================================================================

/** CAD call type — short codified labels. Expand as fixtures land. */
export type CallTypeCode =
  | 'ALARM-FIRE'
  | 'ALARM-INTRUSION'
  | 'ALARM-PANIC'
  | 'ASSAULT'
  | 'ASSAULT-SEXUAL'
  | 'BURGLARY'
  | 'DV'
  | 'DISORDERLY'
  | 'DRUG-VIOL'
  | 'DUI'
  | 'HARASSMENT'
  | 'LARCENY'
  | 'LIQUOR-VIOL'
  | 'MENTAL-HEALTH'
  | 'MVA'
  | 'NOISE'
  | 'STALKING'
  | 'SUSPICIOUS'
  | 'THEFT-BIKE'
  | 'THEFT-PACKAGE'
  | 'TRESPASS'
  | 'VANDALISM'
  | 'WEAPONS'
  | 'WELFARE-CHECK'
  | 'OTHER';

export interface CallForService {
  id: string;                      // 'CFS-2026-04881'
  receivedAt: string;
  source: 'phone' | 'text-to-911' | 'blue-light' | 'walk-in' | 'app' | 'auto-alarm' | 'officer-initiated';
  callerPersonId?: string;
  callerPhoneHash?: string;        // pii (hashed)
  rawNarrative: string;
  callType: CallTypeCode;
  priority: Priority;
  reportedLocationText: string;
  reportedLocation: GeoPoint;
  resolvedToIncidentId?: string;
  classification: Classification;
}

export interface CADEvent {
  id: string;                      // 'CAD-2026-04881-...'
  callForServiceId: string;
  incidentId?: string;
  kind:
    | 'received'
    | 'dispatched'
    | 'enroute'
    | 'on-scene'
    | 'cleared'
    | 'cancelled'
    | 'transfer-to-rms';
  at: string;
  actorOfficerId?: string;
  unitId?: string;
  note?: string;
  classification: Classification;
}

export interface Incident {
  id: string;                      // 'INC-2026-04881'
  cfsNumber: string;
  rmsCaseNumber?: string;
  status: IncidentStatus;
  callType: CallTypeCode;
  priority: Priority;
  receivedAt: string;
  dispatchedAt?: string;
  enrouteAt?: string;
  onSceneAt?: string;
  clearedAt?: string;
  location: GeoPoint;
  buildingId?: string;
  cleryGeographyClass: CleryGeographyClass;
  cleryReportable: boolean;
  reportedByPersonId?: string;
  involvedPersonIds: string[];
  assignedUnitIds: string[];
  primaryOfficerId?: string;
  evidenceItemIds: string[];
  relatedCameraIds: string[];
  relatedDoorEventIds: string[];
  relatedCampaignIds: string[];
  parentEOCActivationId?: string;
  nibrsOffenseCodes: NIBRSCode[];
  timelyWarningIssued: boolean;
  timelyWarningDecisionId?: string;
  asrLineItemIds: string[];
  narrative?: string;              // classification: restricted-investigation
  classification: Classification;
  threadTag?: ThreadTag;
}

export interface Unit {
  id: string;                      // 'UNIT-101A'
  callSign: string;
  kind: 'patrol' | 'supervisor' | 'detective' | 'k9' | 'bike' | 'cso' | 'fire' | 'ems';
  status: 'available' | 'enroute' | 'on-scene' | 'oos' | 'transport';
  assignedOfficerIds: string[];
  position?: GeoPoint;
  positionAt?: string;
}

export interface Officer {
  id: string;                      // 'OFC-0124'
  fullName: string;
  badgeNumber: string;
  rank: 'officer' | 'sergeant' | 'lieutenant' | 'captain' | 'chief' | 'cso';
  hireDate: string;
  unitId?: string;
  isCitTrained: boolean;
  classification: Classification;
}

export interface RadioTransmission {
  id: string;
  channelId: string;
  unitId?: string;
  at: string;
  durationSec: number;
  classification: Classification;
}

// =========================================================================
// §7 — Investigation & RMS (stub, expanded in later phases)
// =========================================================================

export interface Case {
  id: string;                      // 'CASE-2026-00917'
  rmsCaseNumber: string;
  relatedIncidentIds: string[];
  status: 'open' | 'pending' | 'closed' | 'unfounded' | 'inactive';
  primaryDetectiveOfficerId?: string;
  charges: string[];               // expanded type to follow in §7 full
  classification: Classification;
}

export interface EvidenceItem {
  id: string;                      // 'EVI-2026-0042-001'
  caseId?: string;
  incidentId?: string;
  kind: 'physical' | 'digital' | 'bodycam-clip' | 'dashcam-clip' | 'cctv-clip' | 'document' | 'photograph';
  description: string;
  collectedAt: string;
  collectedByOfficerId: string;
  retentionUntil?: string;
  classification: Classification;
}

// =========================================================================
// §8..§21 — Stubbed (Sections 8–21 land in R1+ as fixtures grow)
// =========================================================================
// §8  Behavioral threat (BITCase, BITEvidenceSource, BITPlanStep, NaBITARiskLevel)
// §9  Title IX, Conduct & Misconduct (TitleIXCase, ConductCase + subtypes,
//     Sanction, ParentalNotificationEvent, MissingStudentReport,
//     BiasIncidentReport, AcademicIntegrityCase, OrganizationalConductRecord)
// §10 Access control & buildings (ACSDoorEvent, BuildingOccupancyEstimate, LockdownState)
// §11 Surveillance (Camera, CameraEvent, VMSAlert)
// §12 Mass notification (NotificationCampaign, NotificationRecipient, AcknowledgeEvent)
// §13 EOC & emergency (EOCActivation, Runbook, SituationLogEntry, AARDraft)
// §14 Transportation (ShuttleVehicle, ShuttleRoute, ParkingPermit, ParkingCitation)
// §15 Facilities/IoT (FirePanelEvent, BMSAlarm, EnvironmentalSensor, BlueLightPhone, GeneratorState)
// §16 Compliance (TimelyWarningDecision, ASRLineItem, CSAReport, FOIARequest)
// §17 Catalog / dataset / lineage (Dataset, Column, Pipeline, PipelineRun, etc.)
// §18 Source registry (Source, SourceProtocol, SourceHealth)
// §19 Insights & AI (Insight, RCAContributor, PredictionAttribution, HubQueryResult, AskResolution)
// §20 Dashboard & conversational (DashboardSpec, Widget, Cohort, CohortChip)
// §21 Governance (Policy, RoleConfig, AccessLogEntry, InformationBarrier, RegulationCoverage)
