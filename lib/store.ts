import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IssueCategory =
  | 'Water & Pollution'
  | 'Air, Dust, Noise & Blasting'
  | 'Land & Access'
  | 'Compensation & Relocation'
  | 'Safety & Harm'
  | 'Community Commitments'
  | 'Other / Unsure';

export type IssueStatus =
  | 'Draft'
  | 'Needs information'
  | 'Ready for review'
  | 'Prepared for submission'
  | 'Submitted by platform'
  | 'Submitted externally by reporter'
  | 'Awaiting acknowledgement'
  | 'Acknowledged'
  | 'Redirected'
  | 'Information requested'
  | 'Under review'
  | 'Inspection assigned'
  | 'Inspection completed'
  | 'Action reported'
  | 'Awaiting community verification'
  | 'Verified resolved'
  | 'Partially resolved'
  | 'Resolution disputed'
  | 'Unable to verify'
  | 'Resolved'
  | 'Closed without resolution'
  | 'Withdrawn';

export interface Route {
  authority_id: string;
  reason: string;
  confidence: number;
}

export type ObligationMatchStrength =
  | 'Strong obligation match'
  | 'Possible obligation match'
  | 'Contextual obligation'
  | 'No clear obligation identified';

export interface MatchedObligation {
  obligation_id?: string;
  title: string;
  legal_instrument: string;
  clause: string;
  requirement: string;
  match_strength: ObligationMatchStrength;
  potential_remedy: string; // Hardened replacement for "legally enforceable remedy"
  source_name: string;
  source_organisation: string;
  source_url: string;
  version_date: string;
  last_verified_at: string;
  plain_explanation: string;
  page_reference?: string;
  is_verified_registry?: boolean;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  captured_at?: string;
  location_name?: string;
  is_approximate?: boolean;
  share_precision: 'precise' | 'approximate' | 'ward_only';
  consent_given: boolean;
  sensitive_location_protected?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  actor: string;
  actor_role?: string;
  status_code?: IssueStatus;
  description: string;
  source?: string;
  attachment_name?: string;
  trust_label: 'Community reported' | 'Authority verified' | 'Internal system' | 'Independent audit';
}

export interface CommunityVerificationFeedback {
  case_id: string;
  authority_claimed_resolution: boolean;
  community_verification: 'resolved' | 'partial' | 'disputed' | 'unable';
  verification_notes: string;
  verified_at: string;
  evidence_count: number;
  verified_by?: string;
}

export interface DemoInspectionAssignment {
  inspector_name: string;
  inspector_title: string;
  assigned_date: string;
  priority: 'High Priority' | 'Standard' | 'Urgent Environmental Audit';
  proposed_inspection_date: string;
  status: 'Assigned' | 'Field Visit Underway' | 'Completed';
  inspection_note?: string;
  completed_date?: string;
}

export interface Case {
  id: string;
  reference_number: string;
  status: IssueStatus;
  urgency: 'low' | 'medium' | 'high';
  original_language: string;
  original_text: string;
  translated_text: string | null;
  category: IssueCategory;
  subcategory: string;
  project_id: string | null;
  province: string;
  district: string;
  ward: string;
  village_private: string;
  date_first_noticed: string;
  ongoing: boolean;
  immediate_danger: boolean;
  requested_remedy: string;
  ai_confidence: number;
  public_visibility: 'public_anonymous' | 'public_community' | 'private';
  created_at: string;
  updated_at: string;
  routes: Route[];
  answers: Record<string, string>;
  public_summary: string;
  trust_label: 'Verified' | 'Reported' | 'Community reported' | 'Disputed' | 'Not publicly verifiable';
  matched_obligations?: MatchedObligation[];
  geolocation?: GeolocationData | null;
  timeline?: TimelineEvent[];
  verification_feedback?: CommunityVerificationFeedback | null;
  demo_inspection?: DemoInspectionAssignment | null;
  evidence_items?: string[];
  evidence_completeness?: 'Strong documentation' | 'Some supporting evidence' | 'Additional evidence may help' | 'No evidence uploaded yet';
  authority_resolution_claim?: {
    claimed_at: string;
    authority_name: string;
    action_summary: string;
    supporting_note?: string;
  } | null;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  operator: string;
  commodity: string;
  province: string;
  district: string;
  verification_status: 'Verified' | 'Not publicly verifiable';
  open_cases: number;
  resolved_cases: number;
}

export interface Authority {
  id: string;
  name: string;
  role: string;
  verification_status: 'Verified' | 'Not publicly verifiable';
}

export interface FollowTarget {
  id: string;
  type: 'project' | 'ward' | 'district' | 'issue' | 'category';
  target_id: string;
  label: string;
  created_at: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'acknowledgement' | 'cluster' | 'obligation' | 'resolution' | 'inspection' | 'verification';
  link_url: string;
  created_at: string;
  read: boolean;
}

export interface CoordinateAccessLog {
  id: string;
  case_ref: string;
  user_role: string;
  accessed_at: string;
  purpose: string;
}

export interface LearningMetrics {
  classification_accepted_pct: number;
  classification_corrected_pct: number;
  routing_accepted_pct: number;
  routing_redirected_pct: number;
  most_common_correction: string;
  authority_resolved_count: number;
  community_verified_count: number;
  community_partial_count: number;
  community_disputed_count: number;
  avg_days_to_verification: number;
}

// Initial Seed Data
const initialProjects: Project[] = [
  {
    id: 'p-mavambo',
    name: 'Mavambo Lithium Project',
    slug: 'mavambo-lithium-project',
    operator: 'Mavambo Minerals (Demo Mining Concession)',
    commodity: 'Lithium Spodumene',
    province: 'Mashonaland East',
    district: 'Goromonzi',
    verification_status: 'Verified',
    open_cases: 6,
    resolved_cases: 4,
  },
];

const initialAuthorities: Authority[] = [
  { id: 'ema', name: 'Environmental Management Agency (EMA)', role: 'Environmental regulation & effluent monitoring', verification_status: 'Verified' },
  { id: 'mines', name: 'Ministry of Mines and Mining Development', role: 'Mining safety, blast inspection & title oversight', verification_status: 'Verified' },
  { id: 'rdc', name: 'Goromonzi Rural District Council', role: 'Local administration & communal infrastructure', verification_status: 'Verified' },
  { id: 'zhrc', name: 'Zimbabwe Human Rights Commission', role: 'Human rights and environmental rights advocacy', verification_status: 'Verified' },
  { id: 'company', name: 'Company Grievance Mechanism', role: 'Internal concession community liaison', verification_status: 'Verified' },
];

const initialCases: Case[] = [
  // Full Lifecycle Demo Case: MG-2026-011
  {
    id: 'c-011',
    reference_number: 'MG-2026-011',
    status: 'Partially resolved',
    urgency: 'high',
    original_language: 'sn',
    original_text: 'Chitubu chemumusha cheWard 14 chakasvibiswa nemvura ine madhaka emakemikari anobva kumuchina wekugezesa lithium. Mhuri 40 dzinotambura nemvura yekunwa.',
    translated_text: 'The Ward 14 village natural spring and community borehole were contaminated by chemical slurry runoff from the lithium processing circuit. 40 families are affected.',
    category: 'Water & Pollution',
    subcategory: 'Runoff into drinking water source',
    project_id: 'p-mavambo',
    province: 'Mashonaland East',
    district: 'Goromonzi',
    ward: 'Ward 14',
    village_private: 'Chikwaka East',
    date_first_noticed: '2026-09-02',
    ongoing: false,
    immediate_danger: true,
    requested_remedy: 'Spring desiltation, water testing certificates, and permanent chemical retention trenches.',
    ai_confidence: 0.96,
    public_visibility: 'public_anonymous',
    created_at: '2026-09-03T08:00:00Z',
    updated_at: '2026-09-20T08:00:00Z',
    routes: [
      { authority_id: 'ema', reason: 'Statutory mandate over chemical effluent and aquifer protection', confidence: 0.97 },
      { authority_id: 'rdc', reason: 'Communal borehole and public water assets administrator', confidence: 0.86 }
    ],
    answers: {
      water_source: 'Chikwaka East Spring and Communal Borehole #2',
      when_started: 'Early September during plant test wash cycle'
    },
    public_summary: 'Discoloration and chemical sediment reported in communal spring; authority flushed borehole and reinforced retention berms; community verified water colour improved but lab testing results pending.',
    trust_label: 'Community reported',
    geolocation: {
      latitude: -17.8295,
      longitude: 31.3562,
      accuracy: 9,
      location_name: 'Ward 14 Chikwaka East Spring',
      is_approximate: false,
      share_precision: 'precise',
      consent_given: true,
      sensitive_location_protected: false
    },
    evidence_items: ['Photograph of affected spring', 'Approximate date log', 'Testimony from 3 neighboring elders'],
    evidence_completeness: 'Strong documentation',
    matched_obligations: [
      {
        obligation_id: 'reg-ema-s57',
        title: 'Water Pollution Control & Discharge Prohibition',
        legal_instrument: 'Environmental Management Act [Chapter 20:27]',
        clause: 'Section 57(1)',
        requirement: 'Prohibits discharge of toxic or polluting matter into aquatic environments or aquifers used for domestic supply.',
        match_strength: 'Strong obligation match',
        potential_remedy: 'Potential formal remedy / escalation pathway: Submission of statutory water audit order; deployment of emergency potable water tankers; and environmental protection order pursuant to EMA Act Section 67.',
        source_name: 'Environmental Management Agency (EMA)',
        source_organisation: 'Government of Zimbabwe',
        source_url: 'https://www.ema.co.zw/legislation/environmental-management-act',
        version_date: 'Revised Edition 2018',
        last_verified_at: '2026-08-15',
        plain_explanation: 'Mining operators are legally required to prevent processing chemicals and tailings dam leachate from infiltrating communal drinking water boreholes or surface streams.'
      }
    ],
    authority_resolution_claim: {
      claimed_at: '2026-09-18T14:30:00Z',
      authority_name: 'Environmental Management Agency (EMA)',
      action_summary: 'Borehole flushed and water testing completed.',
      supporting_note: 'Tailings runoff trench diverted into lined holding pond; borehole casing flushed with chlorine solution.'
    },
    verification_feedback: {
      case_id: 'c-011',
      authority_claimed_resolution: true,
      community_verification: 'partial',
      verification_notes: 'Partially resolved — water colour improved and odour has dissipated, but residents have not received the official laboratory test certificates.',
      verified_at: '2026-09-20T07:45:00Z',
      evidence_count: 2,
      verified_by: 'Ward 14 Water Committee Representative'
    },
    timeline: [
      {
        id: 't-11-1',
        date: '2026-09-03',
        title: 'Grievance submitted',
        actor: 'Community Reporter',
        actor_role: 'Resident, Ward 14',
        status_code: 'Submitted by platform',
        description: 'Community member submitted Shona audio report describing dark sediment in communal drinking water.',
        trust_label: 'Community reported'
      },
      {
        id: 't-11-2',
        date: '2026-09-03',
        title: 'AI-assisted classification & obligation matching',
        actor: 'MineVoice Engine',
        actor_role: 'Intake Assistant',
        status_code: 'Ready for review',
        description: 'Transcribed Shona audio, classified under Water & Pollution, and matched against EMA Act Cap 20:27 Section 57(1).',
        trust_label: 'Internal system'
      },
      {
        id: 't-11-3',
        date: '2026-09-04',
        title: 'Routed to EMA & Goromonzi RDC',
        actor: 'MineVoice Platform',
        status_code: 'Awaiting acknowledgement',
        description: 'Standardized dossier dispatched to District Environmental Officer and Council Secretariat.',
        trust_label: 'Internal system'
      },
      {
        id: 't-11-4',
        date: '2026-09-06',
        title: 'Authority acknowledgement received',
        actor: 'EMA Mashonaland East',
        actor_role: 'District Environmental Officer',
        status_code: 'Acknowledged',
        description: 'Reference confirmed. Incident prioritized under High Urgency Drinking Water Standard.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-11-5',
        date: '2026-09-08',
        title: 'Demo inspection assignment created within MineVoice',
        actor: 'EMA Mashonaland East',
        actor_role: 'District Environmental Officer',
        status_code: 'Inspection assigned',
        description: 'Inspector T. Hove assigned with portable turbidity and pH testing kit; field visit scheduled for 2026-09-10.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-11-6',
        date: '2026-09-11',
        title: 'Inspection completed (Field sampling logged)',
        actor: 'Inspector T. Hove (EMA)',
        status_code: 'Inspection completed',
        description: 'Collected 3 water samples from borehole and spring outflow; noted breach in operator temporary containment dyke.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-11-7',
        date: '2026-09-15',
        title: 'Authority reported corrective action',
        actor: 'Mavambo Lithium Operator & EMA',
        status_code: 'Action reported',
        description: 'Operator reinforced containment berms and deployed interim potable water bowser to Chikwaka East.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-11-8',
        date: '2026-09-18',
        title: 'Authority reported resolution',
        actor: 'EMA Mashonaland East',
        status_code: 'Awaiting community verification',
        description: 'Borehole flushed and water testing completed. Case transitioned to Awaiting Community Verification.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-11-9',
        date: '2026-09-20',
        title: 'Community verified resolution: PARTIALLY RESOLVED',
        actor: 'Community Reporter & Ward 14 Water Committee',
        status_code: 'Partially resolved',
        description: 'Partially resolved — water colour improved but residents have not received the test results.',
        trust_label: 'Community reported'
      }
    ]
  },

  // Interactive Verification Demo Candidate: MG-2026-018
  {
    id: 'c-018',
    reference_number: 'MG-2026-018',
    status: 'Awaiting community verification',
    urgency: 'high',
    original_language: 'en',
    original_text: 'The water in our community borehole in Ward 14 near the tailings dam has turned a dark grey color and tastes strongly metallic. Children in three households have developed stomach cramps.',
    translated_text: null,
    category: 'Water & Pollution',
    subcategory: 'Possible water contamination',
    project_id: 'p-mavambo',
    province: 'Mashonaland East',
    district: 'Goromonzi',
    ward: 'Ward 14',
    village_private: 'Chikwaka Village',
    date_first_noticed: '2026-09-08',
    ongoing: true,
    immediate_danger: true,
    requested_remedy: 'Immediate emergency clean water bowser delivery and water sample lab tests by EMA.',
    ai_confidence: 0.94,
    public_visibility: 'public_anonymous',
    created_at: '2026-09-10T08:30:00Z',
    updated_at: '2026-09-19T16:00:00Z',
    routes: [
      { authority_id: 'ema', reason: 'Statutory jurisdiction over effluent discharge and water quality standards', confidence: 0.95 },
      { authority_id: 'rdc', reason: 'Local authority responsible for communal drinking water assets', confidence: 0.82 }
    ],
    answers: {
      water_source: 'Deep borehole #4 serving 45 households',
      when_started: 'Noticed discolouration after heavy processing last week'
    },
    public_summary: 'Grey discolouration and metallic taste detected in borehole drinking water 800m downstream from tailings perimeter.',
    trust_label: 'Community reported',
    geolocation: {
      latitude: -17.8284,
      longitude: 31.3541,
      accuracy: 8,
      location_name: 'Ward 14 Borehole #4 (Chikwaka)',
      is_approximate: false,
      share_precision: 'precise',
      consent_given: true,
      sensitive_location_protected: false
    },
    evidence_items: ['Photograph of discoloured water in glass', 'Borehole GPS coordinate tag'],
    evidence_completeness: 'Some supporting evidence',
    matched_obligations: [
      {
        obligation_id: 'reg-ema-s57',
        title: 'Water Pollution Control & Discharge Prohibition',
        legal_instrument: 'Environmental Management Act [Chapter 20:27]',
        clause: 'Section 57(1)',
        requirement: 'Prohibits discharge of poisonous, toxic, or polluting matter into watercourses or ground aquifers used for domestic supply.',
        match_strength: 'Strong obligation match',
        potential_remedy: 'Potential formal remedy / escalation pathway: Submission of statutory water audit order; deployment of emergency potable water tankers; and environmental protection order pursuant to EMA Act Section 67.',
        source_name: 'Environmental Management Agency (EMA)',
        source_organisation: 'Government of Zimbabwe',
        source_url: 'https://www.ema.co.zw/legislation/environmental-management-act',
        version_date: 'Revised Edition 2018',
        last_verified_at: '2026-08-15',
        plain_explanation: 'Mining operators are legally required to prevent processing chemicals and tailings dam leachate from infiltrating communal drinking water boreholes or surface streams.'
      },
      {
        obligation_id: 'reg-esia-mavambo-6',
        title: 'Quarterly Ground Water Testing within 3km Buffer',
        legal_instrument: 'Mavambo Lithium Approved ESIA License Permit #EMA-2024-L89',
        clause: 'Condition 6.1 (Water Protection)',
        requirement: 'Operator must conduct bi-weekly heavy metal testing at all communal boreholes within 3km perimeter and publish lab certificates to RDC.',
        match_strength: 'Strong obligation match',
        potential_remedy: 'Potential formal remedy / escalation pathway: Provision of certified independent laboratory results to the community; deployment of clean drinking water tankers; replacement borehole drilling.',
        source_name: 'Environmental Management Agency (EMA)',
        source_organisation: 'EMA Mashonaland East',
        source_url: 'https://minevoice.demo/registry/esia-mavambo-2024.pdf',
        version_date: 'Certified Final ESIA Approval',
        last_verified_at: '2026-09-01',
        plain_explanation: 'Guarantees community boreholes are routinely checked and obligates the mine to provide free safe drinking water if testing reveals contamination.'
      }
    ],
    authority_resolution_claim: {
      claimed_at: '2026-09-19T14:00:00Z',
      authority_name: 'Environmental Management Agency (EMA)',
      action_summary: 'Borehole flushed, water testing completed, and temporary water bowsers delivered.',
      supporting_note: 'Operator water tankers deployed; chlorination treatment administered to Borehole #4.'
    },
    verification_feedback: null,
    demo_inspection: {
      inspector_name: 'T. Hove',
      inspector_title: 'EMA District Environmental Officer',
      assigned_date: '2026-09-12',
      priority: 'High Priority',
      proposed_inspection_date: '2026-09-14',
      status: 'Completed',
      inspection_note: 'Verified turbidity anomaly in Borehole #4; operator agreed to flush well casing and supply bowsers.',
      completed_date: '2026-09-16'
    },
    timeline: [
      {
        id: 't-18-1',
        date: '2026-09-10',
        title: 'Grievance submitted',
        actor: 'Community Reporter',
        status_code: 'Submitted by platform',
        description: 'Reported grey discolouration and metallic taste in communal borehole.',
        trust_label: 'Community reported'
      },
      {
        id: 't-18-2',
        date: '2026-09-10',
        title: 'AI-assisted classification: Water & Pollution',
        actor: 'MineVoice Engine',
        status_code: 'Ready for review',
        description: 'Potential obligation match identified: EMA Act Section 57(1) and ESIA Condition 6.1.',
        trust_label: 'Internal system'
      },
      {
        id: 't-18-3',
        date: '2026-09-11',
        title: 'Routed to EMA',
        actor: 'MineVoice Platform',
        status_code: 'Awaiting acknowledgement',
        description: 'Standardized dossier dispatched to EMA Goromonzi office.',
        trust_label: 'Internal system'
      },
      {
        id: 't-18-4',
        date: '2026-09-12',
        title: 'Authority acknowledgement received',
        actor: 'EMA Mashonaland East',
        status_code: 'Acknowledged',
        description: 'Case formally accepted by District Environmental Officer.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-18-5',
        date: '2026-09-13',
        title: 'Demo inspection assignment created within MineVoice',
        actor: 'EMA Mashonaland East',
        status_code: 'Inspection assigned',
        description: 'Inspector T. Hove assigned for on-site water quality check.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-18-6',
        date: '2026-09-16',
        title: 'Inspection completed',
        actor: 'Inspector T. Hove (EMA)',
        status_code: 'Inspection completed',
        description: 'Inspected borehole site; noted proximity of tailings outflow.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-18-7',
        date: '2026-09-18',
        title: 'Authority reported corrective action',
        actor: 'Mavambo Minerals Concession Liaison',
        status_code: 'Action reported',
        description: 'Emergency clean water bowser delivered daily to Chikwaka Village.',
        trust_label: 'Authority verified'
      },
      {
        id: 't-18-8',
        date: '2026-09-19',
        title: 'Authority marked issue resolved',
        actor: 'EMA Mashonaland East',
        status_code: 'Awaiting community verification',
        description: 'Authority marked resolved: Borehole flushed and water testing completed. Awaiting community verification.',
        trust_label: 'Authority verified'
      }
    ]
  },

  // Active Open Case 1: MG-2026-021
  {
    id: 'c-021',
    reference_number: 'MG-2026-021',
    status: 'Awaiting acknowledgement',
    urgency: 'high',
    original_language: 'sn',
    original_text: 'Rwizi rwaNyagui rwazara madhaka nemafuta anobva kumuchina wekugezesa lithium. Mombe dziri kuramba kunwa mvura.',
    translated_text: 'Nyagui stream is contaminated with mud sludge and processing oils from the lithium washing plant. Cattle are refusing to drink.',
    category: 'Water & Pollution',
    subcategory: 'Stream runoff & agricultural hazard',
    project_id: 'p-mavambo',
    province: 'Mashonaland East',
    district: 'Goromonzi',
    ward: 'Ward 14',
    village_private: 'Dzvete Village',
    date_first_noticed: '2026-09-14',
    ongoing: true,
    immediate_danger: true,
    requested_remedy: 'Divert processing plant drainage trenches away from grazing pastures.',
    ai_confidence: 0.92,
    public_visibility: 'public_anonymous',
    created_at: '2026-09-16T14:15:00Z',
    updated_at: '2026-09-16T14:15:00Z',
    routes: [
      { authority_id: 'ema', reason: 'Surface water pollution control and aquatic ecosystem protection', confidence: 0.96 },
      { authority_id: 'mines', reason: 'Regulation of mine site drainage and tailings retention', confidence: 0.88 }
    ],
    answers: {
      water_source: 'Nyagui stream tributary crossing Ward 14 communal grazing',
      when_started: 'Past 4 days following heavy processing'
    },
    public_summary: 'Runoff containing chemical sludge and froth reported along Nyagui stream tributary feeding cattle dipping tanks.',
    trust_label: 'Community reported',
    geolocation: {
      latitude: -17.8312,
      longitude: 31.3598,
      accuracy: 12,
      location_name: 'Nyagui Stream Crossing, Ward 14',
      is_approximate: false,
      share_precision: 'precise',
      consent_given: true,
      sensitive_location_protected: false
    },
    evidence_items: ['Photograph of foam on stream bank', 'Approximate date log'],
    evidence_completeness: 'Some supporting evidence',
    matched_obligations: [
      {
        obligation_id: 'reg-effluent-si6',
        title: 'Industrial Effluent and Siltation Prevention',
        legal_instrument: 'Environmental Management (Effluent and Solid Waste Disposal) Regulations SI 6 of 2007',
        clause: 'Section 4 & Table 1',
        requirement: 'Strict threshold limits on Total Dissolved Solids (<1000 mg/L) and turbidity in agricultural water sources.',
        match_strength: 'Strong obligation match',
        potential_remedy: 'Potential formal remedy / escalation pathway: Immediate water sampling by accredited EMA laboratory; installation of secondary containment berms around processing circuits.',
        source_name: 'Environmental Management Agency (EMA)',
        source_organisation: 'Government of Zimbabwe',
        source_url: 'https://www.ema.co.zw/effluent-standards-si6-2007',
        version_date: 'SI 6/2007 as amended',
        last_verified_at: '2026-08-15',
        plain_explanation: 'Sets exact numerical chemical and sediment limits for wastewater from mining sites before it reaches communal agricultural land.'
      }
    ],
    timeline: [
      {
        id: 't-21-1',
        date: '2026-09-16',
        title: 'Grievance submitted',
        actor: 'Community Reporter',
        status_code: 'Submitted by platform',
        description: 'Reported chemical sludge and froth along Nyagui stream tributary.',
        trust_label: 'Community reported'
      },
      {
        id: 't-21-2',
        date: '2026-09-16',
        title: 'Routed to EMA & Ministry of Mines',
        actor: 'MineVoice Platform',
        status_code: 'Awaiting acknowledgement',
        description: 'Dispatched to EMA Mashonaland East and District Mining Inspectorate.',
        trust_label: 'Internal system'
      }
    ]
  },

  // Active Open Case 2: MG-2026-019
  {
    id: 'c-019',
    reference_number: 'MG-2026-019',
    status: 'Acknowledged',
    urgency: 'medium',
    original_language: 'sn',
    original_text: 'Madhaka nemaguruva emarori ari kuwanda mumugwagwa wekubuda nawo matombo. Dzimba dzedu dzazara guruva uye mwana ari kukoshora.',
    translated_text: 'Heavy haulage dust along the transit corridor is excessive. Our houses are full of fine dust and children are coughing.',
    category: 'Air, Dust, Noise & Blasting',
    subcategory: 'Haul road dust emissions',
    project_id: 'p-mavambo',
    province: 'Mashonaland East',
    district: 'Goromonzi',
    ward: 'Ward 14',
    village_private: 'Munetsi Section',
    date_first_noticed: '2026-08-25',
    ongoing: true,
    immediate_danger: false,
    requested_remedy: 'Regular scheduled water bowser spraying on gravel access roads twice daily.',
    ai_confidence: 0.89,
    public_visibility: 'public_anonymous',
    created_at: '2026-09-12T09:10:00Z',
    updated_at: '2026-09-14T16:00:00Z',
    routes: [
      { authority_id: 'ema', reason: 'Air quality regulation and dust pollution prevention', confidence: 0.90 },
      { authority_id: 'rdc', reason: 'Gravel road maintenance and public health oversight', confidence: 0.84 }
    ],
    answers: {
      frequency: 'Continuous 30-tonne haulage trucks between 06:00 and 19:00',
      damage: 'Dust accumulation on crops and inside homes within 100m of road'
    },
    public_summary: 'Excessive airborne silica dust along unpaved 4km haul road passing through residential settlement.',
    trust_label: 'Community reported',
    geolocation: {
      latitude: -17.8241,
      longitude: 31.3489,
      accuracy: 15,
      location_name: 'Ward 14 Haulage Junction',
      is_approximate: false,
      share_precision: 'precise',
      consent_given: true,
      sensitive_location_protected: false
    },
    evidence_items: ['Photographs of dust plume behind haulage truck'],
    evidence_completeness: 'Some supporting evidence',
    matched_obligations: [
      {
        obligation_id: 'reg-esia-mavambo-4',
        title: 'Haul Road Dust Suppression & Mitigation',
        legal_instrument: 'Mavambo Lithium ESIA Commitments 2024',
        clause: 'Condition 4.2 (Air & Dust Control)',
        requirement: 'Continuous water-cart spraying at minimum 3-hour intervals during daylight operations on unpaved village transit roads; 30 km/h speed limit enforcement.',
        match_strength: 'Strong obligation match',
        potential_remedy: 'Potential formal remedy / escalation pathway: Submission of daily water truck run logs to Rural District Council; installation of speed humps; compensation for damaged roadside crops.',
        source_name: 'Environmental Management Agency (EMA) & Goromonzi RDC',
        source_organisation: 'Government of Zimbabwe',
        source_url: 'https://minevoice.demo/registry/esia-mavambo-2024.pdf',
        version_date: 'Certified Final ESIA Approval',
        last_verified_at: '2026-09-01',
        plain_explanation: 'A binding license commitment by the mining project to prevent heavy silica dust from entering classrooms and dwellings along transport routes.'
      }
    ],
    timeline: [
      {
        id: 't-19-1',
        date: '2026-09-12',
        title: 'Grievance submitted',
        actor: 'Community Reporter',
        status_code: 'Submitted by platform',
        description: 'Reported excessive dust along 4km transit corridor.',
        trust_label: 'Community reported'
      },
      {
        id: 't-19-2',
        date: '2026-09-14',
        title: 'Authority acknowledgement received',
        actor: 'Goromonzi RDC Engineering Department',
        status_code: 'Acknowledged',
        description: 'Council registered report and requested concession road log from operator.',
        trust_label: 'Authority verified'
      }
    ]
  },

  // Active Open Case 3: MG-2026-022
  {
    id: 'c-022',
    reference_number: 'MG-2026-022',
    status: 'Awaiting acknowledgement',
    urgency: 'high',
    original_language: 'en',
    original_text: 'Deep cracks have opened in walls of 6 homesteads following unannounced 3:00 PM blasting in Pit #2. No pre-warning horn was sounded.',
    translated_text: null,
    category: 'Air, Dust, Noise & Blasting',
    subcategory: 'Blasting shockwave structural damage',
    project_id: 'p-mavambo',
    province: 'Mashonaland East',
    district: 'Goromonzi',
    ward: 'Ward 14',
    village_private: 'Chikwaka South',
    date_first_noticed: '2026-09-17',
    ongoing: false,
    immediate_danger: true,
    requested_remedy: 'Structural engineer inspection and compensation for cracked brick structures.',
    ai_confidence: 0.93,
    public_visibility: 'public_anonymous',
    created_at: '2026-09-17T16:45:00Z',
    updated_at: '2026-09-17T16:45:00Z',
    routes: [
      { authority_id: 'mines', reason: 'Statutory blast safety regulations and vibration limits', confidence: 0.96 },
      { authority_id: 'company', reason: 'Community compensation procedure for blast impact', confidence: 0.88 }
    ],
    answers: {
      frequency: 'Intense heavy blasting twice a week without advance notice',
      damage: 'Wall cracks over 15mm width in six traditional brick dwellings'
    },
    public_summary: 'Severe structural wall cracking in residential dwellings following open-pit blasting without community siren notification.',
    trust_label: 'Community reported',
    geolocation: {
      latitude: -17.8268,
      longitude: 31.3512,
      accuracy: 10,
      location_name: 'Ward 14 Chikwaka South Homesteads',
      is_approximate: false,
      share_precision: 'precise',
      consent_given: true,
      sensitive_location_protected: false
    },
    evidence_items: ['Photographs of 15mm wall cracks with coin scale', 'Approximate date/time log (17 Sep, 15:00)'],
    evidence_completeness: 'Some supporting evidence',
    matched_obligations: [
      {
        obligation_id: 'reg-mines-si109',
        title: 'Blast Notification, Siren Protocol & Vibration Limits',
        legal_instrument: 'Mining (Management and Safety) Regulations SI 109 of 1990',
        clause: 'Sections 112 & 118',
        requirement: 'Audible siren 15 minutes before detonation, peak particle velocity (PPV) strictly monitored under 5mm/sec at nearest dwelling, pre-blast structural baseline surveys.',
        match_strength: 'Strong obligation match',
        potential_remedy: 'Potential formal remedy / escalation pathway: Joint blast inspection with Ministry of Mines Chief Government Mining Engineer and prompt structural remediation.',
        source_name: 'Ministry of Mines and Mining Development',
        source_organisation: 'Government of Zimbabwe',
        source_url: 'https://www.mines.gov.zw/regulations/si-109-1990',
        version_date: 'SI 109/1990 (Reprinted 2012)',
        last_verified_at: '2026-08-15',
        plain_explanation: 'Regulates blasting frequency, safety sirens, and shockwave limits to prevent stone flyover and cracked walls in surrounding homesteads.'
      }
    ],
    timeline: [
      {
        id: 't-22-1',
        date: '2026-09-17',
        title: 'Grievance submitted',
        actor: 'Community Reporter',
        status_code: 'Submitted by platform',
        description: 'Reported wall cracks in 6 homesteads following unannounced blast.',
        trust_label: 'Community reported'
      }
    ]
  },

  // Active Open Case 4: MG-2026-020
  {
    id: 'c-020',
    reference_number: 'MG-2026-020',
    status: 'Under review',
    urgency: 'low',
    original_language: 'en',
    original_text: 'Promised school renovations and solar electrification at Chikwaka Primary have stalled for 8 months despite signing the CSR pact.',
    translated_text: null,
    category: 'Community Commitments',
    subcategory: 'Delayed CSR infrastructure',
    project_id: 'p-mavambo',
    province: 'Mashonaland East',
    district: 'Goromonzi',
    ward: 'Ward 14',
    village_private: 'Chikwaka Primary',
    date_first_noticed: '2026-01-15',
    ongoing: true,
    immediate_danger: false,
    requested_remedy: 'Publication of CSR milestone timetable and community trust fund accounting.',
    ai_confidence: 0.95,
    public_visibility: 'public_anonymous',
    created_at: '2026-09-02T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z',
    routes: [
      { authority_id: 'company', reason: 'Direct corporate social responsibility commitment under signed MOU', confidence: 0.95 },
      { authority_id: 'rdc', reason: 'Local governance signatory to community development agreements', confidence: 0.85 }
    ],
    answers: {},
    public_summary: 'Community development memorandum timeline not adhered to for school solarization.',
    trust_label: 'Community reported',
    geolocation: {
      latitude: -17.8220,
      longitude: 31.3450,
      accuracy: 25,
      location_name: 'Chikwaka Primary School',
      is_approximate: true,
      share_precision: 'approximate',
      consent_given: true,
      sensitive_location_protected: true
    },
    evidence_items: ['Copy of signed 2023 Tripartite Accord Article 8'],
    evidence_completeness: 'Some supporting evidence',
    matched_obligations: [
      {
        obligation_id: 'reg-cda-tripartite',
        title: 'Community Development Agreement Social Investment',
        legal_instrument: 'Community Development Agreement (CDA) / RDC Tripartite Accord',
        clause: 'Article 8 (Education & Energy)',
        requirement: 'Disbursement of agreed community development fund tranches and semi-annual project progress reports to the community committee.',
        match_strength: 'Possible obligation match',
        potential_remedy: 'Potential formal remedy / escalation pathway: Convene tripartite compliance meeting between RDC, Headmaster, and Community Liaison Officer.',
        source_name: 'Goromonzi Rural District Council & Community Trust',
        source_organisation: 'Goromonzi RDC',
        source_url: 'https://minevoice.demo/registry/cda-goromonzi-2023.pdf',
        version_date: 'Signed Tripartite Accord',
        last_verified_at: '2026-08-10',
        plain_explanation: 'A formal agreement setting out the project’s local development obligations for schools and clinics in the mining host ward.'
      }
    ],
    timeline: [
      {
        id: 't-20-1',
        date: '2026-09-02',
        title: 'Grievance submitted',
        actor: 'Community Reporter',
        status_code: 'Submitted by platform',
        description: 'Submitted delayed school electrification report.',
        trust_label: 'Community reported'
      },
      {
        id: 't-20-2',
        date: '2026-09-05',
        title: 'Acknowledged and routed to RDC',
        actor: 'Goromonzi RDC',
        status_code: 'Under review',
        description: 'Forwarded to Social Services Committee for quarterly review.',
        trust_label: 'Authority verified'
      }
    ]
  }
];

const initialNotifications: InAppNotification[] = [
  {
    id: 'notif-1',
    title: 'Resolution Verification Required',
    message: 'The responsible authority has reported that MG-2026-018 (Borehole #4 Water) is resolved. Please verify if the issue was addressed.',
    type: 'verification',
    link_url: '/issues/MG-2026-018',
    created_at: '2026-09-19T14:05:00Z',
    read: false
  },
  {
    id: 'notif-2',
    title: 'EMA Acknowledged MG-2026-018',
    message: 'EMA District Officer formally acknowledged MG-2026-018 and assigned priority inspection.',
    type: 'acknowledgement',
    link_url: '/issues/MG-2026-018',
    created_at: '2026-09-12T10:15:00Z',
    read: true
  },
  {
    id: 'notif-3',
    title: 'Cluster Alert: Ward 14 Water Surge',
    message: 'Three new water-related grievances were reported near Mavambo Lithium Project within 14 days.',
    type: 'cluster',
    link_url: '/authority',
    created_at: '2026-09-16T15:00:00Z',
    read: false
  },
  {
    id: 'notif-4',
    title: 'Community Verified Resolution on MG-2026-011',
    message: 'Ward 14 Water Committee verified MG-2026-011 as Partially Resolved (water colour cleared; lab results pending).',
    type: 'resolution',
    link_url: '/issues/MG-2026-011',
    created_at: '2026-09-20T08:00:00Z',
    read: false
  }
];

const initialFollowTargets: FollowTarget[] = [
  {
    id: 'fol-1',
    type: 'project',
    target_id: 'p-mavambo',
    label: 'Mavambo Lithium Project',
    created_at: '2026-09-10T09:00:00Z'
  },
  {
    id: 'fol-2',
    type: 'ward',
    target_id: 'Ward 14',
    label: 'Ward 14 (Goromonzi)',
    created_at: '2026-09-10T09:05:00Z'
  }
];

const initialAccessLogs: CoordinateAccessLog[] = [
  {
    id: 'log-1',
    case_ref: 'MG-2026-018',
    user_role: 'EMA District Environmental Officer (T. Hove)',
    accessed_at: '2026-09-12T11:20:00Z',
    purpose: 'Field water sampling navigation and waypoint calibration'
  },
  {
    id: 'log-2',
    case_ref: 'MG-2026-011',
    user_role: 'EMA Mashonaland East Water Inspectorate',
    accessed_at: '2026-09-08T09:40:00Z',
    purpose: 'Communal spring containment audit and GPS ground verification'
  }
];

const initialLearningMetrics: LearningMetrics = {
  classification_accepted_pct: 87,
  classification_corrected_pct: 13,
  routing_accepted_pct: 82,
  routing_redirected_pct: 18,
  most_common_correction: 'Air & Noise → Blasting Structural Damage',
  authority_resolved_count: 18,
  community_verified_count: 12,
  community_partial_count: 4,
  community_disputed_count: 2,
  avg_days_to_verification: 2.8
};

export type SupportedLanguage = 'en' | 'sn' | 'nd' | 'sw';

interface AppState {
  cases: Case[];
  projects: Project[];
  authorities: Authority[];
  language: SupportedLanguage;
  notifications: InAppNotification[];
  followTargets: FollowTarget[];
  coordinateAccessLogs: CoordinateAccessLog[];
  learningMetrics: LearningMetrics;
  
  // Case operations
  addCase: (newCase: Case) => void;
  updateCaseStatus: (id: string, status: IssueStatus) => void;
  setLanguage: (lang: SupportedLanguage) => void;

  // Resolution verification loop
  submitCommunityVerification: (
    caseId: string,
    feedback: {
      verification: 'resolved' | 'partial' | 'disputed' | 'unable';
      notes: string;
      evidenceCount?: number;
      verifiedBy?: string;
    }
  ) => void;

  // Authority actions
  markAuthorityResolved: (
    caseId: string,
    actionSummary: string,
    supportingNote?: string
  ) => void;

  assignDemoInspection: (
    caseId: string,
    details: {
      inspector: string;
      priority: 'High Priority' | 'Standard' | 'Urgent Environmental Audit';
      proposed_date: string;
      note?: string;
    }
  ) => void;

  completeDemoInspection: (
    caseId: string,
    notes: string
  ) => void;

  // Alerts & Follows
  toggleFollow: (target: {
    type: 'project' | 'ward' | 'district' | 'issue' | 'category';
    target_id: string;
    label: string;
  }) => boolean;
  
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<InAppNotification, 'id' | 'created_at' | 'read'>) => void;

  // Privacy hardening
  logCoordinateAccess: (caseRef: string, userRole: string, purpose: string) => void;
  toggleSensitiveProtection: (caseId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cases: initialCases,
      projects: initialProjects,
      authorities: initialAuthorities,
      language: 'en',
      notifications: initialNotifications,
      followTargets: initialFollowTargets,
      coordinateAccessLogs: initialAccessLogs,
      learningMetrics: initialLearningMetrics,

      addCase: (newCase) => set((state) => {
        const notif: InAppNotification = {
          id: `notif-${Date.now()}`,
          title: `New Grievance Registered: ${newCase.reference_number}`,
          message: `Case ${newCase.reference_number} created in ${newCase.ward || newCase.district}. Routed to ${newCase.routes[0]?.authority_id?.toUpperCase() || 'Authority'}.`,
          type: 'obligation',
          link_url: `/issues/${newCase.reference_number}`,
          created_at: new Date().toISOString(),
          read: false
        };
        return {
          cases: [newCase, ...state.cases],
          notifications: [notif, ...state.notifications]
        };
      }),

      updateCaseStatus: (id, status) => set((state) => ({
        cases: state.cases.map(c => c.id === id ? { ...c, status, updated_at: new Date().toISOString() } : c)
      })),

      setLanguage: (language) => set({ language }),

      // Resolution verification workflow
      submitCommunityVerification: (caseId, feedback) => set((state) => {
        let newStatus: IssueStatus = 'Verified resolved';
        let statusTitle = 'Community verified resolution: VERIFIED RESOLVED';
        if (feedback.verification === 'partial') {
          newStatus = 'Partially resolved';
          statusTitle = 'Community verified resolution: PARTIALLY RESOLVED';
        } else if (feedback.verification === 'disputed') {
          newStatus = 'Resolution disputed';
          statusTitle = 'Community disputed resolution: RESOLUTION DISPUTED';
        } else if (feedback.verification === 'unable') {
          newStatus = 'Unable to verify';
          statusTitle = 'Community response: UNABLE TO VERIFY';
        }

        const now = new Date().toISOString();
        const updatedCases = state.cases.map(c => {
          if (c.id !== caseId && c.reference_number !== caseId) return c;

          const verificationObj: CommunityVerificationFeedback = {
            case_id: c.reference_number,
            authority_claimed_resolution: true,
            community_verification: feedback.verification,
            verification_notes: feedback.notes,
            verified_at: now,
            evidence_count: feedback.evidenceCount || 0,
            verified_by: feedback.verifiedBy || 'Community Reporter'
          };

          const newTimelineEvent: TimelineEvent = {
            id: `t-verify-${Date.now()}`,
            date: now.split('T')[0],
            title: statusTitle,
            actor: feedback.verifiedBy || 'Community Reporter',
            actor_role: 'Affected Community Member',
            status_code: newStatus,
            description: feedback.notes || `Community verification recorded: ${feedback.verification}`,
            trust_label: 'Community reported'
          };

          return {
            ...c,
            status: newStatus,
            updated_at: now,
            verification_feedback: verificationObj,
            timeline: [...(c.timeline || []), newTimelineEvent]
          };
        });

        // Update learning metrics
        const updatedLearning = {
          ...state.learningMetrics,
          community_verified_count: feedback.verification === 'resolved' 
            ? state.learningMetrics.community_verified_count + 1 
            : state.learningMetrics.community_verified_count,
          community_partial_count: feedback.verification === 'partial' 
            ? state.learningMetrics.community_partial_count + 1 
            : state.learningMetrics.community_partial_count,
          community_disputed_count: feedback.verification === 'disputed' 
            ? state.learningMetrics.community_disputed_count + 1 
            : state.learningMetrics.community_disputed_count,
        };

        const targetCase = state.cases.find(c => c.id === caseId || c.reference_number === caseId);
        const ref = targetCase?.reference_number || caseId;

        const notif: InAppNotification = {
          id: `notif-${Date.now()}`,
          title: `Verification Recorded for ${ref}`,
          message: `Community verified status: ${newStatus}. Notes: ${feedback.notes || 'None'}`,
          type: 'verification',
          link_url: `/issues/${ref}`,
          created_at: now,
          read: false
        };

        return {
          cases: updatedCases,
          learningMetrics: updatedLearning,
          notifications: [notif, ...state.notifications]
        };
      }),

      markAuthorityResolved: (caseId, actionSummary, supportingNote) => set((state) => {
        const now = new Date().toISOString();
        const updatedCases = state.cases.map(c => {
          if (c.id !== caseId && c.reference_number !== caseId) return c;

          const resolutionClaim = {
            claimed_at: now,
            authority_name: 'Environmental Management Agency (EMA)',
            action_summary: actionSummary,
            supporting_note: supportingNote
          };

          const event1: TimelineEvent = {
            id: `t-auth-act-${Date.now()}`,
            date: now.split('T')[0],
            title: 'Authority reported corrective action',
            actor: 'Environmental Management Agency (EMA)',
            actor_role: 'District Environmental Officer',
            status_code: 'Action reported',
            description: actionSummary,
            trust_label: 'Authority verified'
          };

          const event2: TimelineEvent = {
            id: `t-auth-res-${Date.now() + 1}`,
            date: now.split('T')[0],
            title: 'Authority marked issue resolved — Awaiting Community Verification',
            actor: 'Environmental Management Agency (EMA)',
            actor_role: 'District Environmental Officer',
            status_code: 'Awaiting community verification',
            description: 'The responsible authority has reported resolution. Public case is now awaiting community verification.',
            trust_label: 'Authority verified'
          };

          return {
            ...c,
            status: 'Awaiting community verification' as IssueStatus,
            updated_at: now,
            authority_resolution_claim: resolutionClaim,
            timeline: [...(c.timeline || []), event1, event2]
          };
        });

        const targetCase = state.cases.find(c => c.id === caseId || c.reference_number === caseId);
        const ref = targetCase?.reference_number || caseId;

        const notif: InAppNotification = {
          id: `notif-${Date.now()}`,
          title: `Action Reported on ${ref}`,
          message: `Authority reported resolution: "${actionSummary}". Awaiting community verification.`,
          type: 'resolution',
          link_url: `/issues/${ref}`,
          created_at: now,
          read: false
        };

        return {
          cases: updatedCases,
          notifications: [notif, ...state.notifications],
          learningMetrics: {
            ...state.learningMetrics,
            authority_resolved_count: state.learningMetrics.authority_resolved_count + 1
          }
        };
      }),

      assignDemoInspection: (caseId, details) => set((state) => {
        const now = new Date().toISOString();
        const updatedCases = state.cases.map(c => {
          if (c.id !== caseId && c.reference_number !== caseId) return c;

          const assignment: DemoInspectionAssignment = {
            inspector_name: details.inspector,
            inspector_title: 'EMA District Environmental Officer',
            assigned_date: now.split('T')[0],
            priority: details.priority,
            proposed_inspection_date: details.proposed_date,
            status: 'Assigned',
            inspection_note: details.note
          };

          const event: TimelineEvent = {
            id: `t-disp-${Date.now()}`,
            date: now.split('T')[0],
            title: 'Demo inspection assignment created within MineVoice',
            actor: details.inspector,
            actor_role: 'EMA Inspection Unit (Simulated Assignment)',
            status_code: 'Inspection assigned',
            description: `Inspector ${details.inspector} assigned with ${details.priority}. Proposed field visit date: ${details.proposed_date}. Note: Demo inspection dispatch recorded within MineVoice.`,
            trust_label: 'Authority verified'
          };

          return {
            ...c,
            status: 'Inspection assigned' as IssueStatus,
            updated_at: now,
            demo_inspection: assignment,
            timeline: [...(c.timeline || []), event]
          };
        });

        const targetCase = state.cases.find(c => c.id === caseId || c.reference_number === caseId);
        const ref = targetCase?.reference_number || caseId;

        const notif: InAppNotification = {
          id: `notif-${Date.now()}`,
          title: `Inspection Assigned: ${ref}`,
          message: `Demo inspection assigned to ${details.inspector} (${details.priority}) for ${details.proposed_date}.`,
          type: 'inspection',
          link_url: `/issues/${ref}`,
          created_at: now,
          read: false
        };

        return {
          cases: updatedCases,
          notifications: [notif, ...state.notifications]
        };
      }),

      completeDemoInspection: (caseId, notes) => set((state) => {
        const now = new Date().toISOString();
        const updatedCases = state.cases.map(c => {
          if (c.id !== caseId && c.reference_number !== caseId) return c;

          const updatedAssignment: DemoInspectionAssignment = {
            ...(c.demo_inspection || {
              inspector_name: 'T. Hove',
              inspector_title: 'EMA District Environmental Officer',
              assigned_date: now.split('T')[0],
              priority: 'High Priority',
              proposed_inspection_date: now.split('T')[0],
              status: 'Completed'
            }),
            status: 'Completed',
            inspection_note: notes,
            completed_date: now.split('T')[0]
          };

          const event: TimelineEvent = {
            id: `t-comp-${Date.now()}`,
            date: now.split('T')[0],
            title: 'Inspection completed (Field sampling logged)',
            actor: updatedAssignment.inspector_name,
            actor_role: updatedAssignment.inspector_title,
            status_code: 'Inspection completed',
            description: notes || 'Field inspection completed and environmental sample logged for verification.',
            trust_label: 'Authority verified'
          };

          return {
            ...c,
            status: 'Under review' as IssueStatus,
            updated_at: now,
            demo_inspection: updatedAssignment,
            timeline: [...(c.timeline || []), event]
          };
        });

        return { cases: updatedCases };
      }),

      toggleFollow: (target) => {
        let isFollowing = false;
        set((state) => {
          const existing = state.followTargets.find(f => f.type === target.type && f.target_id === target.target_id);
          if (existing) {
            isFollowing = false;
            return {
              followTargets: state.followTargets.filter(f => f.id !== existing.id)
            };
          } else {
            isFollowing = true;
            const newFollow: FollowTarget = {
              id: `fol-${Date.now()}`,
              ...target,
              created_at: new Date().toISOString()
            };
            return {
              followTargets: [...state.followTargets, newFollow]
            };
          }
        });
        return isFollowing;
      },

      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      addNotification: (notif) => set((state) => ({
        notifications: [
          {
            ...notif,
            id: `notif-${Date.now()}`,
            created_at: new Date().toISOString(),
            read: false
          },
          ...state.notifications
        ]
      })),

      logCoordinateAccess: (caseRef, userRole, purpose) => set((state) => ({
        coordinateAccessLogs: [
          {
            id: `log-${Date.now()}`,
            case_ref: caseRef,
            user_role: userRole,
            accessed_at: new Date().toISOString(),
            purpose: purpose
          },
          ...state.coordinateAccessLogs
        ]
      })),

      toggleSensitiveProtection: (caseId) => set((state) => ({
        cases: state.cases.map(c => {
          if (c.id !== caseId && c.reference_number !== caseId) return c;
          if (!c.geolocation) return c;
          return {
            ...c,
            geolocation: {
              ...c.geolocation,
              sensitive_location_protected: !c.geolocation.sensitive_location_protected,
              is_approximate: true
            }
          };
        })
      }))
    }),
    {
      name: 'minevoice-storage-v2',
    }
  )
);
