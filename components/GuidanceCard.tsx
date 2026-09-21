'use client';

import React, { useState } from 'react';
import { Case, SupportedLanguage, useAppStore } from '@/lib/store';
import { resolveNextStepGuidance, NextStepGuidance, ReporterActionLevel } from '@/lib/guidance-engine';
import { 
  Compass, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  FileCheck2, 
  ChevronDown, 
  ChevronUp, 
  Languages, 
  ExternalLink, 
  Scale, 
  HelpCircle,
  Sparkles,
  Info,
  Check,
  Calendar
} from 'lucide-react';

interface GuidanceCardProps {
  issue: Case;
  variant?: 'default' | 'compact';
  onActionClick?: (actionType: string) => void;
  className?: string;
}

export default function GuidanceCard({
  issue,
  variant = 'default',
  onActionClick,
  className = ''
}: GuidanceCardProps) {
  const globalLanguage = useAppStore(state => state.language);
  const [cardLang, setCardLang] = useState<SupportedLanguage>(globalLanguage || 'en');
  const [showOriginal, setShowOriginal] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [showEscalationDrawer, setShowEscalationDrawer] = useState(false);

  // Active language considering the "View original" toggle
  const effectiveLang: SupportedLanguage = showOriginal ? 'en' : cardLang;
  const guidance: NextStepGuidance = resolveNextStepGuidance(issue, effectiveLang);

  const getActionLevelBadge = (level: ReporterActionLevel) => {
    switch (level) {
      case 'required':
        return {
          container: 'bg-rose-50 text-rose-900 border-rose-200 ring-1 ring-rose-300',
          dot: 'bg-rose-600',
          icon: ShieldAlert
        };
      case 'recommended':
        return {
          container: 'bg-amber-50 text-amber-900 border-amber-200 ring-1 ring-amber-300',
          dot: 'bg-amber-600',
          icon: AlertCircle
        };
      case 'none':
      default:
        return {
          container: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-emerald-600',
          icon: CheckCircle2
        };
    }
  };

  const actionStyle = getActionLevelBadge(guidance.reporter_action_level);
  const ActionIcon = actionStyle.icon;

  const handleCtaClick = () => {
    if (guidance.cta?.action_type === 'verify_resolution') {
      if (onActionClick) {
        onActionClick('verify_resolution');
      } else {
        const el = document.getElementById('community-verification-block') || document.getElementById('verification-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (guidance.cta?.action_type === 'view_escalation') {
      setShowEscalationDrawer(true);
      setExpandedDetails(true);
    } else if (onActionClick && guidance.cta) {
      onActionClick(guidance.cta.action_type);
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        id={`guidance-card-${issue.reference_number}-compact`}
        className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-left space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">What Happens Next?</h4>
              <p className="text-[11px] text-slate-500">Plain-language guidance for your case</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${actionStyle.container}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${actionStyle.dot}`}></span>
            {guidance.reporter_action_label}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="font-semibold text-slate-900 text-sm leading-snug">
            {guidance.headline}
          </div>
          <p className="text-slate-600 leading-relaxed">
            {guidance.primary_message}
          </p>
          {guidance.secondary_message && (
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {guidance.secondary_message}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{guidance.response_clock.label}: <strong className="font-mono text-slate-800">{guidance.response_clock.days} d</strong></span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{guidance.last_updated.label}: <strong className="text-slate-800 font-medium">{guidance.last_updated.formatted_date}</strong></span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
            {guidance.source_info.badge}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`guidance-card-${issue.reference_number}`}
      className={`bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs transition-all ${className}`}
    >
      {/* Top Bar: Card Headline, Language Picker & View Original */}
      <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {guidance.questions.what_next}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Community Guidance
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Clear answers on where your case is, what to expect, and when to act
            </p>
          </div>
        </div>

        {/* Multilingual Selector & Original Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 text-xs shadow-2xs">
            <button
              id="guidance-lang-en"
              type="button"
              onClick={() => { setCardLang('en'); setShowOriginal(false); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                cardLang === 'en' && !showOriginal
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              id="guidance-lang-sn"
              type="button"
              onClick={() => { setCardLang('sn'); setShowOriginal(false); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                cardLang === 'sn' && !showOriginal
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shona
            </button>
            <button
              id="guidance-lang-nd"
              type="button"
              onClick={() => { setCardLang('nd'); setShowOriginal(false); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                cardLang === 'nd' && !showOriginal
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ndebele
            </button>
          </div>

          {(cardLang !== 'en' || showOriginal) && (
            <button
              id="guidance-toggle-original"
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 font-medium transition-colors"
              title="Toggle English original"
            >
              <Languages className="w-3 h-3" />
              {showOriginal ? 'Show translated' : 'View original'}
            </button>
          )}
        </div>
      </div>

      {/* Main Guidance Body */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Current State & Headline */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {guidance.questions.where_now}
              </span>
              <span className="hidden sm:inline-block text-slate-300">•</span>
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/90 px-2.5 py-0.5 rounded-md border border-slate-200/80 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{guidance.last_updated.label}: <strong className="text-slate-900 font-semibold">{guidance.last_updated.formatted_date}</strong> <span className="text-slate-400 text-[11px]">({guidance.last_updated.relative_time})</span></span>
              </div>
            </div>

            {/* Reporter Action Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-2xs ${actionStyle.container}`}>
              <ActionIcon className="w-3.5 h-3.5" />
              <span>{guidance.reporter_action_label}</span>
            </div>
          </div>

          {/* Primary Guidance Headline */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {guidance.headline}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {guidance.primary_message}
            </p>
            {guidance.secondary_message && (
              <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-200/60">
                {guidance.secondary_message}
              </p>
            )}
          </div>
        </div>

        {/* 3 Structured Response Answers: Next Step, Action Required, Response Clock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Question 2: What is expected next? */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                {guidance.questions.what_next}
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">
                {guidance.expected_next_step}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Coordinated via {issue.routes?.[0]?.authority_id?.toUpperCase() || 'regulatory desk'}.
            </div>
          </div>

          {/* Question 3: Do I need to do anything? */}
          <div className={`p-4 rounded-2xl border shadow-2xs space-y-2 flex flex-col justify-between ${
            guidance.reporter_action_level === 'required' ? 'bg-purple-50/70 border-purple-200' :
            guidance.reporter_action_level === 'recommended' ? 'bg-amber-50/70 border-amber-200' :
            'bg-white border-slate-200/90'
          }`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-600">
                <ActionIcon className={`w-3.5 h-3.5 ${
                  guidance.reporter_action_level === 'required' ? 'text-purple-700' :
                  guidance.reporter_action_level === 'recommended' ? 'text-amber-700' :
                  'text-emerald-600'
                }`} />
                {guidance.questions.action_needed}
              </div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                {guidance.reporter_action_description}
              </p>
            </div>

            {guidance.cta && (
              <div className="pt-2 border-t border-slate-200/60">
                <button
                  id="guidance-action-cta-btn"
                  type="button"
                  onClick={handleCtaClick}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                    guidance.reporter_action_level === 'required'
                      ? 'bg-purple-700 hover:bg-purple-800 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{guidance.cta.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Question 4: When should I expect another update? */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {guidance.questions.when_update}
              </div>
              <div>
                <span className="text-lg font-bold font-mono text-slate-900 block">
                  {guidance.response_clock.days} day{guidance.response_clock.days === 1 ? '' : 's'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {guidance.response_clock.label}
                </span>
              </div>
            </div>

            <div className="text-[11px] pt-2 border-t border-slate-100">
              {guidance.response_clock.has_verified_deadline ? (
                <div className="text-emerald-800 font-medium">
                  ✓ {guidance.response_clock.benchmark_text}
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  {guidance.response_clock.benchmark_text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Escalation Alert Banner if Overdue or Disputed */}
        {(guidance.response_clock.is_overdue || guidance.escalation.available) && (
          <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{guidance.questions.what_if_stalled}</span>
              </div>
              <button
                id="guidance-toggle-escalation-btn"
                type="button"
                onClick={() => setShowEscalationDrawer(!showEscalationDrawer)}
                className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline flex items-center gap-1"
              >
                {showEscalationDrawer ? 'Hide escalation options' : 'View escalation options'}
                {showEscalationDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed">
              {guidance.escalation.suggested_action ||
                'If the statutory deadline has passed without acknowledgement, you can follow up with the authority using your reference number.'}
            </p>

            {showEscalationDrawer && guidance.escalation.title && (
              <div className="mt-3 p-4 bg-white rounded-xl border border-amber-200 text-xs space-y-2 text-slate-700 animate-in fade-in duration-300">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{guidance.escalation.title}</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                    {guidance.escalation.rule_id}
                  </span>
                </div>
                {guidance.escalation.why_suggested && (
                  <p className="text-slate-600 text-[11px]">
                    <strong>Why this is suggested:</strong> {guidance.escalation.why_suggested}
                  </p>
                )}
                {guidance.escalation.source_rule && (
                  <p className="text-slate-600 text-[11px]">
                    <strong>Source / Configured Rule:</strong> {guidance.escalation.source_rule}
                  </p>
                )}
                {guidance.escalation.escalation_target && (
                  <p className="text-slate-600 text-[11px]">
                    <strong>Escalation Target:</strong> {guidance.escalation.escalation_target}
                  </p>
                )}
                {guidance.escalation.contact_guidance && (
                  <p className="text-slate-500 text-[11px] italic">
                    Note: {guidance.escalation.contact_guidance}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Evidence Assistant Integration Recommendation (if applicable) */}
        {guidance.evidence_suggestion && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Smart Evidence Recommendation</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {guidance.evidence_suggestion.text}
            </p>
            {guidance.evidence_suggestion.items && (
              <div className="flex flex-wrap gap-2 pt-1">
                {guidance.evidence_suggestion.items.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                    <Check className="w-3 h-3 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-slate-400 italic pt-1">
              Evidentiary Standard: Lack of documentary evidence does not invalidate community testimony or mean the report is false.
            </p>
          </div>
        )}

        {/* Expandable "How Does This Process Work?" Detail Section */}
        <div className="border-t border-slate-100 pt-3">
          <button
            id="guidance-toggle-details-btn"
            type="button"
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Understanding the MineVoice Grievance Process
            </span>
            {expandedDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedDetails && (
            <div className="mt-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-3 animate-in fade-in duration-300">
              <div className="grid sm:grid-cols-2 gap-3 text-slate-700">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">1. Official Intake</span>
                  <p className="text-[11px] text-slate-600">
                    Grievances are formatted into standardized statutory dossiers and routed directly to the designated authority (EMA, Ministry of Mines, or RDC).
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">2. Response Clock & Charter</span>
                  <p className="text-[11px] text-slate-600">
                    We track elapsed time against verified client charters (e.g. EMA 5 working days). We never invent deadlines.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">3. Field Assessment</span>
                  <p className="text-[11px] text-slate-600">
                    Inspectors review site evidence and conduct water, noise, or structural crack audits. Exact GPS coordinates are protected under logged audit.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">4. Two-Stage Resolution Verification</span>
                  <p className="text-[11px] text-slate-600">
                    An authority claim of action is not accepted as final proof. Community residents must independently confirm or dispute resolution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Source Attribution & Statutory Disclaimer */}
      <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            {guidance.source_info.badge}
          </span>
          {guidance.source_info.citation && (
            <span className="text-slate-600 font-medium">
              Source: {guidance.source_info.citation}
            </span>
          )}
        </div>

        <div className="text-[10px] text-slate-400">
          {guidance.source_info.disclaimer}
        </div>
      </div>
    </div>
  );
}
