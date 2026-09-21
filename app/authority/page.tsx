'use client';
import { useState } from 'react';
import { useAppStore, IssueStatus, MatchedObligation } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { evaluateEscalation } from '@/lib/escalation-rules';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Scale, 
  Layers, 
  Send, 
  BarChart3, 
  Activity, 
  Check, 
  Compass,
  Radio,
  FileCheck2,
  AlertCircle,
  XCircle,
  HelpCircle,
  UserCheck,
  Building,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function AuthorityPortal() {
  const cases = useAppStore(state => state.cases);
  const updateCaseStatus = useAppStore(state => state.updateCaseStatus);
  const markAuthorityResolved = useAppStore(state => state.markAuthorityResolved);
  const assignDemoInspection = useAppStore(state => state.assignDemoInspection);
  const learningMetrics = useAppStore(state => state.learningMetrics);
  const { t } = useTranslation();

  // Navigation states
  const [mainView, setMainView] = useState<'inbox' | 'needs_attention' | 'obligations' | 'verification' | 'analytics' | 'learning'>('inbox');
  const [activeTab, setActiveTab] = useState<'Awaiting' | 'Under review' | 'Resolved'>('Awaiting');
  const [dispatchedActions, setDispatchedActions] = useState<Record<string, string>>({});
  const [selectedRadarPin, setSelectedRadarPin] = useState<string | null>(null);

  // Modals for Actions
  const [resolveModalCaseId, setResolveModalCaseId] = useState<string | null>(null);
  const [resolveActionSummary, setResolveActionSummary] = useState('');
  const [resolveSupportingNote, setResolveSupportingNote] = useState('');

  const [dispatchModalCaseId, setDispatchModalCaseId] = useState<string | null>(null);
  const [dispatchInspector, setDispatchInspector] = useState('T. Hove (EMA District Environmental Officer)');
  const [dispatchPriority, setDispatchPriority] = useState<'High Priority' | 'Standard' | 'Urgent Environmental Audit'>('High Priority');
  const [dispatchDate, setDispatchDate] = useState('2026-09-22');
  const [dispatchNote, setDispatchNote] = useState('Conduct water sampling at Chikwaka borehole #4 and inspect tailings retention wall.');

  // For demo, filter EMA-routed cases
  const emaCases = cases.filter(c => c.routes.some(r => r.authority_id === 'ema'));

  // Needs Attention cases: evaluated using escalation rules
  const needsAttentionCases = emaCases.filter(c => {
    const esc = evaluateEscalation(c.status, c.created_at, c.updated_at, 'ema', c.category);
    return esc.suggested_rule !== null || c.urgency === 'high' || esc.days_under_review > 10;
  });

  // Community verification cases: cases that are in verification loop
  const verificationCases = emaCases.filter(c => 
    c.status === 'Awaiting community verification' || 
    c.status === 'Verified resolved' || 
    c.status === 'Partially resolved' || 
    c.status === 'Resolution disputed' ||
    c.verification_feedback !== null ||
    c.authority_resolution_claim !== null
  );

  const filteredCases = emaCases.filter(c => {
    if (activeTab === 'Awaiting') return c.status === 'Awaiting acknowledgement';
    if (activeTab === 'Under review') {
      return c.status === 'Acknowledged' || 
             c.status === 'Under review' || 
             c.status === 'Action reported' || 
             c.status === 'Inspection assigned' ||
             c.status === 'Inspection completed' ||
             c.status === 'Information requested';
    }
    return c.status === 'Resolved' || 
           c.status === 'Verified resolved' || 
           c.status === 'Partially resolved' || 
           c.status === 'Awaiting community verification' ||
           c.status === 'Resolution disputed' ||
           c.status === 'Closed without resolution';
  });

  const handleOpenResolveModal = (id: string) => {
    setResolveModalCaseId(id);
    setResolveActionSummary('Flushed communal borehole and reinforced chemical slurry diversion trench.');
    setResolveSupportingNote('Water testing laboratory samples collected for 48-hour testing.');
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalCaseId) return;
    markAuthorityResolved(resolveModalCaseId, resolveActionSummary, resolveSupportingNote);
    setResolveModalCaseId(null);
  };

  const handleOpenDispatchModal = (id: string) => {
    setDispatchModalCaseId(id);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalCaseId) return;
    assignDemoInspection(dispatchModalCaseId, {
      inspector: dispatchInspector,
      priority: dispatchPriority,
      proposed_date: dispatchDate,
      note: dispatchNote
    });
    setDispatchModalCaseId(null);
  };

  // Pre-calculated Cluster data
  const clusters = [
    {
      id: 'cluster-water-ward14',
      title: 'Ward 14 - Water Contamination Surge (Tailings Dam Runoff)',
      category: 'Water & Pollution',
      risk: 'high',
      riskScore: 94,
      casesCount: 2,
      caseRefs: ['MG-2025-1082', 'MG-2025-1084', 'MG-2026-011'],
      centerGps: '-17.8284, 31.3541',
      radius: '450m radius',
      receptors: 'Chikwaka Communal Borehole #4, Nyagui River tributary, communal dipping tank',
      primaryStatute: 'EMA Act [Cap 20:27] Section 57 & Effluent Standards SI 6 of 2007',
      statutoryClause: 'Clause 6.1 (Zero unpermitted discharge to community aquifers)',
      recommendedAction: 'Issue 48-Hour Statutory Water Quality Audit & Deploy Potable Water Tankers to Chikwaka Village',
      dispatchDirective: 'Demo inspection assignment created within MineVoice for EMA rapid water-sampling unit.'
    },
    {
      id: 'cluster-dust-ward14',
      title: 'Ward 14 Haulage Corridor - Severe Silica Dust & Pit #2 Blasting Cracks',
      category: 'Air, Dust, Noise & Blasting',
      risk: 'high',
      riskScore: 86,
      casesCount: 2,
      caseRefs: ['MG-2025-1083', 'MG-2025-1086'],
      centerGps: '-17.8241, 31.3489',
      radius: '800m corridor',
      receptors: 'Chikwaka Primary School perimeter, communal dwellings on main access route',
      primaryStatute: 'Mining (Management and Safety) Regulations SI 109 of 1990 & ESIA Condition 4.2',
      statutoryClause: 'Clause 4.2 (Continuous dust suppression on unpaved haul roads; PPV vibration limits)',
      recommendedAction: 'Mandate 3-hour water-cart suppression logs and Ministry of Mines seismic PPV verification',
      dispatchDirective: 'Demo inspection assignment created within MineVoice for road dust audit.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Banner */}
      <div className="mb-8 bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <span className="inline-flex items-center px-3 py-1 bg-slate-800 text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5 mr-1" />
            {t('auth_badge')}
          </span>
          <h1 className="text-3xl font-bold mb-2">{t('auth_title')}</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Institutional compliance, statutory obligation tracking, and two-stage community verification management.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="text-center px-5 py-3 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <div className="text-2xl font-bold text-emerald-400">{emaCases.filter(c => c.status === 'Awaiting acknowledgement').length}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{t('auth_tab_awaiting')}</div>
          </div>
          <div className="text-center px-5 py-3 bg-amber-950/60 rounded-2xl border border-amber-800/50">
            <div className="text-2xl font-bold text-amber-400">{needsAttentionCases.length}</div>
            <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mt-0.5">Needs Attention</div>
          </div>
          <div className="text-center px-5 py-3 bg-purple-950/60 rounded-2xl border border-purple-800/50">
            <div className="text-2xl font-bold text-purple-400">
              {emaCases.filter(c => c.status === 'Awaiting community verification').length}
            </div>
            <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider mt-0.5">Awaiting Verification</div>
          </div>
        </div>
      </div>

      {/* Main View Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
        <button
          onClick={() => setMainView('inbox')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainView === 'inbox' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Queue & Intake
        </button>

        <button
          onClick={() => setMainView('needs_attention')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainView === 'needs_attention' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Needs Attention
          {needsAttentionCases.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-800 text-white font-mono">
              {needsAttentionCases.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setMainView('verification')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainView === 'verification' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Community Verification Loop
        </button>

        <button
          onClick={() => setMainView('obligations')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainView === 'obligations' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          Potential Obligation Matches
        </button>

        <button
          onClick={() => setMainView('analytics')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainView === 'analytics' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Emerging Patterns & Radar
        </button>

        <button
          onClick={() => setMainView('learning')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainView === 'learning' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Audit & Learning Dashboard
        </button>
      </div>

      {/* DISPATCH INTEGRITY NOTICE (Requirement #9) */}
      <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">Civic Accountability Dispatch Integrity Note:</span>
          <p>
            Field assignments triggered in this portal are recorded as <strong className="text-slate-800">Demo inspection assignments created within MineVoice (Simulated Workflow)</strong>. They generate structured dispatch packages for statutory intake without claiming false government integration.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. NEEDS ATTENTION VIEW (Requirement #12)                 */}
      {/* ========================================================= */}
      {mainView === 'needs_attention' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Needs Attention: Escalation Proximity & Urgent Deadlines
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Grievances approaching statutory response deadlines or triggering configured escalation rules.
            </p>
          </div>

          <div className="space-y-4">
            {needsAttentionCases.map(c => {
              const esc = evaluateEscalation(c.status, c.created_at, c.updated_at, 'ema', c.category);

              return (
                <div key={c.id} className="p-6 bg-white border-2 border-amber-200 rounded-3xl shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-3 py-1 rounded-full">
                        {c.reference_number}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full">
                        {c.urgency.toUpperCase()} PRIORITY
                      </span>
                      <span className="text-xs text-slate-500">
                        {c.district}, {c.ward}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-slate-600">
                        Under Review: <strong>{esc.days_under_review} days</strong>
                      </span>
                      <span className="font-mono text-slate-600">
                        Last Update: <strong>{esc.last_update_days_ago} days ago</strong>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.category}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.public_summary}</p>
                  </div>

                  {esc.suggested_rule && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          Suggested Action: {esc.suggested_rule.suggested_action}
                        </span>
                        <span className="text-[10px] font-mono text-amber-800">
                          {esc.suggested_rule.id}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px]">
                        <strong>Why suggested:</strong> {esc.suggested_rule.why_suggested}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Source rule: {esc.suggested_rule.source_rule}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenDispatchModal(c.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Assign Demo Inspection
                    </button>
                    <button
                      onClick={() => handleOpenResolveModal(c.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Report Resolution
                    </button>
                    <Link
                      href={`/issues/${c.reference_number}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      View Public File
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. COMMUNITY VERIFICATION LOOP VIEW (Requirement #1)      */}
      {/* ========================================================= */}
      {mainView === 'verification' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-purple-700" />
              Two-Stage Community Verification Registry
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Tracking which institutional resolutions have been confirmed, partially confirmed, or disputed by affected mining communities.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Awaiting Community Confirmation</span>
              <span className="text-2xl font-bold text-purple-700 font-mono">
                {cases.filter(c => c.status === 'Awaiting community verification').length}
              </span>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Confirmed Fully Resolved</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono">
                {cases.filter(c => c.status === 'Verified resolved' || c.verification_feedback?.community_verification === 'resolved').length}
              </span>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Partially Resolved</span>
              <span className="text-2xl font-bold text-amber-700 font-mono">
                {cases.filter(c => c.status === 'Partially resolved' || c.verification_feedback?.community_verification === 'partial').length}
              </span>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Resolution Disputed</span>
              <span className="text-2xl font-bold text-rose-700 font-mono">
                {cases.filter(c => c.status === 'Resolution disputed' || c.verification_feedback?.community_verification === 'disputed').length}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {verificationCases.map(c => (
              <div key={c.id} className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-3 py-1 rounded-full">
                      {c.reference_number}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      c.status === 'Awaiting community verification' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                      c.status === 'Verified resolved' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                      c.status === 'Partially resolved' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                      'bg-rose-100 text-rose-900 border-rose-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(c.updated_at).toLocaleDateString()}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  {/* What the Authority Reported */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Authority Reported Action
                    </span>
                    <p className="font-bold text-slate-900 text-sm">
                      {c.authority_resolution_claim?.action_summary || 'Borehole flushed and chemical slurry diversion berm reinforced.'}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Reported by {c.authority_resolution_claim?.authority_name || 'EMA'}
                    </p>
                  </div>

                  {/* What the Community Verified */}
                  <div className={`p-4 rounded-2xl border space-y-1.5 ${
                    c.verification_feedback ? 'bg-emerald-50/50 border-emerald-200' : 'bg-purple-50/50 border-purple-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Community Verification
                    </span>
                    {c.verification_feedback ? (
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          Status: {c.verification_feedback.community_verification.toUpperCase()}
                        </p>
                        <p className="text-slate-700 text-xs mt-1">
                          &ldquo;{c.verification_feedback.verification_notes}&rdquo;
                        </p>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Verified by {c.verification_feedback.verified_by} ({new Date(c.verification_feedback.verified_at).toLocaleDateString()})
                        </p>
                      </div>
                    ) : (
                      <div className="text-purple-900 font-medium text-xs py-2">
                        Awaiting community verification feedback on public issue file.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    href={`/issues/${c.reference_number}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                  >
                    Open Case File <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. POTENTIAL OBLIGATION MATCHES (Requirements #6, #7, #8) */}
      {/* ========================================================= */}
      {mainView === 'obligations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-700" />
              Statutory Obligation & Compliance Registry
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Mapped against the verified Zimbabwean Environmental Management Act [Cap 20:27], Mining Regulations SI 109/1990, and concession ESIA conditions.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-3">
            <Scale className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Legal Classification Guardrails:</span>
              <p className="text-slate-700 mt-0.5">
                MineVoice helps organise and route information. It does not provide legal advice or determine legal liability. Obligation matches are designated as <em>potential matches</em> based on verified statutory instruments.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {cases
              .flatMap(c => (c.matched_obligations || []).map(ob => ({ ...ob, case_ref: c.reference_number, category: c.category })))
              .map((ob, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ob.title}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {ob.match_strength || 'Potential obligation match'}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-emerald-800">
                    {ob.legal_instrument} • {ob.clause}
                  </p>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Duty:</span> {ob.requirement}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                    <span className="font-bold text-emerald-950">Potential formal remedy / escalation pathway:</span>{' '}
                    {ob.potential_remedy}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Source: {ob.source_name} ({ob.version_date})</span>
                    <Link href={`/issues/${ob.case_ref}`} className="text-emerald-700 font-bold hover:underline">
                      Case {ob.case_ref}
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. AUDIT & LEARNING DASHBOARD (Requirement #14)           */}
      {/* ========================================================= */}
      {mainView === 'learning' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-700" />
              AI Routing, Classification & Verification Learning Metrics
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Tracking model performance, human corrections during intake, and community verification outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">AI Classification Accepted</span>
              <span className="text-3xl font-extrabold text-emerald-700 font-mono">
                {learningMetrics.classification_accepted_pct}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {learningMetrics.classification_corrected_pct}% corrected by reporter
              </span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Routing Accepted</span>
              <span className="text-3xl font-extrabold text-teal-700 font-mono">
                {learningMetrics.routing_accepted_pct}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {learningMetrics.routing_redirected_pct}% manually redirected
              </span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Resolutions Confirmed</span>
              <span className="text-3xl font-extrabold text-blue-700 font-mono">
                {learningMetrics.community_verified_count + learningMetrics.community_partial_count} / {learningMetrics.authority_resolved_count}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {learningMetrics.community_disputed_count} disputed resolution
              </span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Avg Verification Time</span>
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {learningMetrics.avg_days_to_verification} days
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                From authority claim to community log
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Most Common User Intake Corrections</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-xs text-slate-800 font-medium">
                  &ldquo;{learningMetrics.most_common_correction}&rdquo;
                </p>
                <span className="text-[11px] text-slate-500">
                  Model adjustment: Updated prompt context to explicitly distinguish direct drinking water aquifers from secondary agricultural canals.
                </span>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Community Verification Breakdown</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl text-emerald-950">
                  <span>Fully Resolved by Community</span>
                  <span className="font-bold font-mono">{learningMetrics.community_verified_count} cases (40%)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl text-amber-950">
                  <span>Partially Resolved (e.g. water delivered but lab tests pending)</span>
                  <span className="font-bold font-mono">{learningMetrics.community_partial_count} cases (40%)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-rose-50 rounded-xl text-rose-950">
                  <span>Resolution Disputed by Community</span>
                  <span className="font-bold font-mono">{learningMetrics.community_disputed_count} cases (20%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. EMERGING PATTERNS & SPATIAL RADAR VIEW                 */}
      {/* ========================================================= */}
      {mainView === 'analytics' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              Early Warning Intelligence & Spatial Analysis
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t('analytics_title')}</h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">{t('analytics_sub')}</p>
          </div>

          {/* Active Detected Clusters */}
          <div className="space-y-6">
            {clusters.map(cluster => (
              <div key={cluster.id} className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                        {t('analytics_high_risk')}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg">
                        Risk Score: {cluster.riskScore}/100
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg">
                        {cluster.category}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-slate-900 mb-2">{cluster.title}</h4>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 mt-4 mb-5">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800 block mb-1">Spatial Perimeter & GPS:</span>
                        <span className="font-mono text-slate-700">{cluster.centerGps} ({cluster.radius})</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800 block mb-1">Impacted Community Assets:</span>
                        <span className="text-slate-700">{cluster.receptors}</span>
                      </div>
                    </div>

                    {/* Linked Cases */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{t('analytics_cases_grouped')}:</span>
                      {cluster.caseRefs.map(ref => (
                        <Link 
                          key={ref} 
                          href={`/issues/${ref}`}
                          className="font-mono font-bold text-emerald-700 bg-slate-100 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                        >
                          {ref}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Action Dispatch Box */}
                  <div className="lg:w-80 shrink-0 p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Recommended Directive
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed mb-4">
                        {cluster.recommendedAction}
                      </p>
                    </div>

                    {dispatchedActions[cluster.id] ? (
                      <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-bold">Demo Inspection Assigned</span>
                          <span className="text-[11px] opacity-90">{dispatchedActions[cluster.id]}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setDispatchedActions(prev => ({
                            ...prev,
                            [cluster.id]: cluster.dispatchDirective
                          }));
                        }}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        Trigger Demo Inspection Assignment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spatial Incident Radar Schematic */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  Mavambo Lithium Concession • Spatial Incident Radar
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Correlating community GPS incident logs against mining infrastructure (Tailings Storage, Pit #2, and Haul Corridor).
                </p>
              </div>
            </div>

            {/* Visual Concession Radar Map */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-4 font-mono select-none">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>
              
              <div className="absolute top-4 left-4 text-[10px] text-emerald-400 tracking-wider font-semibold z-10 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                CONCESSION GRID: MAVAMBO LICENCE ZM-401 (GOROMONZI)
              </div>

              {/* Mine Infrastructure Landmarks */}
              <div className="absolute top-16 right-24 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center z-10">
                <span className="text-[11px] font-bold text-amber-300 block">⛏️ OPEN PIT #2</span>
                <span className="text-[9px] text-slate-400">Active Blasting Zone</span>
              </div>

              <div className="absolute top-44 right-1/3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center z-10">
                <span className="text-[11px] font-bold text-sky-300 block">🏭 TAILINGS DAM (TSF #1)</span>
                <span className="text-[9px] text-slate-400">Slurry Retention Wall</span>
              </div>

              <div className="absolute bottom-12 left-16 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center z-10">
                <span className="text-[11px] font-bold text-emerald-300 block">🏘️ CHIKWAKA VILLAGE</span>
                <span className="text-[9px] text-slate-400">Ward 14 • 850 Residents</span>
              </div>

              <div className="absolute bottom-6 right-16 text-[10px] text-blue-400">
                ≈ Nyagui River Tributary ≈
              </div>

              {/* Pins */}
              <button
                onClick={() => setSelectedRadarPin('MG-2025-1082')}
                className="absolute top-48 left-1/2 -translate-x-6 -translate-y-6 group z-20 focus:outline-none"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping"></span>
                  <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded bg-rose-900/90 text-rose-100 border border-rose-700">
                    MG-2025-1082 (Borehole #4)
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedRadarPin('MG-2026-011')}
                className="absolute top-52 left-1/3 group z-20 focus:outline-none"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-amber-500/30 animate-ping"></span>
                  <div className="w-5 h-5 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/90 text-amber-100 border border-amber-700">
                    MG-2026-011 (East Spring)
                  </span>
                </div>
              </button>
            </div>

            {selectedRadarPin && (
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Marker {selectedRadarPin}: </span>
                  {selectedRadarPin === 'MG-2025-1082' && 'Borehole #4 sulfuric odor & livestock refusal. Distance to TSF #1: 450m south-west.'}
                  {selectedRadarPin === 'MG-2026-011' && 'Chemical slurry runoff into village natural spring. Distance to processing circuit: 620m.'}
                </div>
                <Link
                  href={`/issues/${selectedRadarPin}`}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 ml-4 transition-colors"
                >
                  View Case
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. QUEUE & INBOX VIEW                                     */}
      {/* ========================================================= */}
      {mainView === 'inbox' && (
        <div>
          {/* Status Tabs */}
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
            {(['Awaiting', 'Under review', 'Resolved'] as const).map(tab => {
              const tabLabel = tab === 'Awaiting' ? t('auth_tab_awaiting') : tab === 'Under review' ? t('auth_tab_review') : t('auth_tab_resolved');
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab 
                      ? 'border-emerald-600 text-emerald-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tabLabel}
                </button>
              );
            })}
          </div>

          {/* Cases List */}
          <div className="space-y-6">
            {filteredCases.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
                <p className="text-slate-500">No cases found in this view.</p>
              </div>
            ) : (
              filteredCases.map(c => (
                <div key={c.id} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row gap-6 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="flex-1">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-2.5 mb-3">
                      <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-mono font-bold">
                        {c.reference_number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        c.urgency === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 
                        c.urgency === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {c.urgency} priority
                      </span>
                      {c.status === 'Awaiting community verification' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          Awaiting Community Verification
                        </span>
                      )}
                      {c.original_language && (
                        <span className="text-[11px] font-mono text-slate-500 uppercase bg-slate-100 px-2.5 py-0.5 rounded-full">
                          Language: {c.original_language}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{c.category}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{c.original_text}</p>
                    
                    {c.translated_text && (
                      <div className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-900">English Translation: </span>
                        {c.translated_text}
                      </div>
                    )}

                    {/* Geolocation Details if present */}
                    {c.geolocation && (
                      <div className="mb-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Coordinates:</strong> {c.geolocation.latitude.toFixed(3)}, {c.geolocation.longitude.toFixed(3)} • {c.geolocation.location_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium">Approximate Public Centroid</span>
                      </div>
                    )}

                    {/* Matched Statutory Obligations */}
                    {c.matched_obligations && c.matched_obligations.length > 0 && (
                      <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Potential Obligation Match ({c.matched_obligations.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {c.matched_obligations.map((ob: MatchedObligation, idx: number) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-slate-900">{ob.title}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {ob.match_strength || 'Potential match'}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-emerald-800 mb-1">{ob.legal_instrument} • {ob.clause}</p>
                              <p className="text-slate-600 text-[11px] mb-1.5"><span className="font-semibold text-slate-800">Requirement:</span> {ob.requirement}</p>
                              <p className="text-emerald-900 text-[11px] bg-emerald-50/70 p-2 rounded border border-emerald-100">
                                <span className="font-bold">Potential Remedy:</span> {ob.potential_remedy}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <span>Reported: {new Date(c.created_at).toLocaleDateString()}</span>
                      <span>District: {c.district}, {c.ward}</span>
                    </div>
                  </div>
                  
                  {/* Actions Column */}
                  <div className="lg:w-64 shrink-0 flex flex-col justify-center space-y-2.5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Workflow Actions</p>
                    
                    {activeTab === 'Awaiting' && (
                      <button 
                        onClick={() => updateCaseStatus(c.id, 'Acknowledged')}
                        className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                      >
                        {t('auth_action_ack')}
                      </button>
                    )}
                    
                    {activeTab === 'Under review' && (
                      <>
                        <button 
                          onClick={() => handleOpenDispatchModal(c.id)}
                          className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          Assign Demo Inspection
                        </button>
                        <button 
                          onClick={() => updateCaseStatus(c.id, 'Action reported')}
                          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          Report Field Action
                        </button>
                        <button 
                          onClick={() => handleOpenResolveModal(c.id)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          Report Resolution (Verify)
                        </button>
                      </>
                    )}

                    <Link 
                      href={`/issues/${c.reference_number}`} 
                      className="flex items-center justify-center w-full px-4 py-2 text-emerald-700 hover:text-emerald-800 text-xs font-bold mt-1"
                    >
                      {t('auth_view_public')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL WITH VERIFICATION NOTICE */}
      {resolveModalCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Report Authority Corrective Action / Resolution
              </h3>
              <button onClick={() => setResolveModalCaseId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
              <strong>Two-Stage Verification Notice:</strong> Submitting this resolution will set the grievance status to <strong>&ldquo;Awaiting community verification&rdquo;</strong>. Under MineVoice civic accountability rules, authority action is not recorded as final proof until confirmed by affected community members.
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Action Taken / Resolution Summary
                </label>
                <input
                  type="text"
                  required
                  value={resolveActionSummary}
                  onChange={e => setResolveActionSummary(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-900"
                  placeholder="E.g. Flushed community borehole and reinforced chemical slurry trenches."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Supporting Operational Note / Water Test Reference
                </label>
                <textarea
                  rows={2}
                  value={resolveSupportingNote}
                  onChange={e => setResolveSupportingNote(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-900"
                  placeholder="E.g. Water laboratory samples collected by EMA Mashonaland East unit."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalCaseId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Submit & Await Community Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEMO INSPECTION DISPATCH MODAL (Requirement #9) */}
      {dispatchModalCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                Create Demo Inspection Assignment
              </h3>
              <button onClick={() => setDispatchModalCaseId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3 bg-slate-100 rounded-2xl text-xs text-slate-600">
              <span className="font-bold text-slate-800 block mb-0.5">Integrity Notice:</span>
              This creates a <strong>Demo inspection assignment created within MineVoice</strong>. It logs to the public timeline and notification center without simulating direct live radio dispatch.
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Officer / Unit</label>
                <input
                  type="text"
                  required
                  value={dispatchInspector}
                  onChange={e => setDispatchInspector(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={dispatchPriority}
                    onChange={e => setDispatchPriority(e.target.value as any)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-slate-900 bg-white"
                  >
                    <option value="High Priority">High Priority</option>
                    <option value="Standard">Standard</option>
                    <option value="Urgent Environmental Audit">Urgent Environmental Audit</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proposed Inspection Date</label>
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={e => setDispatchDate(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inspection Terms / Directive Note</label>
                <textarea
                  rows={2}
                  value={dispatchNote}
                  onChange={e => setDispatchNote(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalCaseId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Log Demo Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
