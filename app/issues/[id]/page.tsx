'use client';
import { useState } from 'react';
import { useAppStore, IssueStatus } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useParams, useRouter } from 'next/navigation';
import { evaluateEscalation } from '@/lib/escalation-rules';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Activity, 
  ChevronLeft, 
  ArrowRight, 
  Languages, 
  Scale, 
  Compass, 
  Clock, 
  AlertCircle, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileCheck2, 
  Lock, 
  Eye, 
  ExternalLink,
  ShieldAlert,
  Check
} from 'lucide-react';
import Link from 'next/link';
import GuidanceCard from '@/components/GuidanceCard';

export default function IssueDetail() {
  const { id } = useParams();
  const router = useRouter();
  const cases = useAppStore(state => state.cases);
  const followTargets = useAppStore(state => state.followTargets);
  const toggleFollow = useAppStore(state => state.toggleFollow);
  const submitCommunityVerification = useAppStore(state => state.submitCommunityVerification);
  const logCoordinateAccess = useAppStore(state => state.logCoordinateAccess);
  const coordinateAccessLogs = useAppStore(state => state.coordinateAccessLogs);
  const { t } = useTranslation();

  const [verifyChoice, setVerifyChoice] = useState<'resolved' | 'partial' | 'disputed' | 'unable'>('resolved');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyEvidenceCount, setVerifyEvidenceCount] = useState(1);
  const [verifySubmitted, setVerifySubmitted] = useState(false);
  const [showInspectorGpsModal, setShowInspectorGpsModal] = useState(false);
  const [gpsAccessPurpose, setGpsAccessPurpose] = useState('Field water sampling and aquifer boundary inspection');

  const issue = cases.find(c => c.reference_number === id || c.id === id);

  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Issue not found</h1>
        <p className="text-slate-600 mb-8">This issue may be private or does not exist.</p>
        <Link href="/issues" className="text-emerald-600 hover:text-emerald-700 font-semibold">{t('issues_back_btn')}</Link>
      </div>
    );
  }

  const isFollowing = followTargets.some(f => f.type === 'issue' && f.target_id === issue.reference_number);

  const escalation = evaluateEscalation(
    issue.status,
    issue.created_at,
    issue.updated_at,
    issue.routes[0]?.authority_id || 'ema',
    issue.category
  );

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'Verified resolved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Partially resolved':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Resolution disputed':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Awaiting community verification':
        return 'bg-purple-100 text-purple-900 border-purple-300 ring-2 ring-purple-300/50 animate-pulse';
      case 'Inspection assigned':
      case 'Inspection completed':
      case 'Action reported':
      case 'Under review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Acknowledged':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Awaiting acknowledgement':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTrustBadgeStyle = (trust: string) => {
    switch (trust) {
      case 'Authority verified':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Community reported':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Independent audit':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCommunityVerification(issue.reference_number, {
      verification: verifyChoice,
      notes: verifyNotes.trim() || `Community verified status: ${verifyChoice}`,
      evidenceCount: verifyEvidenceCount,
      verifiedBy: 'Community Reporter & Ward 14 Resident'
    });
    setVerifySubmitted(true);
  };

  const handleRequestGpsAccess = () => {
    logCoordinateAccess(issue.reference_number, 'EMA District Environmental Officer (T. Hove)', gpsAccessPurpose);
    setShowInspectorGpsModal(false);
  };

  const hasAccessLog = coordinateAccessLogs.some(log => log.case_ref === issue.reference_number);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t('issues_back_btn')}
        </button>

        {/* Follow / Watch Button */}
        <button
          onClick={() => toggleFollow({ type: 'issue', target_id: issue.reference_number, label: `Case ${issue.reference_number}` })}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
            isFollowing
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFollowing ? 'fill-current' : ''}`} />
          {isFollowing ? 'Following Case' : 'Follow this Grievance'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-0">
        {/* Header */}
        <div className="p-8 border-b border-slate-200 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-sm font-mono font-bold tracking-wider">
                {issue.reference_number}
              </span>
              {issue.original_language && (
                <span className="inline-flex items-center gap-1 text-xs font-mono uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  <Languages className="w-3 h-3 text-slate-400" />
                  {issue.original_language}
                </span>
              )}
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border inline-flex items-center self-start sm:self-auto ${getStatusBadge(issue.status)}`}>
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              {issue.status}
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{issue.category}</h1>
          {issue.subcategory && (
            <p className="text-sm font-medium text-emerald-800 mb-4">{issue.subcategory}</p>
          )}
          
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-slate-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              {issue.district}, {issue.province} {issue.ward ? `• ${issue.ward}` : ''}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              {t('issues_reported_date')} {new Date(issue.created_at).toLocaleDateString()}
            </div>
            {issue.geolocation && (
              <div className="flex items-center text-emerald-900 text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Compass className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>Approximate area for public safety</span>
              </div>
            )}
          </div>
        </div>

        {/* HIGH-PRIORITY: What Happens Next? Guidance Card */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-200">
          <GuidanceCard 
            issue={issue} 
            onActionClick={(type) => {
              if (type === 'verify_resolution') {
                const el = document.getElementById('community-verification-block');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </div>

        {/* HIGH PRIORITY: Resolution Verification Loop Banner */}
        {issue.status === 'Awaiting community verification' && (
          <div id="community-verification-block" className="p-6 sm:p-8 bg-purple-50/70 border-b border-purple-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-200/70 px-2.5 py-0.5 rounded-full">
                    Action Required: Community Verification
                  </span>
                </div>
                <h3 className="text-lg font-bold text-purple-950">
                  Authority Reported Resolution — Pending Community Confirmation
                </h3>
                <p className="text-xs text-purple-800 leading-relaxed">
                  An institutional authority has marked this case as resolved. Under MineVoice civic accountability standards, an authority claiming resolution is not treated as final proof until confirmed by affected community members.
                </p>
              </div>
            </div>

            {issue.authority_resolution_claim && (
              <div className="p-4 bg-white rounded-2xl border border-purple-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold text-slate-800">
                    Claimed by: {issue.authority_resolution_claim.authority_name}
                  </span>
                  <span>{new Date(issue.authority_resolution_claim.claimed_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  &ldquo;{issue.authority_resolution_claim.action_summary}&rdquo;
                </p>
                {issue.authority_resolution_claim.supporting_note && (
                  <p className="text-xs text-slate-600 italic">
                    Note: {issue.authority_resolution_claim.supporting_note}
                  </p>
                )}
              </div>
            )}

            {/* Interactive Community Feedback Form */}
            {!verifySubmitted ? (
              <form onSubmit={handleVerifySubmit} className="p-5 bg-white rounded-2xl border border-purple-200 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Has this problem actually been addressed in your community?
                </h4>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
                    verifyChoice === 'resolved' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input type="radio" name="verification" value="resolved" checked={verifyChoice === 'resolved'} onChange={() => setVerifyChoice('resolved')} className="mt-0.5" />
                    <div>
                      <div className="font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Yes, fully resolved</div>
                      <div className="text-[11px] font-normal text-slate-500">Water is clear, tests passed, or problem stopped.</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
                    verifyChoice === 'partial' ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-500' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input type="radio" name="verification" value="partial" checked={verifyChoice === 'partial'} onChange={() => setVerifyChoice('partial')} className="mt-0.5" />
                    <div>
                      <div className="font-bold flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Partially resolved</div>
                      <div className="text-[11px] font-normal text-slate-500">Some action taken, but key issues or test results remain pending.</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
                    verifyChoice === 'disputed' ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-500' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input type="radio" name="verification" value="disputed" checked={verifyChoice === 'disputed'} onChange={() => setVerifyChoice('disputed')} className="mt-0.5" />
                    <div>
                      <div className="font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-rose-600" /> No, issue continues / Disputed</div>
                      <div className="text-[11px] font-normal text-slate-500">The problem is ongoing or claimed work was not done.</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
                    verifyChoice === 'unable' ? 'border-slate-600 bg-slate-50 text-slate-950 font-bold ring-1 ring-slate-500' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input type="radio" name="verification" value="unable" checked={verifyChoice === 'unable'} onChange={() => setVerifyChoice('unable')} className="mt-0.5" />
                    <div>
                      <div className="font-bold flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Cannot verify / Not sure</div>
                      <div className="text-[11px] font-normal text-slate-500">I do not have access to test water or inspect the site.</div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Community Verification Feedback: What has changed? What remains unresolved?
                  </label>
                  <textarea
                    value={verifyNotes}
                    onChange={e => setVerifyNotes(e.target.value)}
                    rows={2}
                    placeholder="E.g., Bowsers were delivered yesterday, but borehole water still has a strong chemical smell and no laboratory test results were published."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500">
                    Verification updates the public case status and alerts the regulatory desk.
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Submit Community Verification
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                Thank you! Your verification feedback has been appended to the official public case timeline.
              </div>
            )}
          </div>
        )}

        {/* Display Verified Outcome if Already Verified (e.g. MG-2026-011) */}
        {issue.verification_feedback && (
          <div className="p-6 sm:p-8 bg-slate-50/80 border-b border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              Two-Stage Resolution Verification Status
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Authority Claim */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  1. Authority Reported Action
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {issue.authority_resolution_claim?.action_summary || 'Borehole flushed and water testing completed.'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Claimed by {issue.authority_resolution_claim?.authority_name || 'EMA'}
                </p>
              </div>

              {/* Community Verification */}
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                issue.verification_feedback.community_verification === 'resolved' ? 'bg-emerald-50 border-emerald-200' :
                issue.verification_feedback.community_verification === 'partial' ? 'bg-amber-50 border-amber-200' :
                'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    issue.verification_feedback.community_verification === 'resolved' ? 'bg-emerald-200/80 text-emerald-950' :
                    issue.verification_feedback.community_verification === 'partial' ? 'bg-amber-200/80 text-amber-950' :
                    'bg-rose-200/80 text-rose-950'
                  }`}>
                    2. Community Verified: {issue.verification_feedback.community_verification.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(issue.verification_feedback.verified_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 text-xs">
                  {issue.verification_feedback.verification_notes}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Verified by: {issue.verification_feedback.verified_by || 'Ward Community Representative'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Body Grid */}
        <div className="p-8 grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            {/* Summary */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Public Summary</h3>
              <p className="text-base text-slate-900 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 font-medium">
                {issue.public_summary}
              </p>
            </section>

            {issue.original_text && issue.original_text !== issue.public_summary && (
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Original Narrative Excerpt</h3>
                <p className="text-sm text-slate-700 italic bg-white p-5 rounded-2xl border border-slate-200">
                  &ldquo;{issue.original_text}&rdquo;
                </p>
              </section>
            )}

            {/* Smart Evidence Assistant Checklist Display (Requirement #2) */}
            <section className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Evidence Checklist & Completeness
                  </h3>
                </div>
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                  issue.evidence_completeness === 'Strong documentation' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  issue.evidence_completeness === 'Some supporting evidence' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {issue.evidence_completeness || 'Some supporting evidence'}
                </span>
              </div>

              {issue.evidence_items && issue.evidence_items.length > 0 ? (
                <div className="space-y-2">
                  {issue.evidence_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
                  No additional documentary files uploaded yet.
                </p>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Evidentiary Standard:</span> Lack of documentary evidence does not mean the grievance is false or invalidate community testimony.
              </p>
            </section>

            {/* Response Clock & Escalation Intelligence (Requirement #3) */}
            <section className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Response Clock & Escalation Pathway
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Days Under Review</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">{escalation.days_under_review} d</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Acknowledgement</span>
                  <span className="text-sm font-bold text-emerald-800">
                    {escalation.has_acknowledgement ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Last Update</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">{escalation.last_update_days_ago} d ago</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Next Action</span>
                  <span className="text-xs font-semibold text-slate-700 truncate block" title="Field water inspection report publication">
                    Water Audit
                  </span>
                </div>
              </div>

              {/* Escalation Recommendation */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Escalation Recommendation
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {escalation.suggested_rule?.id || 'STANDARD'}
                  </span>
                </div>

                {escalation.suggested_rule ? (
                  <div className="space-y-2 text-slate-700 pt-1">
                    <p className="font-semibold text-slate-900">
                      {escalation.suggested_rule.title}: {escalation.suggested_rule.suggested_action}
                    </p>
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1 text-[11px]">
                      <div>
                        <span className="font-bold text-amber-950">Why this is suggested:</span>{' '}
                        {escalation.suggested_rule.why_suggested}
                      </div>
                      <div>
                        <span className="font-bold text-amber-950">Source / configured rule:</span>{' '}
                        {escalation.suggested_rule.source_rule}
                      </div>
                      <div>
                        <span className="font-bold text-amber-950">Escalation target:</span>{' '}
                        {escalation.suggested_rule.escalation_target}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No verified escalation pathway is currently available in MineVoice. This case is currently within standard statutory timelines.
                  </p>
                )}
              </div>
            </section>

            {/* Hardened Statutory Obligations (Requirements #6, #7, #8) */}
            {issue.matched_obligations && issue.matched_obligations.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Potential Obligation Matches ({issue.matched_obligations.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Mapped from verified Zimbabwean environmental, mining safety, and concession instruments.
                </p>

                <div className="space-y-4">
                  {issue.matched_obligations.map((ob, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ob.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {ob.match_strength || 'Strong obligation match'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-emerald-800">
                        {ob.legal_instrument} • {ob.clause}
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-900">Requirement:</span> {ob.requirement}
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800">
                        <span className="font-bold text-emerald-950">Potential formal remedy / escalation pathway:</span>{' '}
                        {ob.potential_remedy}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                        <span>Source: {ob.source_name} ({ob.version_date})</span>
                        {ob.source_url && (
                          <a href={ob.source_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1 font-medium">
                            Regulatory registry citation <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Legal Notice:</span> MineVoice helps organise and route information. It does not provide legal advice or determine legal liability.
                  </div>
                </div>
              </section>
            )}

            {/* Standardized Public Case Timeline (Requirement #13) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Standardized Accountability Timeline
                </h3>
                <span className="text-xs text-slate-400">
                  {issue.timeline?.length || 2} logged events
                </span>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                {(issue.timeline || [
                  {
                    id: 't-default-1',
                    date: issue.created_at.split('T')[0],
                    title: 'Grievance submitted',
                    actor: 'Community Reporter',
                    status_code: 'Submitted by platform' as IssueStatus,
                    description: issue.public_summary,
                    trust_label: 'Community reported' as const
                  }
                ]).map((event, idx) => (
                  <div key={event.id || idx} className="relative group">
                    <div className="absolute -left-[17px] mt-1.5 w-3 h-3 bg-emerald-600 rounded-full ring-4 ring-white"></div>
                    <div className="ml-6 p-4 bg-white rounded-2xl border border-slate-200/80 space-y-1.5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{event.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTrustBadgeStyle(event.trust_label)}`}>
                          {event.trust_label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{event.actor}</span>
                        {event.actor_role && <span>• {event.actor_role}</span>}
                        <span>• {event.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Geolocation Privacy Box (Requirement #10) */}
            {issue.geolocation && (
              <section className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geolocation</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Masked Publicly
                  </span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{issue.geolocation.location_name}</span>
                  </div>
                  <p className="font-mono text-slate-700 text-[11px]">
                    Public Centroid: {issue.geolocation.latitude.toFixed(3)}, {issue.geolocation.longitude.toFixed(3)}
                  </p>
                  <div className="text-[11px] text-emerald-900 flex items-center gap-1.5 pt-1 border-t border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Approximate area for public safety
                  </div>
                </div>

                {/* Audit log indicator & Inspector button */}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    Exact coordinates restricted to statutory inspectors under logged audit.
                  </div>

                  {hasAccessLog && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[10px] text-blue-900 font-mono">
                      ✓ Coordinate access logged by EMA District Inspector
                    </div>
                  )}

                  <button
                    onClick={() => setShowInspectorGpsModal(true)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspector GPS Audit Check
                  </button>
                </div>
              </section>
            )}

            {/* Authority Routing */}
            <section className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relevant Authorities</h3>
              <div className="space-y-2.5">
                {issue.routes.map((route, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider">{route.authority_id}</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{route.reason}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust Verification Label */}
            <section className="p-5 bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Level</h3>
              <div className="inline-flex items-center px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 w-full">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
                {issue.trust_label}
              </div>
            </section>

            {/* Related Project */}
            {issue.project_id && (
              <section className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Related Concession</h3>
                <Link href={`/projects/mavambo-lithium-project`} className="group flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100/80 transition-colors">
                  <div>
                    <span className="font-bold text-emerald-950 text-sm block">Mavambo Lithium Project</span>
                    <span className="text-[11px] text-emerald-800">Goromonzi, Mashonaland East</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Demo Modal for Inspector Exact GPS Access */}
      {showInspectorGpsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                Authorised Inspector Coordinate Decryption
              </h3>
              <button onClick={() => setShowInspectorGpsModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To protect community informants, precise GPS coordinates are encrypted. Authorised officers must state the statutory purpose for field calibration before decrypting.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Audit Purpose Log</label>
              <input
                type="text"
                value={gpsAccessPurpose}
                onChange={e => setGpsAccessPurpose(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            {hasAccessLog && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-950">
                Exact Coordinates: {issue.geolocation?.latitude}, {issue.geolocation?.longitude} (±{issue.geolocation?.accuracy}m)
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowInspectorGpsModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
              >
                Close
              </button>
              <button
                onClick={handleRequestGpsAccess}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Log Access & Decrypt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
