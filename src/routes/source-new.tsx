/**
 * /sources/new — 8-step Source Onboarding Wizard.
 *
 * Steps (per docs/implementation-plan.md §14 R2):
 *   1. Type            — what category of source
 *   2. Protocol        — how data arrives + cadence
 *   3. Credentials     — vault path + rotation window
 *   4. Schema Map      — schema version + minimum fields
 *   5. Sensitivity     — classification tier per the 10-tier scale
 *   6. Regulatory Hooks — which regulations this dataset is evidence for
 *   7. Quality Rules   — six-dim DQ rule selection
 *   8. Review          — submit → registerSource() in the source-store
 *
 * Form validation: react-hook-form + zod. Per-step schema gates "Next".
 * On submit: a synthetic Source is constructed and registered in the
 * in-memory store (wiped on reload — intentional).
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, CheckCircle2, Database } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/components/layout/stepper';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { registerSource } from '@/lib/source-store';
import { isoSeconds, hoursAgo } from '@/lib/time';
import type {
  Classification, RegulationId, SourceCategory, SourceProtocol, SourceCadence, DomainId,
} from '@/lib/types';

// =========================================================================
// Schema (zod) — one schema per step; the final schema is the union
// =========================================================================

const StepSchema = z.object({
  // Step 1 — Type
  name: z.string().min(3, 'Min 3 characters'),
  vendor: z.string().min(2, 'Required'),
  category: z.enum([
    'cad-rms', 'access-control', 'video-vms', 'mass-notification',
    'blue-light', 'tip-line', 'behavioral-threat', 'title-ix-conduct',
    'sis-roster', 'hr-roster', 'housing', 'onecard', 'lpr', 'dems',
    'transit', 'parking', 'fire-life-safety', 'bms', 'weather',
    'external-feed', 'lms', 'compliance-feed',
  ] as const),
  domainId: z.enum([
    'dispatch-response', 'investigations-records', 'behavioral-threat',
    'title-ix-conduct', 'eoc-emergency', 'mass-notification',
    'surveillance-video', 'access-control', 'transportation-mobility',
    'facilities-fire-environmental', 'compliance-reporting', 'roster-identity',
  ] as const),

  // Step 2 — Protocol
  protocol: z.enum([
    'rest-webhook', 'rest-pull', 'sftp-drop', 'jdbc-cdc', 'kinesis-stream',
    'kafka-topic', 'mqtt', 'opc-ua', 'mllp-listener', 'sip-signal',
    'syslog', 'edi-as2', 's3-event', 'manual-upload',
  ] as const),
  cadence: z.enum([
    'streaming (sub-second)', 'streaming (~5s lag)', 'streaming (~30s lag)',
    'every 1 min', 'every 5 min', 'every 15 min', 'every 30 min',
    'hourly', 'nightly', 'weekly', 'per-event', 'on-demand',
  ] as const),

  // Step 3 — Credentials
  credentialRef: z.string().min(3, 'Vault path required'),
  credentialDaysToRotation: z.coerce.number().int().min(1).max(365),

  // Step 4 — Schema Map
  schemaVersion: z.string().min(1, 'Required'),
  fieldsCsv: z.string().min(3, 'List at least one critical field'),

  // Step 5 — Sensitivity
  sensitivityTier: z.enum([
    'public', 'internal', 'ferpa-edu-record', 'cji', 'title-ix-sensitive',
    'counseling-42cfr2', 'pii', 'phi', 'juvenile', 'restricted-investigation',
  ] as const),

  // Step 6 — Regulatory Hooks
  regulatoryHooks: z.array(z.enum([
    'REG-CLERY', 'REG-TITLE-IX', 'REG-FERPA', 'REG-CJIS', 'REG-VAWA',
    'REG-NIBRS', 'REG-28-CFR-23', 'REG-42-CFR-2', 'REG-ADA',
    'REG-STATE-FOIA', 'REG-STATE-PRIVACY', 'REG-STOP-CAMPUS-HAZING',
    'REG-DFSCA', 'REG-CLERY-MSNP', 'REG-FERPA-99-31',
    'REG-SOC2', 'REG-ISO27001', 'REG-NIST-800-53',
  ] as const)),

  // Step 7 — Quality Rules
  qualityRulesChosen: z.array(z.string()),

  // Step 8 — Review (no new fields)
  owner: z.string().min(3, 'Required'),
  steward: z.string().min(3, 'Required'),
  description: z.string().min(20, 'Min 20 characters'),
});

type FormValues = z.infer<typeof StepSchema>;

// =========================================================================
// Step definitions
// =========================================================================

const STEPS = [
  { label: 'Type', description: 'What is it?', fields: ['name', 'vendor', 'category', 'domainId'] as const },
  { label: 'Protocol', description: 'How does it arrive?', fields: ['protocol', 'cadence'] as const },
  { label: 'Credentials', description: 'Vault & rotation', fields: ['credentialRef', 'credentialDaysToRotation'] as const },
  { label: 'Schema Map', description: 'Version + fields', fields: ['schemaVersion', 'fieldsCsv'] as const },
  { label: 'Sensitivity', description: 'Classification tier', fields: ['sensitivityTier'] as const },
  { label: 'Regulatory', description: 'Regulations it serves', fields: ['regulatoryHooks'] as const },
  { label: 'Quality', description: 'DQ rules', fields: ['qualityRulesChosen'] as const },
  { label: 'Review', description: 'Confirm + submit', fields: ['owner', 'steward', 'description'] as const },
];

const CATEGORY_OPTIONS: { value: SourceCategory; label: string; domain: DomainId }[] = [
  { value: 'cad-rms', label: 'CAD/RMS — dispatch + records', domain: 'dispatch-response' },
  { value: 'access-control', label: 'Access Control System', domain: 'access-control' },
  { value: 'video-vms', label: 'Video Management System', domain: 'surveillance-video' },
  { value: 'mass-notification', label: 'Mass Notification Platform', domain: 'mass-notification' },
  { value: 'blue-light', label: 'Blue-Light Phones', domain: 'mass-notification' },
  { value: 'tip-line', label: 'Anonymous Tip Line', domain: 'mass-notification' },
  { value: 'behavioral-threat', label: 'Behavioral Threat / BIT', domain: 'behavioral-threat' },
  { value: 'title-ix-conduct', label: 'Title IX / Conduct', domain: 'title-ix-conduct' },
  { value: 'sis-roster', label: 'SIS / Student Information System', domain: 'roster-identity' },
  { value: 'hr-roster', label: 'HR / HCM', domain: 'roster-identity' },
  { value: 'housing', label: 'Housing', domain: 'roster-identity' },
  { value: 'onecard', label: 'OneCard / Campus Card', domain: 'access-control' },
  { value: 'lpr', label: 'License Plate Reader', domain: 'transportation-mobility' },
  { value: 'dems', label: 'Digital Evidence Management', domain: 'investigations-records' },
  { value: 'transit', label: 'Shuttle / Transit', domain: 'transportation-mobility' },
  { value: 'parking', label: 'Parking', domain: 'transportation-mobility' },
  { value: 'fire-life-safety', label: 'Fire & Life Safety', domain: 'facilities-fire-environmental' },
  { value: 'bms', label: 'Building Management System', domain: 'facilities-fire-environmental' },
  { value: 'weather', label: 'Weather / NWS', domain: 'eoc-emergency' },
  { value: 'external-feed', label: 'External Feed', domain: 'eoc-emergency' },
  { value: 'lms', label: 'Learning Management System', domain: 'roster-identity' },
  { value: 'compliance-feed', label: 'Compliance Feed', domain: 'compliance-reporting' },
];

const PROTOCOL_OPTIONS: SourceProtocol[] = [
  'rest-webhook', 'rest-pull', 'sftp-drop', 'jdbc-cdc', 'kinesis-stream',
  'kafka-topic', 'mqtt', 'opc-ua', 'mllp-listener', 'sip-signal',
  'syslog', 'edi-as2', 's3-event', 'manual-upload',
];

const CADENCE_OPTIONS: SourceCadence[] = [
  'streaming (sub-second)', 'streaming (~5s lag)', 'streaming (~30s lag)',
  'every 1 min', 'every 5 min', 'every 15 min', 'every 30 min',
  'hourly', 'nightly', 'weekly', 'per-event', 'on-demand',
];

const CLASSIFICATIONS: Classification[] = [
  'public', 'internal', 'ferpa-edu-record', 'cji', 'title-ix-sensitive',
  'counseling-42cfr2', 'pii', 'phi', 'juvenile', 'restricted-investigation',
];

const REGULATIONS: { id: RegulationId; label: string }[] = [
  { id: 'REG-CLERY', label: 'Clery Act' },
  { id: 'REG-TITLE-IX', label: 'Title IX' },
  { id: 'REG-FERPA', label: 'FERPA' },
  { id: 'REG-CJIS', label: 'CJIS Security Policy' },
  { id: 'REG-VAWA', label: 'VAWA / Campus SaVE' },
  { id: 'REG-NIBRS', label: 'NIBRS' },
  { id: 'REG-28-CFR-23', label: '28 CFR Part 23' },
  { id: 'REG-42-CFR-2', label: '42 CFR Part 2' },
  { id: 'REG-ADA', label: 'ADA' },
  { id: 'REG-STATE-FOIA', label: 'State FOIA' },
  { id: 'REG-STOP-CAMPUS-HAZING', label: 'Stop Campus Hazing Act' },
  { id: 'REG-DFSCA', label: 'Drug-Free Schools (DFSCA)' },
  { id: 'REG-CLERY-MSNP', label: 'Clery Missing-Student NP' },
  { id: 'REG-FERPA-99-31', label: 'FERPA §99.31(a)(15)' },
  { id: 'REG-SOC2', label: 'SOC 2 Type II' },
  { id: 'REG-ISO27001', label: 'ISO 27001' },
  { id: 'REG-NIST-800-53', label: 'NIST 800-53' },
];

const QUALITY_RULE_TEMPLATES = [
  { id: 'qr-pk-not-null', dim: 'completeness', label: 'Primary key not null' },
  { id: 'qr-pk-unique', dim: 'uniqueness', label: 'Primary key unique' },
  { id: 'qr-event-time-fresh', dim: 'timeliness', label: 'Event timestamp within freshness window' },
  { id: 'qr-enum-validity', dim: 'validity', label: 'Enum fields match allowed set' },
  { id: 'qr-fk-resolves', dim: 'consistency', label: 'Foreign keys resolve in target registry' },
  { id: 'qr-no-future-dates', dim: 'validity', label: 'No dates in the future' },
  { id: 'qr-row-count-stability', dim: 'consistency', label: 'Row count within ±20% of 7-day mean' },
  { id: 'qr-no-pii-leak', dim: 'accuracy', label: 'No PII in non-PII columns' },
];

// =========================================================================
// Component
// =========================================================================

export default function SourceNewPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(StepSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      vendor: '',
      category: 'sis-roster',
      domainId: 'roster-identity',
      protocol: 'rest-pull',
      cadence: 'every 15 min',
      credentialRef: 'secrets/',
      credentialDaysToRotation: 90,
      schemaVersion: 'v1.0',
      fieldsCsv: '',
      sensitivityTier: 'internal',
      regulatoryHooks: [],
      qualityRulesChosen: ['qr-pk-not-null', 'qr-pk-unique'],
      owner: '',
      steward: '',
      description: '',
    },
  });

  const { register, watch, setValue, trigger, formState, handleSubmit, getValues } = form;
  const values = watch();

  async function nextStep() {
    const fields = STEPS[stepIdx].fields as readonly (keyof FormValues)[];
    const ok = await trigger(fields as never);
    if (!ok) return;
    if (stepIdx < STEPS.length - 1) setStepIdx((s) => s + 1);
  }
  function prevStep() {
    if (stepIdx > 0) setStepIdx((s) => s - 1);
  }

  function onSubmit(v: FormValues) {
    const id = `SRC-WIZARD-${Date.now()}`;
    const fieldsList = v.fieldsCsv.split(',').map((s) => s.trim()).filter(Boolean);
    registerSource({
      id,
      name: v.name,
      vendor: v.vendor,
      category: v.category,
      domainId: v.domainId,
      protocol: v.protocol,
      cadence: v.cadence,
      schemaVersion: v.schemaVersion,
      owner: v.owner,
      steward: v.steward,
      sensitivityTier: v.sensitivityTier,
      regulatoryHooks: v.regulatoryHooks,
      connectedDatasetIds: [],
      health: {
        composite: 92,
        freshness: 95,
        completeness: 90,
        schemaStability: 90,
        lastSuccessfulRunAt: isoSeconds(hoursAgo(0.01)),
      },
      description: v.description + ` (Critical fields: ${fieldsList.join(', ')}.)`,
      credentialRef: v.credentialRef,
      credentialDaysToRotation: v.credentialDaysToRotation,
    });
    setSubmittedId(id);
  }

  // ===== Success view =====
  if (submittedId) {
    return (
      <>
        <PageHeader
          eyebrow="Sources · Onboarding"
          title="Source registered"
          description="The new source has been registered in the in-memory source registry. In production, this would trigger initial schema discovery + a first Bronze landing job."
        />
        <div className="space-y-4 px-8 py-6">
          <Card className="border-[var(--signal-green)]">
            <CardContent className="flex items-start gap-3 p-5">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-[var(--signal-green)]" />
              <div className="flex-1">
                <div className="font-semibold text-[var(--foreground)]">{getValues('name')}</div>
                <div className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">{submittedId}</div>
                <div className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Default Bronze ingestion pipeline auto-generated from wizard inputs (the YAML is
                  downloadable + git-committable in production; the wizard is a YAML-author shortcut
                  not a parallel control plane).
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => navigate('/sources')}>View all sources</Button>
                  <Button variant="outline" onClick={() => { setSubmittedId(null); setStepIdx(0); form.reset(); }}>
                    Add another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // ===== Wizard view =====
  const isFinalStep = stepIdx === STEPS.length - 1;

  return (
    <>
      <PageHeader
        eyebrow="Sources · Onboarding · 8-step wizard"
        title="Add a new source"
        description="Connect any campus public-safety system to the Hub. The wizard registers the source in the catalog and (in production) auto-generates a default Bronze ingestion pipeline."
        actions={
          <Link to="/sources">
            <Button variant="ghost" size="sm">Cancel</Button>
          </Link>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="p-5">
            <Stepper
              steps={STEPS}
              activeIndex={stepIdx}
              completedIndices={Array.from({ length: stepIdx }, (_, i) => i)}
            />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Step {stepIdx + 1} of {STEPS.length} — {STEPS[stepIdx].label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ===== Step 1: Type ===== */}
              {stepIdx === 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Source name" error={formState.errors.name?.message}>
                    <Input placeholder="e.g. Mark43 CAD/RMS" {...register('name')} />
                  </Field>
                  <Field label="Vendor" error={formState.errors.vendor?.message}>
                    <Input placeholder="e.g. Mark43" {...register('vendor')} />
                  </Field>
                  <Field label="Category" error={formState.errors.category?.message}>
                    <select
                      className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                      value={values.category}
                      onChange={(e) => {
                        const cat = e.target.value as SourceCategory;
                        setValue('category', cat);
                        const opt = CATEGORY_OPTIONS.find((o) => o.value === cat);
                        if (opt) setValue('domainId', opt.domain);
                      }}
                    >
                      {CATEGORY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Domain" error={formState.errors.domainId?.message}>
                    <Input value={values.domainId} disabled />
                    <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">Auto-derived from category.</div>
                  </Field>
                </div>
              )}

              {/* ===== Step 2: Protocol ===== */}
              {stepIdx === 1 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Protocol" error={formState.errors.protocol?.message}>
                    <select
                      className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                      value={values.protocol}
                      onChange={(e) => setValue('protocol', e.target.value as SourceProtocol)}
                    >
                      {PROTOCOL_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Cadence" error={formState.errors.cadence?.message}>
                    <select
                      className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                      value={values.cadence}
                      onChange={(e) => setValue('cadence', e.target.value as SourceCadence)}
                    >
                      {CADENCE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {/* ===== Step 3: Credentials ===== */}
              {stepIdx === 2 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Vault reference path" error={formState.errors.credentialRef?.message}>
                    <Input placeholder="e.g. secrets/cad/mark43-webhook-hmac" {...register('credentialRef')} className="font-mono" />
                  </Field>
                  <Field label="Days to credential rotation" error={formState.errors.credentialDaysToRotation?.message}>
                    <Input type="number" min={1} max={365} {...register('credentialDaysToRotation')} />
                    <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">CJIS-aligned rotation cycle (≤ 90d typical).</div>
                  </Field>
                </div>
              )}

              {/* ===== Step 4: Schema Map ===== */}
              {stepIdx === 3 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Schema version" error={formState.errors.schemaVersion?.message}>
                    <Input placeholder="e.g. v3.4" {...register('schemaVersion')} className="font-mono" />
                  </Field>
                  <Field label="Critical fields (comma-separated)" error={formState.errors.fieldsCsv?.message} className="md:col-span-2">
                    <Input placeholder="e.g. cad_event_uuid, event_at, cfs_number, priority" {...register('fieldsCsv')} className="font-mono" />
                    <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">Used by Bronze schema-validation step.</div>
                  </Field>
                </div>
              )}

              {/* ===== Step 5: Sensitivity ===== */}
              {stepIdx === 4 && (
                <div>
                  <Label className="mb-3 block">Classification tier</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {CLASSIFICATIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setValue('sensitivityTier', c)}
                        className={`flex items-center gap-2 rounded-md border p-3 text-left text-xs transition-colors ${
                          values.sensitivityTier === c
                            ? 'border-[var(--hub-600)] bg-[var(--hub-100)]'
                            : 'border-[var(--border)] hover:bg-[var(--graphite-50)]'
                        }`}
                      >
                        <ClassificationBadge classification={c} />
                        <span className="flex-1 truncate text-[var(--foreground)]">{c}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-[10px] text-[var(--muted-foreground)]">
                    Highest column-level classification determines this tier. Drives role-based masking at every read.
                  </div>
                </div>
              )}

              {/* ===== Step 6: Regulatory Hooks ===== */}
              {stepIdx === 5 && (
                <div>
                  <Label className="mb-3 block">Which regulations is this dataset evidence for?</Label>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {REGULATIONS.map((r) => {
                      const checked = values.regulatoryHooks.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            const next = checked
                              ? values.regulatoryHooks.filter((x) => x !== r.id)
                              : [...values.regulatoryHooks, r.id];
                            setValue('regulatoryHooks', next);
                          }}
                          className={`flex items-center gap-2 rounded-md border p-2.5 text-left text-xs transition-colors ${
                            checked ? 'border-[var(--hub-600)] bg-[var(--hub-100)]' : 'border-[var(--border)] hover:bg-[var(--graphite-50)]'
                          }`}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-[var(--hub-600)] bg-[var(--hub-600)] text-white' : 'border-[var(--graphite-300)]'}`}>
                            {checked && <CheckCircle2 className="h-3 w-3" />}
                          </span>
                          <span className="flex-1">
                            <div className="font-mono text-[10px] text-[var(--muted-foreground)]">{r.id}</div>
                            <div>{r.label}</div>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-[10px] text-[var(--muted-foreground)]">
                    Picks here drive the source-to-line lineage on the Clery ASR Workbench (R7), NIBRS submission (R7), and audit packet builders.
                  </div>
                </div>
              )}

              {/* ===== Step 7: Quality Rules ===== */}
              {stepIdx === 6 && (
                <div>
                  <Label className="mb-3 block">Six-dimension DQ rule templates</Label>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {QUALITY_RULE_TEMPLATES.map((r) => {
                      const checked = values.qualityRulesChosen.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            const next = checked
                              ? values.qualityRulesChosen.filter((x) => x !== r.id)
                              : [...values.qualityRulesChosen, r.id];
                            setValue('qualityRulesChosen', next);
                          }}
                          className={`flex items-start gap-2 rounded-md border p-2.5 text-left text-xs transition-colors ${
                            checked ? 'border-[var(--hub-600)] bg-[var(--hub-100)]' : 'border-[var(--border)] hover:bg-[var(--graphite-50)]'
                          }`}
                        >
                          <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-[var(--hub-600)] bg-[var(--hub-600)] text-white' : 'border-[var(--graphite-300)]'}`}>
                            {checked && <CheckCircle2 className="h-3 w-3" />}
                          </span>
                          <span className="flex-1">
                            <div>{r.label}</div>
                            <Badge variant="muted" className="mt-1 text-[9px]">{r.dim}</Badge>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===== Step 8: Review ===== */}
              {stepIdx === 7 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Owner team" error={formState.errors.owner?.message}>
                      <Input placeholder="e.g. University Police Dept" {...register('owner')} />
                    </Field>
                    <Field label="Data steward" error={formState.errors.steward?.message}>
                      <Input placeholder="e.g. PD Records Captain" {...register('steward')} />
                    </Field>
                    <Field label="Description" error={formState.errors.description?.message} className="md:col-span-2">
                      <textarea
                        {...register('description')}
                        className="min-h-[80px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2 text-sm"
                        placeholder="What is this source? What does it provide? Note any quirks (e.g. nightly export lag)."
                      />
                    </Field>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Summary label="Name" value={values.name || '(not set)'} />
                    <Summary label="Vendor" value={values.vendor || '(not set)'} />
                    <Summary label="Category" value={values.category} mono />
                    <Summary label="Domain" value={values.domainId} mono />
                    <Summary label="Protocol" value={values.protocol} mono />
                    <Summary label="Cadence" value={values.cadence} />
                    <Summary label="Credentials" value={values.credentialRef} mono />
                    <Summary label="Rotation" value={`${values.credentialDaysToRotation} days`} />
                    <Summary label="Schema version" value={values.schemaVersion} mono />
                    <Summary label="Sensitivity">
                      <ClassificationBadge classification={values.sensitivityTier} />
                    </Summary>
                    <Summary label="Regulations" className="md:col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {values.regulatoryHooks.length === 0 && (
                          <span className="text-[10px] text-[var(--muted-foreground)]">none</span>
                        )}
                        {values.regulatoryHooks.map((r) => (
                          <Badge key={r} variant="outline">{r}</Badge>
                        ))}
                      </div>
                    </Summary>
                    <Summary label="DQ rules" className="md:col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {values.qualityRulesChosen.map((id) => {
                          const r = QUALITY_RULE_TEMPLATES.find((x) => x.id === id);
                          return r ? <Badge key={id} variant="muted">{r.label}</Badge> : null;
                        })}
                      </div>
                    </Summary>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer — nav buttons */}
          <div className="mt-4 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={prevStep} disabled={stepIdx === 0}>
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            {!isFinalStep ? (
              <Button type="button" variant="accent" onClick={nextStep}>
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button type="submit" variant="accent">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Register source
              </Button>
            )}
          </div>
        </form>

        <Card>
          <CardContent className="flex items-start gap-3 p-4 text-xs text-[var(--muted-foreground)]">
            <Database className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              On submit, the wizard auto-generates a default Bronze ingestion pipeline (declarative
              YAML) from these inputs, registers the source in the catalog, and surfaces it in{' '}
              <Link to="/sources" className="text-[var(--hub-700)] hover:underline">/sources</Link>.
              The YAML is downloadable + git-committable. The wizard is a YAML-author shortcut, not
              a parallel control plane.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// =========================================================================
// Helpers
// =========================================================================

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <div className="mt-1 text-[10px] text-[var(--signal-red)]">{error}</div>}
    </div>
  );
}

function Summary({
  label,
  value,
  mono,
  children,
  className,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
      <div className={`mt-1 text-sm ${mono ? 'font-mono' : ''} text-[var(--foreground)]`}>
        {children ?? value}
      </div>
    </div>
  );
}
