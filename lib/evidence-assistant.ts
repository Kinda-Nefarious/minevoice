export interface EvidenceChecklistItem {
  id: string;
  label: string;
  description: string;
  authoritative_relevance: string;
  category: string;
}

export const EVIDENCE_CHECKLIST_LIBRARY: Record<string, EvidenceChecklistItem[]> = {
  'Water & Pollution': [
    {
      id: 'ev-water-photo',
      label: 'Photograph of affected water source',
      description: 'Clear photo showing borehole spout, stream surface, or storage containers.',
      authoritative_relevance: 'Demonstrates visible physical state for EMA inspector triage.',
      category: 'Water & Pollution'
    },
    {
      id: 'ev-water-date',
      label: 'Approximate date the change began',
      description: 'First day discoloration, foul taste, or sediment appeared.',
      authoritative_relevance: 'Assists with correlating against processing plant production logs.',
      category: 'Water & Pollution'
    },
    {
      id: 'ev-water-color',
      label: 'Photographs of visible colour/sediment',
      description: 'Close-up of settled sludge, metallic sheen, or foaming in clean glass.',
      authoritative_relevance: 'Documents visual indicators of potential mineral processing runoff.',
      category: 'Water & Pollution'
    },
    {
      id: 'ev-water-test',
      label: 'Water test results if available',
      description: 'Previous laboratory certificates, dipstick readings, or health clinic notices.',
      authoritative_relevance: 'Provides baseline laboratory comparisons against SI 6/2007 thresholds.',
      category: 'Water & Pollution'
    },
    {
      id: 'ev-water-ref',
      label: 'Previous complaint/reference number',
      description: 'Prior reference given by operator liaison, RDC, or clinic.',
      authoritative_relevance: 'Establishes institutional notice history under Section 57 EMA Act.',
      category: 'Water & Pollution'
    },
    {
      id: 'ev-water-testimony',
      label: 'Testimony from other affected households',
      description: 'Names or count of families experiencing identical water shortages/illness.',
      authoritative_relevance: 'Confirms community-wide impact rather than isolated household piping issue.',
      category: 'Water & Pollution'
    }
  ],
  'Air, Dust, Noise & Blasting': [
    {
      id: 'ev-blast-cracks',
      label: 'Photographs of structural cracks',
      description: 'Photos with ruler or coin next to wall/foundation cracks for scale.',
      authoritative_relevance: 'Primary physical evidence for Ministry of Mines structural engineers.',
      category: 'Air, Dust, Noise & Blasting'
    },
    {
      id: 'ev-blast-dates',
      label: 'Dates and times of blasting',
      description: 'Exact day and hour of detonation shockwaves.',
      authoritative_relevance: 'Allows verification against the mine’s statutory blast logbook.',
      category: 'Air, Dust, Noise & Blasting'
    },
    {
      id: 'ev-blast-video',
      label: 'Videos if safely obtainable',
      description: 'Recording of blast vibration, dust plume, or lack of advance siren.',
      authoritative_relevance: 'Assists in determining compliance with SI 109/1990 safety siren protocol.',
      category: 'Air, Dust, Noise & Blasting'
    },
    {
      id: 'ev-blast-dist',
      label: 'Approximate distance from activity',
      description: 'Estimated distance (in metres) from dwelling to open pit perimeter.',
      authoritative_relevance: 'Evaluates statutory 500-metre safety buffer under Mines & Minerals Act.',
      category: 'Air, Dust, Noise & Blasting'
    },
    {
      id: 'ev-blast-witness',
      label: 'Witness accounts',
      description: 'Neighbors or local school teachers who felt tremor or observed dust.',
      authoritative_relevance: 'Corroborates seismic vibration radius across multiple coordinates.',
      category: 'Air, Dust, Noise & Blasting'
    }
  ],
  'Compensation & Relocation': [
    {
      id: 'ev-comp-valuation',
      label: 'Valuation document or asset inventory',
      description: 'List of fruit trees, homestead structures, or crop yield surveys.',
      authoritative_relevance: 'Essential baseline for fair compensation assessment under national standards.',
      category: 'Compensation & Relocation'
    },
    {
      id: 'ev-comp-offer',
      label: 'Compensation offer or signed agreement',
      description: 'Written proposal letter or settlement contract from project developer.',
      authoritative_relevance: 'Allows review against statutory resettlement guidelines.',
      category: 'Compensation & Relocation'
    },
    {
      id: 'ev-comp-receipt',
      label: 'Payment receipt or bank record',
      description: 'Documentation of partial payments received or disputed bank transfers.',
      authoritative_relevance: 'Verifies accounting discrepancy between agreed and paid amounts.',
      category: 'Compensation & Relocation'
    },
    {
      id: 'ev-comp-proof',
      label: 'Proof of occupation or land allocation',
      description: 'Headman letter, communal tax receipt, or family settlement record.',
      authoritative_relevance: 'Confirms recognized community tenure rights under communal land law.',
      category: 'Compensation & Relocation'
    }
  ],
  'Community Commitments': [
    {
      id: 'ev-csr-agreement',
      label: 'Community agreement or signed MOU',
      description: 'Signed copy of Community Development Agreement or tripartite charter.',
      authoritative_relevance: 'Direct contractual foundation for enforceable social investment.',
      category: 'Community Commitments'
    },
    {
      id: 'ev-csr-minutes',
      label: 'Meeting minutes or written promise',
      description: 'Notes from community consultative meeting with company managers.',
      authoritative_relevance: 'Documents explicit verbal and written undertakings by operator.',
      category: 'Community Commitments'
    },
    {
      id: 'ev-csr-photos',
      label: 'Photographs of stalled infrastructure',
      description: 'Pictures of half-built school block, dry borehole, or unfinished road.',
      authoritative_relevance: 'Proves current on-the-ground milestone completion status.',
      category: 'Community Commitments'
    }
  ],
  'Land & Access': [
    {
      id: 'ev-land-alloc',
      label: 'Allocation document or traditional leader record',
      description: 'Village head (Sabhuku) or Chief confirmation letter of boundaries.',
      authoritative_relevance: 'Demonstrates customary land tenure boundary under Communal Lands Act.',
      category: 'Land & Access'
    },
    {
      id: 'ev-land-hist',
      label: 'Residence history & photographs',
      description: 'Photos of family homestead, grazing pastures, or family graves.',
      authoritative_relevance: 'Documents cultural heritage and long-term land dependency.',
      category: 'Land & Access'
    },
    {
      id: 'ev-land-witness',
      label: 'Witness statements',
      description: 'Statements from ward councillor or elder regarding historic boundaries.',
      authoritative_relevance: 'Corroborates boundary dispute history before the District Magistrate.',
      category: 'Land & Access'
    }
  ]
};

export type EvidenceCompletenessLevel =
  | 'Strong documentation'
  | 'Some supporting evidence'
  | 'Additional evidence may help'
  | 'No evidence uploaded yet';

export function calculateEvidenceCompleteness(
  providedItemsCount: number,
  hasFiles: boolean
): {
  level: EvidenceCompletenessLevel;
  badgeColor: string;
  helpText: string;
} {
  if (providedItemsCount >= 3 || (hasFiles && providedItemsCount >= 2)) {
    return {
      level: 'Strong documentation',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      helpText: 'Your report contains multiple supporting documentation items which greatly aid swift authority investigation.'
    };
  }
  if (providedItemsCount >= 1 || hasFiles) {
    return {
      level: 'Some supporting evidence',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      helpText: 'Your report contains initial supporting evidence. Additional materials can still be appended if available.'
    };
  }
  if (providedItemsCount === 0) {
    return {
      level: 'Additional evidence may help',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      helpText: 'This evidence may help document your grievance. MineVoice never scores reports negatively for missing evidence, and lack of documentary evidence does not mean the grievance is false.'
    };
  }
  return {
    level: 'No evidence uploaded yet',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    helpText: 'Documentary evidence is optional. Your testimony remains valid and actionable.'
  };
}

export function getChecklistForCategory(category: string): EvidenceChecklistItem[] {
  return EVIDENCE_CHECKLIST_LIBRARY[category] || EVIDENCE_CHECKLIST_LIBRARY['Water & Pollution'];
}
