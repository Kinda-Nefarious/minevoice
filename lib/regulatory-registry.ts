export interface RegulatorySource {
  id: string;
  title: string;
  authority: string;
  jurisdiction: string;
  document_type: 'Act of Parliament' | 'Statutory Instrument' | 'ESIA License Permit' | 'Community Agreement' | 'Policy Standard';
  citation: string;
  source_url: string;
  publication_date: string;
  effective_date: string;
  version: string;
  last_verified_at: string;
  active_status: boolean;
  clause: string;
  requirement: string;
  potential_remedy: string;
  plain_explanation: string;
  notes: string;
}

export const REGULATORY_SOURCE_REGISTRY: RegulatorySource[] = [
  {
    id: 'reg-ema-s57',
    title: 'Environmental Management Act [Chapter 20:27]',
    authority: 'Environmental Management Agency (EMA)',
    jurisdiction: 'Zimbabwe (National)',
    document_type: 'Act of Parliament',
    citation: 'Act 13/2002, Chapter 20:27, Section 57(1)',
    source_url: 'https://www.ema.co.zw/legislation/environmental-management-act',
    publication_date: '2003-03-14',
    effective_date: '2003-03-14',
    version: 'Revised Edition 2018',
    last_verified_at: '2026-08-15',
    active_status: true,
    clause: 'Section 57(1) - Prohibition against discharge of pollutants',
    requirement: 'No person shall discharge or emit any poison, toxic substance, or noxious matter into the aquatic environment or surface/ground water in contravention of prescribed environmental standards.',
    potential_remedy: 'Potential formal remedy / escalation pathway: Submission of statutory water audit order; deployment of emergency potable water tankers; and environmental protection order pursuant to EMA Act Section 67.',
    plain_explanation: 'Mining operators are legally required to prevent processing chemicals and tailings dam leachate from infiltrating communal drinking water boreholes or surface streams.',
    notes: 'Primary environmental mandate for surface and subterranean watercourse protection in Zimbabwe.'
  },
  {
    id: 'reg-effluent-si6',
    title: 'Environmental Management (Effluent and Solid Waste Disposal) Regulations',
    authority: 'Environmental Management Agency (EMA)',
    jurisdiction: 'Zimbabwe (National)',
    document_type: 'Statutory Instrument',
    citation: 'Statutory Instrument 6 of 2007',
    source_url: 'https://www.ema.co.zw/effluent-standards-si6-2007',
    publication_date: '2007-01-26',
    effective_date: '2007-01-26',
    version: 'SI 6/2007 as amended',
    last_verified_at: '2026-08-15',
    active_status: true,
    clause: 'Section 4 & Fourth Schedule, Table 1',
    requirement: 'Industrial and mineral processing effluent discharged or migrating into water resources must adhere to safe parameter thresholds, including Total Dissolved Solids (<1000 mg/L) and neutral pH range (6.0 - 9.0).',
    potential_remedy: 'Potential formal remedy / escalation pathway: Immediate water sampling by accredited EMA laboratory; installation of secondary containment berms around processing circuits.',
    plain_explanation: 'Sets exact numerical chemical and sediment limits for wastewater from mining sites before it reaches communal agricultural land.',
    notes: 'Governs licensing of industrial effluent disposal and classification of discharge permits.'
  },
  {
    id: 'reg-mines-si109',
    title: 'Mining (Management and Safety) Regulations',
    authority: 'Ministry of Mines and Mining Development',
    jurisdiction: 'Zimbabwe (National)',
    document_type: 'Statutory Instrument',
    citation: 'Statutory Instrument 109 of 1990',
    source_url: 'https://www.mines.gov.zw/regulations/si-109-1990',
    publication_date: '1990-05-18',
    effective_date: '1990-06-01',
    version: 'SI 109/1990 (Reprinted 2012)',
    last_verified_at: '2026-08-15',
    active_status: true,
    clause: 'Sections 112, 115 & 118 - Blasting Precautions and Surface Protection',
    requirement: 'Operators conducting open-cast blasting must give audible siren warning at least 15 minutes prior to detonation, adhere to peak particle velocity (PPV) vibration thresholds under 5mm/sec at nearest dwellings, and conduct pre-blast structural surveys.',
    potential_remedy: 'Potential formal remedy / escalation pathway: On-site seismic vibration audit by Chief Government Mining Engineer; mandatory structural survey of damaged residential dwellings.',
    plain_explanation: 'Regulates blasting frequency, safety sirens, and shockwave limits to prevent stone flyover and cracked walls in surrounding homesteads.',
    notes: 'Authorised inspectors have statutory authority to suspend blasting operations in case of structural safety risks.'
  },
  {
    id: 'reg-esia-mavambo-4',
    title: 'Mavambo Lithium Environmental and Social Impact Assessment (ESIA) License',
    authority: 'Environmental Management Agency (EMA) & Goromonzi RDC',
    jurisdiction: 'Goromonzi District, Mashonaland East',
    document_type: 'ESIA License Permit',
    citation: 'License EMA-2024-L89, Schedule B',
    source_url: 'https://minevoice.demo/registry/esia-mavambo-2024.pdf',
    publication_date: '2024-03-20',
    effective_date: '2024-04-01',
    version: 'Certified Final ESIA Approval',
    last_verified_at: '2026-09-01',
    active_status: true,
    clause: 'Condition 4.2 - Haulage Corridor Dust Suppression & Traffic Safety',
    requirement: 'Operator must conduct continuous water bowser spraying along the 4km unpaved village haul road at minimum 3-hour intervals during daylight operations, install speed limiters (30km/h), and maintain written logs for council inspection.',
    potential_remedy: 'Potential formal remedy / escalation pathway: Submission of daily water truck run logs to Rural District Council; installation of speed humps; compensation for damaged roadside crops.',
    plain_explanation: 'A binding license commitment by the mining project to prevent heavy silica dust from entering classrooms and dwellings along transport routes.',
    notes: 'Condition was specifically requested by Ward 14 community representatives during public consultation.'
  },
  {
    id: 'reg-esia-mavambo-6',
    title: 'Mavambo Lithium Ground Water Protection & Monitoring Agreement',
    authority: 'Environmental Management Agency (EMA)',
    jurisdiction: 'Goromonzi District, Mashonaland East',
    document_type: 'ESIA License Permit',
    citation: 'License EMA-2024-L89, Schedule C',
    source_url: 'https://minevoice.demo/registry/esia-mavambo-2024.pdf',
    publication_date: '2024-03-20',
    effective_date: '2024-04-01',
    version: 'Certified Final ESIA Approval',
    last_verified_at: '2026-09-01',
    active_status: true,
    clause: 'Condition 6.1 - Community Borehole Monitoring & Safe Water Guarantee',
    requirement: 'The project must test all 6 communal boreholes within a 3km radius of the tailings storage facility bi-weekly for lithium salts and heavy metals, publish certified results to the Ward councillor, and supply treated water bowsers within 24 hours of any anomaly.',
    potential_remedy: 'Potential formal remedy / escalation pathway: Provision of certified independent laboratory results to the community; deployment of clean drinking water tankers; replacement borehole drilling.',
    plain_explanation: 'Guarantees community boreholes are routinely checked and obligates the mine to provide free safe drinking water if testing reveals contamination.',
    notes: 'Standard protective covenant for chemical mineral processing licenses in communal catchment zones.'
  },
  {
    id: 'reg-cda-tripartite',
    title: 'Goromonzi Lithium Community Development Agreement (CDA)',
    authority: 'Goromonzi Rural District Council & Community Trust',
    jurisdiction: 'Goromonzi District, Ward 14',
    document_type: 'Community Agreement',
    citation: 'CDA Accord Tripartite Memorandum 2023, Article 8',
    source_url: 'https://minevoice.demo/registry/cda-goromonzi-2023.pdf',
    publication_date: '2023-11-10',
    effective_date: '2024-01-01',
    version: 'Signed Tripartite Accord',
    last_verified_at: '2026-08-10',
    active_status: true,
    clause: 'Article 8 - Social Infrastructure and Education Electrification',
    requirement: 'Operator must disburse scheduled community trust fund tranches for Chikwaka Primary School solarization and classroom refurbishment, with semi-annual accountability reports presented to the community assembly.',
    potential_remedy: 'Potential formal remedy / escalation pathway: Convening of tripartite dispute resolution meeting between RDC Chief Executive Officer, School Development Committee, and Mine Liaison Officer.',
    plain_explanation: 'A formal agreement setting out the project’s local development obligations for schools and clinics in the mining host ward.',
    notes: 'Signed under the Rural District Councils Act community empowerment framework.'
  }
];

export function getVerifiedRegulatorySource(id: string): RegulatorySource | null {
  return REGULATORY_SOURCE_REGISTRY.find(r => r.id === id) || null;
}

export function getAllRegulatorySources(): RegulatorySource[] {
  return REGULATORY_SOURCE_REGISTRY;
}
