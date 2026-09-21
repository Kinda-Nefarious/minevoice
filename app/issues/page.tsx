'use client';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { 
  Search, 
  MapPin, 
  Clock, 
  Compass, 
  Scale, 
  TrendingUp, 
  ShieldCheck, 
  Droplet, 
  Wind, 
  CheckCircle2, 
  FileCheck2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import { getTinyNextStepIndicator, shouldShowTinyIndicator } from '@/lib/guidance-engine';

export default function IssuesDirectory() {
  const cases = useAppStore(state => state.cases);
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const publicCases = cases.filter(c => c.public_visibility !== 'private');
  
  // Safe Aggregated Public Insights (Requirement #5)
  const totalPublic = publicCases.length;
  const waterCount = publicCases.filter(c => c.category === 'Water & Pollution').length;
  const airCount = publicCases.filter(c => c.category === 'Air, Dust, Noise & Blasting').length;
  const verificationCount = publicCases.filter(c => 
    c.status === 'Awaiting community verification' || 
    c.status === 'Verified resolved' || 
    c.status === 'Partially resolved'
  ).length;

  const filteredCases = publicCases.filter(c => {
    const matchesSearch = 
      c.public_summary.toLowerCase().includes(search.toLowerCase()) || 
      c.reference_number.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'verification') {
      return c.status === 'Awaiting community verification' || c.status === 'Verified resolved' || c.status === 'Partially resolved';
    }
    if (activeFilter === 'water') return c.category === 'Water & Pollution';
    if (activeFilter === 'air') return c.category === 'Air, Dust, Noise & Blasting';
    if (activeFilter === 'under_review') return c.status === 'Under review' || c.status === 'Inspection assigned' || c.status === 'Action reported';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified resolved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Partially resolved':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Resolution disputed':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Awaiting community verification':
        return 'bg-purple-100 text-purple-900 border-purple-300 ring-2 ring-purple-300/40';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Under review':
      case 'Inspection assigned':
      case 'Action reported':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Acknowledged':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t('issues_title')}</h1>
          <p className="text-slate-600 max-w-2xl">{t('issues_sub')}</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={t('issues_search_placeholder')}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-slate-900 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SAFE AGGREGATED PUBLIC TREND ANALYTICS (Requirement #5) */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Public Environmental & Civic Response Trends
          </div>
          <span className="text-[11px] text-slate-500">
            Factual thematic aggregates • No punitive rankings or guilt scores
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Water & Pollution</span>
              <Droplet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {Math.round((waterCount / Math.max(1, totalPublic)) * 100)}%
            </div>
            <p className="text-[11px] text-slate-500">
              {waterCount} of {totalPublic} reports. Increased following recent rainfall and seasonal runoff.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Air, Dust & Blasting</span>
              <Wind className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {Math.round((airCount / Math.max(1, totalPublic)) * 100)}%
            </div>
            <p className="text-[11px] text-slate-500">
              Concentrated along dry haulage corridors and pit perimeters.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Verification Health</span>
              <FileCheck2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900 font-mono">
              {verificationCount} Cases
            </div>
            <p className="text-[11px] text-slate-500">
              Undergoing community-confirmed two-stage verification.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Avg Acknowledgment</span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              2.8 Days
            </div>
            <p className="text-[11px] text-slate-500">
              Statutory acknowledgement time by designated regulatory desk.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-200 pb-4">
        {[
          { id: 'all', label: 'All Grievances' },
          { id: 'verification', label: 'Community Verification (2-Stage)' },
          { id: 'water', label: 'Water & Pollution' },
          { id: 'air', label: 'Air & Blasting' },
          { id: 'under_review', label: 'Active Investigation' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === filter.id 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grievance Directory Cards */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500">{t('issues_no_results')}</p>
          </div>
        ) : (
          filteredCases.map((c) => (
            <Link href={`/issues/${c.reference_number}`} key={c.id} className="block group">
              <div className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-md transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-mono font-bold">
                      {c.reference_number}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                    {c.original_language && (
                      <span className="text-[11px] font-mono text-slate-500 uppercase bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {c.original_language}
                      </span>
                    )}
                    {c.geolocation && (
                      <span className="inline-flex items-center text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Compass className="w-3 h-3 mr-1 text-emerald-600" />
                        Approx Area
                      </span>
                    )}
                    {c.matched_obligations && c.matched_obligations.length > 0 && (
                      <span className="inline-flex items-center text-[10px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Scale className="w-3 h-3 mr-1 text-slate-500" />
                        {c.matched_obligations.length} statutory duties
                      </span>
                    )}
                    {shouldShowTinyIndicator(c) && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200">
                        <ArrowRight className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                        {getTinyNextStepIndicator(c)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(c.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {c.category}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                  {c.public_summary}
                </p>

                {/* Verification Notice Preview */}
                {c.status === 'Awaiting community verification' && (
                  <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Authority reported action: Awaiting community verification feedback.</span>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                    {c.district}, {c.province} {c.ward ? `• ${c.ward}` : ''}
                  </div>
                  {c.project_id && (
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 shrink-0"></span>
                      Mavambo Lithium Project
                    </div>
                  )}
                  {c.routes.length > 0 && (
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 shrink-0"></span>
                      {t('issues_routed_to')} <span className="font-semibold text-slate-800 ml-1 uppercase">{c.routes[0].authority_id}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
