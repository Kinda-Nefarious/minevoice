'use client';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Megaphone, Search, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const cases = useAppStore((state) => state.cases);
  const { t } = useTranslation();
  
  const openCases = cases.filter(c => !['Resolved', 'Closed without resolution', 'Withdrawn'].includes(c.status)).length;
  const acknowledgedCases = cases.filter(c => c.status === 'Acknowledged' || c.status === 'Under review' || c.status === 'Action reported').length;
  const resolvedCases = cases.filter(c => c.status === 'Resolved').length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-28 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
          {t('hero_title_1')} <br className="hidden md:block"/> {t('hero_title_2')}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          {t('hero_subtext')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/report" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm hover:shadow transition-all w-full sm:w-auto">
            <Megaphone className="w-5 h-5 mr-2" />
            {t('hero_cta_report')}
          </Link>
          <Link href="/issues" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-sm hover:shadow-sm transition-all w-full sm:w-auto">
            <Search className="w-5 h-5 mr-2" />
            {t('hero_cta_explore')}
          </Link>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="px-4 py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100/80">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl mb-4">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('val_speak_title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('val_speak_desc')}</p>
            </div>
            
            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100/80">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('val_help_title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('val_help_desc')}</p>
            </div>
            
            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100/80">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl mb-4">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('val_route_title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('val_route_desc')}</p>
            </div>
            
            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100/80">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t('val_track_title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('val_track_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Snapshot */}
      <section className="px-4 py-20 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-8 text-center text-slate-900">{t('stats_heading')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <span className="text-4xl font-extrabold text-slate-900 mb-2">{openCases}</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('stats_open')}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <span className="text-4xl font-extrabold text-amber-600 mb-2">{acknowledgedCases}</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('stats_acknowledged')}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <span className="text-4xl font-extrabold text-emerald-600 mb-2">{resolvedCases}</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('stats_resolved')}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
