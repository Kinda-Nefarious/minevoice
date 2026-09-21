export interface EscalationRule {
  id: string;
  trigger_condition: 'overdue_acknowledgement' | 'no_action_update' | 'disputed_resolution' | 'high_urgency_unacknowledged' | 'statutory_inspection_overdue';
  authority_id: string;
  category?: string;
  days_threshold: number;
  title: string;
  suggested_action: string;
  why_suggested: string;
  source_rule: string;
  escalation_target: string;
  contact_guidance: string;
}

export const CONFIGURED_ESCALATION_RULES: EscalationRule[] = [
  {
    id: 'ESC-EMA-ACK-05',
    trigger_condition: 'overdue_acknowledgement',
    authority_id: 'ema',
    days_threshold: 5,
    title: 'EMA Standard Client Charter Follow-up',
    suggested_action: 'Submit formal reminder to the District Environmental Officer citing reference number; request priority queue assessment for drinking water or chemical spill reports.',
    why_suggested: 'Under the Environmental Management Agency Client Charter, formal public environmental alerts must receive preliminary administrative acknowledgement within 5 working days.',
    source_rule: 'EMA Client Service Charter (2022 Revision), Section 4.1: Citizen Incident Intake Standard',
    escalation_target: 'EMA Provincial Environmental Manager, Mashonaland East',
    contact_guidance: 'Can be submitted via platform inquiry or direct delivery to Goromonzi District EMA Office.'
  },
  {
    id: 'ESC-MINES-SAFETY-07',
    trigger_condition: 'overdue_acknowledgement',
    authority_id: 'mines',
    days_threshold: 5,
    title: 'Mining Safety Inspectorate Alert',
    suggested_action: 'Escalate to the Provincial Mining Director (Mashonaland East) and Chief Government Mining Engineer requesting a joint seismic and structural inspection.',
    why_suggested: 'Open-cast blasting damage and ground vibration concerns pose life safety risks and require technical verification under statutory mining safety guidelines.',
    source_rule: 'Mining (Management and Safety) Regulations SI 109/1990, Part IV: Blasting and Surface Protection Guidelines',
    escalation_target: 'Chief Government Mining Engineer, Ministry of Mines and Mining Development',
    contact_guidance: 'Formal petition via District Mining Office, Harare/Goromonzi Regional Inspectorate.'
  },
  {
    id: 'ESC-EMA-ACTION-14',
    trigger_condition: 'no_action_update',
    authority_id: 'ema',
    days_threshold: 14,
    title: 'Environmental Protection Directive Request',
    suggested_action: 'Request publication of official laboratory water sampling certificate and issue of Section 67 Environmental Protection Order if contaminants exceed SI 6/2007 thresholds.',
    why_suggested: 'More than 14 days have elapsed without documented field sampling or water testing results being made accessible to affected community boreholes.',
    source_rule: 'Environmental Management Act [Cap 20:27], Section 67 (Orders for Protection of Environment) & Section 57',
    escalation_target: 'EMA Director-General, Environmental Protection Directorate',
    contact_guidance: 'Coordinated through Ward 14 Environmental Subcommittee and accredited civil society monitors.'
  },
  {
    id: 'ESC-DISPUTED-COMMUNITY-01',
    trigger_condition: 'disputed_resolution',
    authority_id: 'any',
    days_threshold: 0,
    title: 'Independent Verification & Multi-Stakeholder Review',
    suggested_action: 'Convene an extraordinary tripartite review meeting between Community Representatives, District Administrator, and Operator; seek independent third-party testing.',
    why_suggested: 'The authority claimed corrective action has been taken, but community feedback indicates the underlying issue persists or laboratory proof was withheld.',
    source_rule: 'MineVoice Standard Civic Accountability Protocol & Community Development Agreement Dispute Clause 14',
    escalation_target: 'Goromonzi District Development Coordinator (DDC) & Zimbabwe Environmental Law Association (ZELA)',
    contact_guidance: 'Civil society legal clinics provide pro-bono assistance for community water and relocation audits.'
  },
  {
    id: 'ESC-RDC-CSR-21',
    trigger_condition: 'no_action_update',
    authority_id: 'rdc',
    days_threshold: 21,
    title: 'Council Tripartite Accord Enforcement',
    suggested_action: 'Table formal grievance at the upcoming Rural District Council Environment and Social Services Committee meeting.',
    why_suggested: 'Delayed infrastructure commitments or unfulfilled school electrification pacts require legislative council oversight and trust fund disclosure.',
    source_rule: 'Rural District Councils Act [Chapter 29:13], Section 71 & Signed Community Development Agreement',
    escalation_target: 'Chief Executive Officer, Goromonzi Rural District Council',
    contact_guidance: 'Accessible through elected Ward 14 Councillor and Council Secretariat.'
  }
];

export interface EscalationAssessment {
  days_awaiting_acknowledgement: number;
  days_under_review: number;
  has_acknowledgement: boolean;
  last_update_days_ago: number;
  is_overdue_acknowledgement: boolean;
  suggested_rule: EscalationRule | null;
  status_explanation: string;
}

export function evaluateEscalation(
  status: string,
  created_at: string,
  updated_at: string,
  primary_authority_id: string,
  category: string
): EscalationAssessment {
  const now = new Date('2026-09-20T10:00:00Z'); // Current platform evaluation anchor
  const createdDate = new Date(created_at);
  const updatedDate = new Date(updated_at);

  const diffMs = now.getTime() - createdDate.getTime();
  const daysTotal = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const updateDiffMs = now.getTime() - updatedDate.getTime();
  const daysSinceUpdate = Math.max(0, Math.floor(updateDiffMs / (1000 * 60 * 60 * 24)));

  const isAcknowledged = !['Awaiting acknowledgement', 'Submitted by platform', 'Ready for review', 'Draft'].includes(status);
  const isDisputed = status === 'Resolution disputed';

  let suggested_rule: EscalationRule | null = null;
  let statusExplanation = '';

  if (isDisputed) {
    suggested_rule = CONFIGURED_ESCALATION_RULES.find(r => r.trigger_condition === 'disputed_resolution') || null;
    statusExplanation = 'Community has officially disputed the reported resolution. Tripartite dispute escalation recommended.';
  } else if (!isAcknowledged) {
    if (daysTotal >= 5) {
      suggested_rule = CONFIGURED_ESCALATION_RULES.find(r => 
        r.trigger_condition === 'overdue_acknowledgement' && (r.authority_id === primary_authority_id || r.authority_id === 'ema')
      ) || null;
      statusExplanation = `Awaiting formal acknowledgement for ${daysTotal} days (threshold: 5 days).`;
    } else {
      statusExplanation = `Submitted ${daysTotal} days ago; within normal 5-day acknowledgement window.`;
    }
  } else if (status === 'Under review' || status === 'Action reported' || status === 'Inspection assigned') {
    if (daysSinceUpdate >= 10) {
      suggested_rule = CONFIGURED_ESCALATION_RULES.find(r => 
        r.trigger_condition === 'no_action_update' && (r.authority_id === primary_authority_id || r.authority_id === 'ema')
      ) || null;
      statusExplanation = `Case under review with no new progress recorded for ${daysSinceUpdate} days.`;
    } else {
      statusExplanation = `Currently under active review by ${primary_authority_id.toUpperCase()}. Last updated ${daysSinceUpdate} days ago.`;
    }
  }

  return {
    days_awaiting_acknowledgement: isAcknowledged ? 2 : daysTotal,
    days_under_review: isAcknowledged ? daysTotal - 2 : 0,
    has_acknowledgement: isAcknowledged,
    last_update_days_ago: daysSinceUpdate,
    is_overdue_acknowledgement: !isAcknowledged && daysTotal >= 5,
    suggested_rule,
    status_explanation: statusExplanation
  };
}
