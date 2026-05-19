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
// §8 — Domains (the catalog organizational axis)
// =========================================================================

/** Twelve capability domains per spec §3.1. The Data catalog organizes by these. */
export type DomainId =
  | 'dispatch-response'
  | 'investigations-records'
  | 'behavioral-threat'
  | 'title-ix-conduct'
  | 'eoc-emergency'
  | 'mass-notification'
  | 'surveillance-video'
  | 'access-control'
  | 'transportation-mobility'
  | 'facilities-fire-environmental'
  | 'compliance-reporting'
  | 'roster-identity';

export interface Domain {
  id: DomainId;
  name: string;
  description: string;
  iconKey: string;                 // lucide-react icon name; resolved in <DomainIcon/>
  ownerTeam: string;
  healthScore: number;             // 0..100
  freshnessHours: number;          // worst-of among bronze datasets
  isDeep: boolean;                 // demo-anchored vs catalog-completeness
}

// =========================================================================
// §9 — Behavioral Threat (BIT) + Title IX + Conduct (R5 partial; R8 full)
// =========================================================================

/**
 * NaBITA-aligned risk tier. Per spec §4 Module 5A, the BIT process uses a
 * structured-professional-judgment rubric — the AI surfaces a tier with
 * "trending" direction, never a decision; the human review records the final.
 */
export type BITRiskTier = 'mild' | 'moderate' | 'elevated' | 'critical';
export type BITRiskTrend = 'rising' | 'stable' | 'falling';

export type BITCaseStatus =
  | 'intake'
  | 'screening'
  | 'monitoring'
  | 'active-review'
  | 'imminent-threat'
  | 'closed';

/** A BIT case — the multi-source threat-assessment record. */
export interface BITCase {
  id: string;                            // 'BIT-2026-0067'
  subjectPersonId: string;
  status: BITCaseStatus;
  riskTier: BITRiskTier;
  riskTrend: BITRiskTrend;
  /** NaBITA dimensions on a 0–10 scale (subject / target / environment / precipitating). */
  nabita: {
    subject: number;
    target: number;
    environment: number;
    precipitating: number;
  };
  openedAt: string;
  lastReviewedAt: string;
  nextReviewDueAt: string;
  caseLead: string;                      // PersonId of BIT chair / case manager
  teamMemberIds: string[];               // BIT team — multidisciplinary
  /** Cross-references (none required to exist). */
  linkedIncidentIds: string[];
  linkedConductCaseIds: string[];
  linkedTitleIxCaseId?: string;
  linkedNoContactOrderIds: string[];
  /** Source signal summary — used to render the contributors feed. */
  contributorCounts: {
    tips: number;
    accessAnomalies: number;
    cameraAnalytics: number;
    incidents: number;
    conduct: number;
    other: number;
  };
  /** A short ‘imminent-threat finding’ flag set by the case lead. */
  imminentThreatFinding: boolean;
  /** Two-sentence narrative summary visible in case lists. */
  narrative: string;
  classification: Classification;
  threadTag?: ThreadTag;
}

/** Evidence record — every signal attached to a BIT case. */
export type BITEvidenceKind =
  | 'tip'
  | 'incident'
  | 'access-anomaly'
  | 'camera-analytic'
  | 'conduct-case'
  | 'lms-engagement'
  | 'roommate-report'
  | 'social-media'
  | 'observation';

export interface BITEvidence {
  id: string;
  caseId: string;
  kind: BITEvidenceKind;
  /** Optional FK back to the originating record. */
  sourceRefId?: string;
  /** Optional dataset that this evidence drew from (for the citation chip). */
  evidenceDatasetId?: string;
  /** ISO timestamp of the underlying signal (not the record). */
  observedAt: string;
  /** Two-line narrative — first line is the headline, second the evidence. */
  summary: string;
  weight: number;                        // 0..100 — heuristic contribution to risk
  classification: Classification;
}

/** A BIT support plan — actions the team committed to. */
export type BITPlanActionKind =
  | 'welfare-check'
  | 'no-contact-issuance'
  | 'parental-notification'
  | 'counseling-referral'
  | 'housing-relocation'
  | 'academic-accommodation'
  | 'safety-plan-coordination'
  | 'law-enforcement-notification'
  | 'follow-up-meeting';

export interface BITPlanAction {
  id: string;
  caseId: string;
  kind: BITPlanActionKind;
  ownerRole: RoleId;
  ownerPersonId?: string;
  dueAt: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  notes: string;
  classification: Classification;
}

// ----- Anonymous tips + LiveSafe -------------------------------------------

export type TipChannel = 'phone' | 'web' | 'livesafe-app' | 'walk-in' | 'email' | 'sms';

export type TipDisposition =
  | 'open'
  | 'under-review'
  | 'routed-to-bit'
  | 'routed-to-tix'
  | 'routed-to-pd'
  | 'routed-to-dean'
  | 'closed-no-action';

export interface AnonymousTip {
  id: string;                            // 'TIP-2026-0142'
  channel: TipChannel;
  receivedAt: string;
  /** What/who the tip is about (free text, AI-extracted entities tracked separately). */
  subjectFreeText: string;
  /** Resolved subject person ID if identity-resolution found a match. */
  matchedPersonId?: string;
  /** AI-extracted topic tags. */
  topics: ('substance' | 'self-harm' | 'threat' | 'harassment' | 'theft' | 'weapons' | 'other')[];
  /** Reporter-supplied anonymity preference. */
  anonymous: boolean;
  /** Reporter device hint (used by identity-resolution). */
  deviceId?: string;
  buildingId?: string;
  body: string;                          // tip narrative (PII handled below)
  disposition: TipDisposition;
  routedTo?: 'bit' | 'tix' | 'pd' | 'dean';
  routedAt?: string;
  classification: Classification;
  threadTag?: ThreadTag;
}

/** LiveSafe-style two-way conversation — a tip can spawn one. */
export interface LiveSafeChat {
  id: string;
  tipId?: string;
  startedAt: string;
  participantRole: 'reporter' | 'dispatcher' | 'bit-intake';
  /** Each line is a short turn — the modal shows them as a stream. */
  turns: { role: 'reporter' | 'operator'; at: string; text: string }[];
  classification: Classification;
  threadTag?: ThreadTag;
}

// ----- Title IX (walled) ---------------------------------------------------

export type TitleIXPhase =
  | 'informal-intake'
  | 'supportive-measures'
  | 'formal-complaint'
  | 'investigation'
  | 'hearing'
  | 'determination'
  | 'closed';

export interface TitleIXCase {
  id: string;                            // 'TIX-2026-0014'
  complainantPersonId: string;
  respondentPersonId: string;
  phase: TitleIXPhase;
  /** Statutory clock — typically 60 business days from formal complaint to determination. */
  openedAt: string;
  formalComplaintAt?: string;
  determinationDueAt?: string;
  /** Supportive measures currently in place. */
  supportiveMeasures: ('no-contact-directive' | 'class-schedule-adjust' | 'housing-relocation' | 'academic-accommodation' | 'counseling-referral' | 'safety-escort')[];
  /** One-line headline visible only to Title IX role. */
  headline: string;
  /** Two-paragraph narrative — Title IX role only. */
  narrative: string;
  classification: Classification;         // always 'title-ix-sensitive'
  threadTag?: ThreadTag;
}

// ----- Conduct (substance + residential subtypes for R5; full set in R8) ---

export type ConductSubtype =
  | 'substance'
  | 'residential'
  | 'academic-integrity'
  | 'sexual-misconduct'
  | 'physical-altercation'
  | 'bias-incident'
  | 'organizational'
  | 'other';

export type ConductStatus =
  | 'reported'
  | 'investigation'
  | 'pre-hearing'
  | 'hearing'
  | 'sanction-pending'
  | 'sanction-active'
  | 'closed'
  | 'closed-amnesty';

export interface ConductCase {
  id: string;                            // 'COND-2025-01882'
  subjectPersonId: string;
  subtype: ConductSubtype;
  status: ConductStatus;
  openedAt: string;
  closedAt?: string;
  reportedFromIncidentId?: string;
  buildingId?: string;
  /** Was Medical Amnesty invoked under spec §2 Module 5A? */
  medicalAmnestyInvoked?: boolean;
  /** Was parental notification considered (FERPA §99.31(a)(15))? */
  parentalNotificationConsidered?: boolean;
  /** Two-line summary — first line is the violation, second the disposition. */
  summary: string;
  /** Aggregator: total sanction count. */
  sanctionCount: number;
  classification: Classification;
  threadTag?: ThreadTag;
}

export type SanctionKind =
  | 'warning'
  | 'probation'
  | 'edu-program'
  | 'community-service'
  | 'restitution'
  | 'housing-suspension'
  | 'suspension'
  | 'expulsion';

export type SanctionStatus = 'pending' | 'active' | 'completed' | 'overdue' | 'lifted';

export interface Sanction {
  id: string;                            // 'SNC-2026-00417-A'
  conductCaseId: string;
  kind: SanctionKind;
  status: SanctionStatus;
  issuedAt: string;
  dueAt?: string;
  completedAt?: string;
  /** Optional reference to an Educational Program ID. */
  eduProgramId?: string;
  description: string;
  classification: Classification;
}

/** Educational program — e.g. AlcoholEdu, Project Northland module, etc. */
export interface EduProgram {
  id: string;                            // 'EDU-PROG-ALCEDU'
  name: string;
  provider: string;
  durationHours: number;
  targetSubtype: ConductSubtype;
  description: string;
}

/** FERPA §99.31(a)(15) parental-notification audit entry. */
export type ParentalNotifTrigger =
  | 'alcohol-violation'
  | 'drug-violation'
  | 'safety-concern'
  | 'self-harm-concern';

export interface ParentalNotification {
  id: string;                            // 'PNT-2026-00031'
  subjectPersonId: string;
  conductCaseId?: string;
  bitCaseId?: string;
  trigger: ParentalNotifTrigger;
  /** FERPA §99.31(a)(15) test — only available when subject is under 21 for alcohol/drug. */
  ferpaBasis: '99.31(a)(15)-alcohol-drug-under-21' | '99.31(a)(10)-health-safety-emergency';
  decidedAt: string;
  decidedByPersonId: string;
  decision: 'notified' | 'declined' | 'pending-decision';
  rationale: string;
  classification: Classification;        // ferpa-edu-record
}

// ----- §9 R8 additions: Module 5B full conduct surface -------------------

/** Per-case violation charges — one conduct case can carry many charges. */
export interface ConductCharge {
  id: string;                            // 'CHG-2026-...'
  conductCaseId: string;
  code: string;                          // institutional violation code, e.g. 'R-3.2.1'
  label: string;                         // human description
  /** Was this charge sustained at hearing? */
  sustained: boolean | null;             // null = pre-hearing
  sustainingPersonId?: string;
  /** FERPA / Title IX cross-references for the charge. */
  regulatoryHooks: RegulationId[];
  classification: Classification;
}

/** Missing-student protocol (per Clery / HEOA §485(j)). */
export type MissingStudentStatus =
  | 'reported'
  | 'verification-in-progress'
  | 'protocol-active'
  | 'recovered'
  | 'closed-other';

export interface MissingStudentReport {
  id: string;                            // 'MSR-2026-...'
  subjectPersonId: string;
  reportedAt: string;
  status: MissingStudentStatus;
  reporterRole: 'roommate' | 'faculty' | 'family' | 'staff' | 'self' | 'other';
  /** Hours from reportedAt to the 24-hour HEOA-required parental notification trigger. */
  hoursOverdue: number;
  /** When the 24-hour notification was issued (if applicable). */
  parentalNotifiedAt?: string;
  lastSeenBuildingId?: string;
  /** Free-text narrative — sanitized. */
  narrative: string;
  classification: Classification;
}

/** Bias / hate-related incident records (BART workflow). */
export type BiasIncidentStatus = 'reported' | 'reviewed' | 'referred-pd' | 'no-action' | 'closed';

export interface BiasIncident {
  id: string;                            // 'BIA-2026-...'
  reportedAt: string;
  subjectPersonId?: string;
  /** What protected category the incident is alleged to target. */
  biasCategory: HateCrimeBias;
  /** Did the criminal hate-crime threshold appear met? */
  hateCrimeThresholdMet: boolean;
  status: BiasIncidentStatus;
  buildingId?: string;
  /** One-line summary. */
  summary: string;
  /** Cross-reference to a PD incident (if elevated). */
  linkedIncidentId?: string;
  classification: Classification;
}

/** Organizational (Greek chapter / athletic team) conduct cases. */
export type OrganizationKind = 'fraternity' | 'sorority' | 'athletic-team' | 'cultural-org' | 'club';
export type OrgConductStatus = 'reported' | 'investigation' | 'sanction-pending' | 'sanction-active' | 'derecognized' | 'closed';

export interface OrganizationalConductCase {
  id: string;                            // 'ORG-2026-...'
  organizationName: string;
  organizationKind: OrganizationKind;
  chapterSize: number;
  status: OrgConductStatus;
  openedAt: string;
  closedAt?: string;
  /** Whether the Stop Campus Hazing reporting threshold appears met. */
  hazingActReportable: boolean;
  /** Whether the case was referred to the published roster of violators (state laws). */
  publishedToRoster: boolean;
  summary: string;
  /** Number of individual members charged. */
  individualMemberChargedCount: number;
  classification: Classification;
}

/** CIT (Crisis Intervention Team) dispatch-flag annotation. */
export type CITFlagKind = 'wellness-check' | 'mental-health-crisis' | 'suicidal-ideation' | 'overdose' | 'self-harm';

export interface CITDispatchFlag {
  id: string;                            // 'CIT-FLG-2026-...'
  incidentId: string;
  flaggedAt: string;
  kind: CITFlagKind;
  /** Optional CIT-trained officer dispatched. */
  citOfficerId?: string;
  /** Whether outcome was a transport-to-treatment vs. arrest. */
  outcome: 'transport-to-treatment' | 'voluntary-services' | 'no-action' | 'arrest' | 'pending';
  /** Whether a 42 CFR Part 2 wall barrier hit fired during the dispatch. */
  cfr42HitOccurred: boolean;
  classification: Classification;
}

/** Academic-integrity cases (faculty-side; tracked separately). */
export type AcademicIntegrityKind = 'plagiarism' | 'unauthorized-collaboration' | 'fabrication' | 'cheating' | 'gen-ai-misuse' | 'tampering';
export type AcademicIntegrityStatus = 'reported' | 'faculty-resolution' | 'standards-review' | 'sanction-active' | 'closed';

export interface AcademicIntegrityCase {
  id: string;                            // 'AIC-2026-...'
  subjectPersonId: string;
  facultyPersonId: string;
  courseCode: string;
  kind: AcademicIntegrityKind;
  status: AcademicIntegrityStatus;
  reportedAt: string;
  /** Faculty-level resolution outcome (warning, course penalty). */
  facultyResolution?: string;
  /** Did the case escalate to the Office of Student Conduct? */
  escalatedToConduct: boolean;
  classification: Classification;
}

// =========================================================================
// §10 — Access Control & Buildings
// =========================================================================

export type ACSEventKind = 'granted' | 'denied' | 'rex' | 'forced' | 'propped' | 'actuator';

export interface Door {
  id: string;                          // 'DOR-CARTER-MAIN-S'
  buildingId: string;
  name: string;                        // human label (e.g. "Carter Main South")
  location: GeoPoint;
  kind: 'main-entrance' | 'side' | 'rear' | 'interior' | 'restricted' | 'service' | 'ada';
  isAdaActuator: boolean;
  postedHours?: string;                // narrative, e.g. "07:00–23:00"
  controlledByAcs: boolean;
  description?: string;
}

export interface ACSDoorEvent {
  id: string;                          // 'ACS-...'
  doorId: string;
  buildingId: string;
  personId?: string;                   // resolved Person Master ID (null for visitor / unknown)
  cardholderToken: string;             // OneCard ID (pii-classified)
  kind: ACSEventKind;
  at: string;
  isAfterHours: boolean;
  isUnusualBuilding: boolean;          // cardholder rarely accesses this building
  isAntiPassback: boolean;
  classification: Classification;
}

export interface BuildingOccupancyEstimate {
  buildingId: string;
  asOf: string;                        // ISO
  estimated: number;
  capacity: number;
  /** Stack of contributing factors (for the tooltip on the home-page hero). */
  contributors: { source: string; weight: number }[];
}

export interface LockdownState {
  id: string;
  buildingId: string;
  status: 'active' | 'staged' | 'released';
  initiatedAt: string;
  releasedAt?: string;
  initiatedByPersonId?: string;
  reason: string;
  triggeredByActivationId?: string;    // EOC activation
}

// =========================================================================
// §11 — Surveillance (Cameras + VMS events)
// =========================================================================

export type CameraKind = 'fixed' | 'ptz' | 'dome' | 'doorbell' | 'thermal' | 'lpr';

export interface Camera {
  id: string;                          // 'CAM-CARTER-N3'
  name: string;
  buildingId?: string;                 // null for exterior / public-property cameras
  location: GeoPoint;
  azimuthDeg: number;                  // direction the camera faces
  fovDeg: number;                      // field-of-view cone width
  kind: CameraKind;
  vendor: string;                      // 'Milestone', 'Verkada', 'Avigilon'
  hasAnalytics: boolean;
  isOnline: boolean;
  lastSeenAt: string;
  classification: Classification;
}

export type AnalyticsKind =
  | 'motion'
  | 'loitering'
  | 'person'
  | 'vehicle'
  | 'line-crossing'
  | 'package-left'
  | 'crowd';

export interface CameraEvent {
  id: string;                          // 'VEV-...'
  cameraId: string;
  buildingId?: string;
  analyticKind: AnalyticsKind;
  confidence: number;                  // 0..1
  at: string;
  durationSec: number;
  classification: Classification;
  threadTag?: ThreadTag;
}

export interface BlueLight {
  id: string;                          // 'BLU-QUAD-7'
  name: string;
  buildingId?: string;
  location: GeoPoint;
  isOnline: boolean;
  lastHeartbeatAt: string;
  isActiveCall: boolean;
}

// =========================================================================
// §12 — Mass Notification (R6)
// =========================================================================

export type NotifChannel = 'sms' | 'voice' | 'email' | 'push' | 'desktop-alert' | 'digital-sign' | 'siren';

export type NotifAudience =
  | 'campus-all'
  | 'students-all'
  | 'employees-all'
  | 'building-residents'
  | 'building-occupants'
  | 'beat-area'
  | 'opt-in-emergency'
  | 'shuttle-riders';

export type NotifCampaignStatus =
  | 'draft'
  | 'review'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'paused'
  | 'cancelled';

export interface NotifChannelDelivery {
  channel: NotifChannel;
  attempted: number;
  delivered: number;
  failed: number;
  /** Seconds between queue and delivery confirmation (P50/P95). */
  latencyP50Sec: number;
  latencyP95Sec: number;
}

export interface NotificationCampaign {
  id: string;                            // 'MNP-2026-088'
  name: string;
  status: NotifCampaignStatus;
  /** Free text — the alert content (subject + body collapsed). */
  message: string;
  audiences: NotifAudience[];
  /** Buildings included when audience is building-* or beat-*. */
  buildingIds: string[];
  channels: NotifChannel[];
  /** Per-channel delivery rollup. */
  delivery: NotifChannelDelivery[];
  createdAt: string;
  /** Set when transitioning from queued → sending. */
  sentAt?: string;
  /** Optional EOC activation that triggered this campaign. */
  triggeredByActivationId?: string;
  /** Sender role. */
  authoredByRole: RoleId;
  classification: Classification;
  threadTag?: ThreadTag;
}

// =========================================================================
// §13 — EOC & emergency (R6)
// =========================================================================

export type EOCActivationLevel = 'monitoring' | 'partial' | 'full' | 'after-action';

export type EOCActivationStatus = 'active' | 'closed';

export type EOCIncidentKind =
  | 'tornado'
  | 'severe-weather'
  | 'active-threat'
  | 'fire'
  | 'hazmat'
  | 'utility-outage'
  | 'medical-mass-casualty'
  | 'civil-unrest'
  | 'drill';

/** ICS Form 207 (positions) row — who's filling which seat. */
export type ICSPosition =
  | 'incident-commander'
  | 'public-information-officer'
  | 'safety-officer'
  | 'liaison-officer'
  | 'operations-section-chief'
  | 'planning-section-chief'
  | 'logistics-section-chief'
  | 'finance-section-chief';

export interface ICSAssignment {
  position: ICSPosition;
  /** Resolved Person Master ID; undefined → seat unfilled. */
  personId?: string;
  assignedAt: string;
  /** UI hint — render an "Unfilled" pill. */
  isUnfilled?: boolean;
}

export interface EOCActivation {
  id: string;                            // 'EOC-2026-013'
  name: string;                          // 'Tornado Warning — central campus'
  level: EOCActivationLevel;
  status: EOCActivationStatus;
  kind: EOCIncidentKind;
  triggeredByAlertId?: string;
  openedAt: string;
  closedAt?: string;
  /** Buildings the activation spans (shelter-in-place, evacuation). */
  buildingIds: string[];
  /** Campaign IDs sent under this activation. */
  campaignIds: string[];
  /** Lockdown IDs initiated. */
  lockdownIds: string[];
  /** Runbooks queued or executed. */
  runbookExecutionIds: string[];
  /** ICS 207 seats. */
  ics: ICSAssignment[];
  /** Brief narrative — opens the COP card. */
  narrative: string;
  classification: Classification;
  threadTag?: ThreadTag;
}

/** Situation Log entry — chronological factual log. */
export type SitLogEntryKind =
  | 'alert-received'
  | 'activation-opened'
  | 'campaign-sent'
  | 'lockdown-initiated'
  | 'lockdown-released'
  | 'runbook-started'
  | 'runbook-step-completed'
  | 'iot-anomaly'
  | 'unit-assigned'
  | 'general-observation'
  | 'decision'
  | 'activation-closed';

export interface SitLogEntry {
  id: string;
  activationId: string;
  at: string;
  kind: SitLogEntryKind;
  text: string;
  authorRole?: RoleId;
  /** Cross-reference IDs the entry mentions. */
  references?: string[];
  classification: Classification;
}

/** Decision Log entry — formal decisions w/ rationale (FEMA / Stafford Act audit trail). */
export interface DecisionLogEntry {
  id: string;
  activationId: string;
  at: string;
  decision: string;                      // headline
  rationale: string;
  authorRole: RoleId;
  authorPersonId?: string;
  alternativesConsidered?: string[];
  classification: Classification;
}

/** Weather alert (NWS feed). */
export type WeatherAlertKind =
  | 'tornado-warning'
  | 'tornado-watch'
  | 'severe-thunderstorm'
  | 'flash-flood'
  | 'winter-storm'
  | 'heat-advisory'
  | 'wind-advisory';

export interface WeatherAlert {
  id: string;                            // 'NWS-TOR-2026-IA-001'
  kind: WeatherAlertKind;
  headline: string;
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
  certainty: 'observed' | 'likely' | 'possible';
  issuedAt: string;
  expiresAt: string;
  /** Counties / zones in the affected polygon. */
  affectedZones: string[];
  /** Whether the campus polygon intersects the affected zones. */
  campusInPolygon: boolean;
  source: 'NWS' | 'NOAA' | 'state-emergency';
  raw: string;                           // CAP message excerpt
  classification: Classification;
  threadTag?: ThreadTag;
}

/** Runbook — a pre-approved sequence of steps. */
export type RunbookCategory =
  | 'severe-weather'
  | 'active-threat'
  | 'fire-evacuation'
  | 'hazmat'
  | 'cyber-incident'
  | 'mass-medical'
  | 'civil-unrest'
  | 'utility-outage';

export type RunbookStepKind =
  | 'notify'           // dispatch a notification campaign
  | 'lockdown'         // ACS lockdown initiation
  | 'unlock'
  | 'dispatch-unit'
  | 'page-team'
  | 'open-bridge-line'
  | 'reroute-transit'
  | 'isolate-utility'
  | 'manual-check';

export interface RunbookStep {
  id: string;
  order: number;
  kind: RunbookStepKind;
  title: string;
  description: string;
  /** ETA in seconds from runbook start. */
  etaSec: number;
  /** Whether this step can be auto-executed by the platform (vs human-only). */
  automatable: boolean;
}

export interface Runbook {
  id: string;                            // 'RBK-TORNADO-SHELTER-CENTRAL'
  name: string;
  category: RunbookCategory;
  description: string;
  ownerRole: RoleId;
  steps: RunbookStep[];
  /** Last time this runbook was reviewed for currency. */
  lastReviewedAt: string;
}

export type RunbookExecutionStatus =
  | 'queued'
  | 'in-progress'
  | 'paused'
  | 'completed'
  | 'aborted';

export type RunbookStepStatus = 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';

export interface RunbookStepExecution {
  stepId: string;
  status: RunbookStepStatus;
  startedAt?: string;
  completedAt?: string;
  resultNote?: string;
}

export interface RunbookExecution {
  id: string;                            // 'RBX-2026-0042'
  runbookId: string;
  activationId?: string;
  startedAt: string;
  status: RunbookExecutionStatus;
  steps: RunbookStepExecution[];
  classification: Classification;
  threadTag?: ThreadTag;
}

// =========================================================================
// §14 — Transportation (R6 partial — routes + GPS)
// =========================================================================

export type ShuttleRouteStatus = 'normal' | 'detour' | 'suspended';

export interface ShuttleRoute {
  id: string;                            // 'RTE-WEST-LOOP'
  name: string;
  status: ShuttleRouteStatus;
  /** Ordered list of stop IDs (textual — full geometry deferred to R8). */
  stops: string[];
  /** Color hex for map rendering. */
  color: string;
  /** Coarse polyline points for the campus map. */
  polyline: GeoPoint[];
  /** Active vehicles assigned. */
  activeVehicleCount: number;
  /** Free text — note shown to riders during detour/suspension. */
  riderNote?: string;
}

export interface TransitGPSPing {
  id: string;
  routeId: string;
  vehicleId: string;
  at: string;
  location: GeoPoint;
  speedMph: number;
  headingDeg: number;
  /** Whether the vehicle is on its expected route segment. */
  onRoute: boolean;
}

// =========================================================================
// §15 — Facilities / IoT (R6)
// =========================================================================

export type FirePanelEventKind =
  | 'pre-alarm'
  | 'alarm'
  | 'trouble'
  | 'supervisory'
  | 'normal'
  | 'test';

export interface FirePanelEvent {
  id: string;                            // 'FPE-2026-...'
  buildingId: string;
  panelId: string;
  deviceLabel: string;                   // 'Pull-station 3W' or 'Smoke 4-C-12'
  kind: FirePanelEventKind;
  at: string;
  acknowledgedAt?: string;
  classification: Classification;
}

export type BMSAlarmKind =
  | 'temp-high'
  | 'temp-low'
  | 'humidity-high'
  | 'water-leak'
  | 'door-prop'
  | 'generator-start'
  | 'generator-fail'
  | 'ups-on-battery'
  | 'hvac-fault'
  | 'elevator-stuck';

export type BMSAlarmSeverity = 'critical' | 'major' | 'minor' | 'info';

export interface BMSAlarm {
  id: string;                            // 'BMS-2026-...'
  buildingId: string;
  systemTag: string;                     // 'WW4-GEN-01' (generator) / 'AHU-3' / etc.
  kind: BMSAlarmKind;
  severity: BMSAlarmSeverity;
  at: string;
  acknowledgedAt?: string;
  clearedAt?: string;
  detail: string;
  classification: Classification;
  threadTag?: ThreadTag;
}

export type GeneratorMode = 'normal' | 'test' | 'on-battery' | 'on-generator' | 'failed';

export interface GeneratorState {
  id: string;                            // 'GEN-WW4-01'
  buildingId: string;
  mode: GeneratorMode;
  fuelLevelPct: number;                  // 0..100
  /** Hours of runtime since last reset. */
  runtimeHours: number;
  lastTestAt: string;
  /** ISO timestamp of last mode change. */
  modeChangedAt: string;
  /** Optional last failure summary. */
  lastFaultDetail?: string;
  classification: Classification;
}

export type EnvSensorKind = 'temp' | 'humidity' | 'co2' | 'water-level' | 'pressure' | 'wind';

export interface EnvSensorReading {
  id: string;
  buildingId?: string;
  sensorTag: string;
  kind: EnvSensorKind;
  at: string;
  value: number;
  unit: string;
  thresholdLow?: number;
  thresholdHigh?: number;
  isAnomalous: boolean;
}

// =========================================================================
// §16 — Compliance (Clery + CSA + Timely Warning + NIBRS + FOIA) (R7)
// =========================================================================

/**
 * Clery-mandatory crime categories. Per the Clery Handbook (Sep 2024),
 * the ASR Table reports counts across these crime + geography combinations.
 *
 * Order matters: criminal offenses → VAWA additions → arrests → referrals.
 * Hate-crime bias categories are tracked separately on the incident.
 */
export type CleryCrimeCategory =
  // Part I criminal offenses
  | 'murder-nonneg-manslaughter'
  | 'negligent-manslaughter'
  | 'sex-offense-rape'
  | 'sex-offense-fondling'
  | 'sex-offense-incest'
  | 'sex-offense-statutory'
  | 'robbery'
  | 'aggravated-assault'
  | 'burglary'
  | 'motor-vehicle-theft'
  | 'arson'
  // VAWA additions (2013 reauthorization)
  | 'domestic-violence'
  | 'dating-violence'
  | 'stalking'
  // Arrests
  | 'arrest-weapons'
  | 'arrest-drug-abuse'
  | 'arrest-liquor'
  // Disciplinary referrals
  | 'referral-weapons'
  | 'referral-drug-abuse'
  | 'referral-liquor';

/** Hate-crime bias categories — per the Clery Handbook. */
export type HateCrimeBias =
  | 'race'
  | 'religion'
  | 'sexual-orientation'
  | 'gender'
  | 'gender-identity'
  | 'disability'
  | 'ethnicity'
  | 'national-origin';

// ----- Clery geography (polygon set + audit) ------------------------------

export type CleryPolygonChangeKind = 'added' | 'removed' | 'modified' | 'reclassified';

export interface CleryPolygonAuditEntry {
  id: string;
  at: string;
  authorPersonId: string;
  changeKind: CleryPolygonChangeKind;
  polygonId: string;
  notes: string;
}

export interface CleryPolygon {
  id: string;
  name: string;
  cleryClass: CleryGeographyClass;
  geometry: GeoPolygon;
  effectiveFrom: string;
  effectiveTo?: string;
  /** Optional building this polygon corresponds to (one-to-many). */
  buildingId?: string;
}

export interface CleryPolygonSet {
  id: string;                       // 'CGP-MAIN-CAMPUS-2025'
  name: string;
  reportingYear: number;
  polygons: CleryPolygon[];
  audit: CleryPolygonAuditEntry[];
  certifiedAt?: string;
  certifiedByPersonId?: string;
  classification: Classification;
}

// ----- ASR workspace -------------------------------------------------------

export type ASRCellStatus = 'open' | 'awaiting-review' | 'reviewed' | 'submitted';

export interface ASRWorkspaceRow {
  id: string;                       // 'ASR-2025-RESHALL-SEXOFF'
  reportingYear: number;
  crime: CleryCrimeCategory;
  geography: CleryGeographyClass;
  /** Count of qualifying incidents. */
  count: number;
  /** Source incident IDs the count was drawn from. */
  sourceIncidentIds: string[];
  /** Whether this cell requires manual review (geography or classification ambiguity). */
  needsReview: boolean;
  reviewNote?: string;
  status: ASRCellStatus;
  /** Bronze dataset refs for the source-to-line lineage trace. */
  bronzeRefIds: string[];
  lastReviewedByPersonId?: string;
  lastReviewedAt?: string;
  classification: Classification;
  threadTag?: ThreadTag;
}

// ----- CSA (Campus Security Authority) reports -----------------------------

export type CSAReportSource = 'training-acknowledgment' | 'incident-disclosure' | 'annual-attestation';

export interface CSAReport {
  id: string;                       // 'CSA-2026-...'
  reportedByPersonId: string;
  reportedAt: string;
  source: CSAReportSource;
  summary: string;
  asrInclusion: boolean;
  asrLineItemId?: string;
  classification: Classification;
}

// ----- Timely Warning ledger -----------------------------------------------

export type TimelyWarningDecision = 'issued' | 'declined' | 'pending';

export interface TimelyWarning {
  id: string;                       // 'TWR-2025-0029'
  triggeringIncidentId: string;
  reportingYear: number;
  decision: TimelyWarningDecision;
  decidedAt: string;
  decidedByRole: RoleId;
  /** Time from incident receipt to warning issuance (minutes). */
  minutesToIssue?: number;
  /** Was the offense VAWA-eligible? */
  vawaEligible: boolean;
  /** Continuing-threat assessment narrative — the §99.32(c) reason. */
  continuingThreatAssessment: string;
  /** Optional linked notification campaign. */
  linkedCampaignId?: string;
  classification: Classification;
  threadTag?: ThreadTag;
}

// ----- NIBRS submissions ---------------------------------------------------

export type NIBRSStatus = 'in-progress' | 'submitted' | 'accepted' | 'rejected' | 'resubmitted';

export interface NIBRSSubmission {
  id: string;                       // 'NIBRS-2026-Q1'
  reportingPeriod: string;          // 'Q1-2026', '04-2026', etc.
  status: NIBRSStatus;
  submittedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  recordCount: number;
  errorCount: number;
  rejectionNote?: string;
  classification: Classification;
}

// ----- FOIA requests + AI-assisted redaction -------------------------------

export type FOIAStatus =
  | 'received'
  | 'in-review'
  | 'ai-redaction-draft'
  | 'attorney-review'
  | 'ready-for-release'
  | 'released'
  | 'denied'
  | 'closed';

export type FOIARequesterAffiliation =
  | 'student'
  | 'public'
  | 'press'
  | 'attorney'
  | 'researcher'
  | 'government';

/** Per-classification + per-field masking counts in the AI redaction preview. */
export interface FOIARedactionPreview {
  recordCount: number;
  /** Total field-level masks proposed. */
  totalMasks: number;
  /** Breakdown by classification of the source values masked. */
  maskedByClassification: Partial<Record<Classification, number>>;
  /** Breakdown by field name (e.g. 'narrative', 'caller_phone'). */
  maskedByField: Record<string, number>;
  /** Sample redacted excerpt rendered in the preview pane. */
  sampleExcerpt: string;
  /** Confidence score for the redaction (0..100). */
  aiConfidence: number;
  /** Items flagged for attorney review (low confidence or sensitive). */
  attorneyReviewItems: string[];
}

export interface FOIARequest {
  id: string;                       // 'FOIA-2026-077'
  requesterName: string;
  requesterAffiliation: FOIARequesterAffiliation;
  receivedAt: string;
  /** Statutory due date — typically 20 business days from receipt. */
  dueAt: string;
  status: FOIAStatus;
  /** Free-text description of the request. */
  request: string;
  /** Scope — what records are responsive. */
  scope: {
    incidentIds: string[];
    dateRangeStart?: string;
    dateRangeEnd?: string;
    crimeCategories?: CleryCrimeCategory[];
    description?: string;
  };
  redactionPreview?: FOIARedactionPreview;
  classification: Classification;
  threadTag?: ThreadTag;
}

// =========================================================================
// §17 — Catalog / dataset / lineage / pipeline
// =========================================================================

export type ColumnType =
  | 'string' | 'integer' | 'bigint' | 'numeric' | 'boolean' | 'date'
  | 'timestamp' | 'json' | 'geometry' | 'array' | 'enum';

export interface Column {
  name: string;
  type: ColumnType;
  description: string;
  classification: Classification;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;             // 'mart.person_360.person_id'
}

/** Six-dimension data-quality breakdown — per cell of a Quality Console. */
export interface QualityDimensions {
  accuracy: number;                // 0..100
  completeness: number;
  consistency: number;
  timeliness: number;
  uniqueness: number;
  validity: number;
}

export interface QualityScoreDetail {
  composite: number;               // weighted mean of dimensions
  dimensions: QualityDimensions;
  /** Last 7 composite scores for sparkline (most-recent last). */
  trend7d: number[];
}

export type RefreshCadence =
  | 'streaming (sub-second)'
  | 'streaming (~5s lag)'
  | 'streaming (~30s lag)'
  | '1-min micro-batch'
  | '5-min micro-batch'
  | '15-min micro-batch'
  | 'hourly'
  | 'daily 03:00 UTC'
  | 'nightly'
  | 'weekly'
  | 'on-event'
  | 'on-demand';

/** Federal/state/institutional regulations a dataset is evidence for. */
export type RegulationId =
  | 'REG-CLERY'
  | 'REG-TITLE-IX'
  | 'REG-FERPA'
  | 'REG-CJIS'
  | 'REG-VAWA'
  | 'REG-NIBRS'
  | 'REG-28-CFR-23'
  | 'REG-42-CFR-2'
  | 'REG-ADA'
  | 'REG-STATE-FOIA'
  | 'REG-STATE-PRIVACY'
  | 'REG-STOP-CAMPUS-HAZING'
  | 'REG-DFSCA'
  | 'REG-CLERY-MSNP'
  | 'REG-FERPA-99-31'
  | 'REG-SOC2'
  | 'REG-ISO27001'
  | 'REG-NIST-800-53';

export interface Dataset {
  id: string;                      // e.g. 'cad.events_raw'
  name: string;                    // human label
  description: string;
  domainId: DomainId;
  layer: MedallionLayer;
  owner: string;                   // owning team
  steward: string;                 // person/role
  source?: string;                 // source-system pointer (Bronze only typically)
  sourceId?: string;               // FK to Source registry (Bronze)
  rowCount: number;
  sizeGb: number;
  lastUpdated: string;             // ISO
  refreshCadence: RefreshCadence;
  schema: Column[];
  sampleRows: Record<string, unknown>[];
  upstream: string[];              // dataset IDs
  downstream: string[];            // dataset IDs
  qualityScore: number;            // 0..100 composite
  qualityScoreDetail?: QualityScoreDetail;
  classification: Classification;  // most sensitive column tier
  regulatoryHooks: RegulationId[];
  tags: string[];
  threadTag?: ThreadTag;
}

export interface LineageEdge {
  from: string;                    // dataset ID
  to: string;                      // dataset ID
  kind: 'upstream-of' | 'derived-from';
}

/** A pipeline transform step — typed for the pipeline-run state machine. */
export type TransformStepKind =
  | 'validate-schema'
  | 'parse'
  | 'hash-identifiers'
  | 'cast-timestamps'
  | 'geocode'
  | 'classify-clery-geography'
  | 'classify-nibrs'
  | 'enrich'
  | 'deduplicate'
  | 'entity-resolution'
  | 'normalize'
  | 'aggregate'
  | 'join'
  | 'filter'
  | 'quality-gate'
  | 'land';

export interface TransformStep {
  id: string;
  kind: TransformStepKind;
  description: string;
  /** Optional per-step row-counts shown by the live-run simulator. */
  rowsIn?: number;
  rowsOut?: number;
  durationMs?: number;
}

export interface QualityRule {
  id: string;
  description: string;
  dimension: keyof QualityDimensions;
  severity: Severity;
  /** True if this rule passed in the most-recent run. */
  passed: boolean;
  /** Last 7 outcomes (most-recent last). */
  trend7d: boolean[];
  affectedRows?: number;
  thresholdDescription?: string;
}

export interface QualityGateResult {
  status: 'pass' | 'fail' | 'warn' | 'pending';
  passedCount: number;
  failedCount: number;
  warnCount: number;
  rules: QualityRule[];
}

export type PipelineEngine =
  | 'glue'
  | 'spark'
  | 'flink'
  | 'kinesis-firehose'
  | 'lambda'
  | 'step-functions'
  | 'dbt-snowflake'
  | 'databricks'
  | 'mwaa-airflow'
  | 'mllp-listener'
  | 'webhook-handler';

export type PipelineStatus =
  | 'success'
  | 'failed'
  | 'running'
  | 'scheduled'
  | 'blocked'
  | 'delayed';

export interface HistoricalRun {
  startedAt: string;
  durationMs: number;
  status: PipelineStatus;
}

export interface PipelineSlo {
  successRate30d: number;          // 0..1
  successRateTarget: number;       // 0..1
  p95DurationMsActual: number;
  p95DurationMsTarget: number;
  freshnessHitRate30d: number;     // 0..1
  mttdMinutes: number;             // mean time to detect
  mttrMinutes: number;             // mean time to repair
  failureCount30d: number;
}

export interface PipelineRun {
  id: string;                      // e.g. 'bronze-cad-events'
  name: string;
  description: string;
  domainId: DomainId;
  fromLayer: MedallionLayer | null;
  toLayer: MedallionLayer;
  engine: PipelineEngine;
  status: PipelineStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  rowsIn: number;
  rowsOut: number;
  rowsRejected: number;
  blockedByDatasetId?: string;     // when status === 'blocked'
  sourceDatasetIds: string[];      // upstream Datasets
  targetDatasetId: string;         // downstream Dataset (the materialized one)
  transformSteps: TransformStep[];
  qualityGate: QualityGateResult;
  slo: PipelineSlo;
  historicalRuns: HistoricalRun[];
  classification: Classification;
  threadTag?: ThreadTag;
}

/** Layer roll-up shown on the Pipelines list page. */
export interface LayerStatus {
  layer: MedallionLayer;
  healthy: number;
  delayed: number;
  failed: number;
  running: number;
  scheduled: number;
  blocked: number;
  rows24h: number;
}

// =========================================================================
// §18 — Source registry
// =========================================================================

export type SourceProtocol =
  | 'rest-webhook'
  | 'rest-pull'
  | 'sftp-drop'
  | 'jdbc-cdc'
  | 'kinesis-stream'
  | 'kafka-topic'
  | 'mqtt'
  | 'opc-ua'
  | 'mllp-listener'
  | 'sip-signal'
  | 'syslog'
  | 'edi-as2'
  | 's3-event'
  | 'manual-upload';

export type SourceCadence =
  | 'streaming (sub-second)'
  | 'streaming (~5s lag)'
  | 'streaming (~30s lag)'
  | 'every 1 min'
  | 'every 5 min'
  | 'every 15 min'
  | 'every 30 min'
  | 'hourly'
  | 'nightly'
  | 'weekly'
  | 'per-event'
  | 'on-demand';

export type SourceCategory =
  | 'cad-rms'
  | 'access-control'
  | 'video-vms'
  | 'mass-notification'
  | 'blue-light'
  | 'tip-line'
  | 'behavioral-threat'
  | 'title-ix-conduct'
  | 'sis-roster'
  | 'hr-roster'
  | 'housing'
  | 'onecard'
  | 'lpr'
  | 'dems'
  | 'transit'
  | 'parking'
  | 'fire-life-safety'
  | 'bms'
  | 'weather'
  | 'external-feed'
  | 'lms'
  | 'compliance-feed';

export interface SourceHealth {
  /** Composite 0..100 = freshness × completeness × schemaStability. */
  composite: number;
  freshness: number;               // 0..100
  completeness: number;            // 0..100
  schemaStability: number;         // 0..100
  lastSuccessfulRunAt: string;
  lastFailureAt?: string;
}

export interface Source {
  id: string;                      // 'SRC-MARK43-CAD-PRIMARY'
  name: string;                    // human label
  vendor: string;                  // 'Mark43', 'Lenel S2', 'Genetec', etc.
  category: SourceCategory;
  domainId: DomainId;
  protocol: SourceProtocol;
  cadence: SourceCadence;
  schemaVersion: string;           // 'v3.2'
  owner: string;
  steward: string;
  sensitivityTier: Classification;
  regulatoryHooks: RegulationId[];
  connectedDatasetIds: string[];
  health: SourceHealth;
  description: string;
  /** Where credentials live (Secrets Manager / Vault path). */
  credentialRef?: string;
  /** Days until next mandatory credential rotation. */
  credentialDaysToRotation?: number;
}

// =========================================================================
// §19 — Insights & AI (stubs for pipeline + dataset cross-references)
// =========================================================================

export type InsightKind = 'rca' | 'prediction' | 'anomaly';

export interface RCAContributor {
  label: string;
  weightPct: number;               // sums to ~100
  rationale: string;
  evidenceDatasetIds: string[];
  linkedRoute?: string;
}

export interface PredictionAttribution {
  modelName: string;
  modelVersion: string;
  modelKind: 'classifier' | 'regressor' | 'forecaster' | 'anomaly-detector';
  confidence: number;              // 0..100
  confidenceInterval?: [number, number];
  scoredAt: string;
  features: { name: string; value: string | number; importancePct: number; hint?: string }[];
  recommendedActions: { description: string; horizonHours: number; ownerRole: RoleId | 'auto' }[];
}

export interface Insight {
  id: string;                      // 'INS-L1-RCA-001'
  kind: InsightKind;
  title: string;
  narrative: string;
  severity: Severity;
  affectedAssets: string[];        // entity IDs
  evidenceDatasetIds: string[];
  contributors?: RCAContributor[]; // rca-kind only
  prediction?: PredictionAttribution; // prediction-kind only
  createdAt: string;
  classification: Classification;
  threadTag?: ThreadTag;
}

// =========================================================================
// §20 — Dashboard & conversational (R5+); §21 Governance (R8). Stubbed.
// =========================================================================

// =========================================================================
// §21 — Governance (Information Barriers — full; rest stubbed for R8)
// =========================================================================

/** Direction the barrier blocks. */
export type BarrierDirection = 'hard-wall' | 'soft-wall' | 'conditional' | 'one-way';

/** Barrier policy — applied at every data-layer read. */
export interface InformationBarrier {
  id: string;                       // 'IB-TIX-TO-PD-HARD'
  name: string;
  description: string;
  /** The classification(s) this barrier protects. */
  protects: Classification[];
  /** The role(s) this barrier blocks (or '*' for "everyone except listed allowed"). */
  blocks: RoleId[] | '*';
  /** The role(s) this barrier explicitly permits. */
  allows: RoleId[];
  direction: BarrierDirection;
  /** Override path — what's required to break the wall. */
  overridePath?: string;
  /** Regulation references this barrier exists to satisfy. */
  regulatoryHooks: RegulationId[];
}

export interface BarrierResult {
  allowed: boolean;
  masked: boolean;
  barrierHit?: InformationBarrier;
  reason: string;
}

export interface BarrierHitLogEntry {
  id: string;
  at: string;                       // ISO timestamp
  actorRole: RoleId;
  resourceKind: string;             // 'person' | 'incident' | 'bit-case' | etc.
  resourceId: string;
  barrierId: string;
  outcome: 'masked' | 'denied' | 'allowed-with-override';
}

// ----- §21 R8 additions: Policies + Regulations + Access log --------------

/** Institutional policy referenced by audit + governance UIs. */
export type PolicyCategory =
  | 'student-conduct'
  | 'title-ix'
  | 'clery'
  | 'ferpa'
  | 'data-classification'
  | 'information-security'
  | 'access-control'
  | 'mass-notification'
  | 'records-retention'
  | 'incident-response'
  | 'hazing-prevention'
  | 'medical-amnesty';

export interface Policy {
  id: string;                       // 'POL-CONDUCT-CODE'
  name: string;
  category: PolicyCategory;
  description: string;
  ownerRole: RoleId | 'office-of-general-counsel';
  /** Last review date — ISO. */
  lastReviewedAt: string;
  /** Next required review (typically 12 months out). */
  nextReviewDueAt: string;
  /** Regulations the policy satisfies. */
  regulatoryHooks: RegulationId[];
  /** External URL placeholder (institutional intranet). */
  externalUrl?: string;
  classification: Classification;
}

/** Regulatory citation entry — used by the regulations registry view. */
export interface Regulation {
  id: RegulationId;
  shortName: string;                // e.g. 'Clery Act'
  longName: string;
  /** Citation, e.g. '20 USC §1092(f); 34 CFR §668.46'. */
  citation: string;
  jurisdiction: 'federal' | 'state' | 'institutional';
  /** Coarse description of what the regulation requires. */
  scope: string;
  /** Linked policy IDs that operationalize this regulation. */
  policyIds: string[];
  /** ISO date of last regulatory update we track. */
  lastAmendedAt: string;
  /** Whether the platform considers this regulation actively enforced. */
  active: boolean;
}

/** Platform access-log entry — every action against a sensitive resource. */
export type AccessLogActionKind =
  | 'view'
  | 'export'
  | 'edit'
  | 'override'
  | 'masked'
  | 'denied'
  | 'login'
  | 'role-switch';

export interface PlatformAccessLogEntry {
  id: string;                       // 'ALG-2026-...'
  at: string;
  actorRole: RoleId;
  actorPersonId?: string;
  action: AccessLogActionKind;
  resourceKind: string;             // 'person' | 'incident' | 'bit-case' | etc.
  resourceId: string;
  classification: Classification;
  /** When a barrier fired, the hit ID it produced. */
  barrierHitId?: string;
  /** Optional reason / override path. */
  reason?: string;
}

// §17 small helper: governed semantic-layer metric entries.
export interface MetricDefinition {
  id: string;                      // 'MET-AVG-RESPONSE-TIME'
  label: string;
  description: string;
  primaryDataset: string;          // dataset ID
  defaultDimensions: string[];     // e.g. ['call-type', 'beat', 'priority']
  certified: boolean;
  owner: string;
  nlAliases: string[];             // for NL→SQL resolution
  unit: string;                    // 'minutes', 'count', 'percent', etc.
  formula?: string;                // dbt-ish expression
  benchmarkValue?: number;
  regulatoryHooks: RegulationId[];
}
