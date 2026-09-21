'use client';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Building2, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function ProjectsDirectory() {
  const projects = useAppStore(state => state.projects);
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.operator.toLowerCase().includes(search.toLowerCase()) ||
    p.commodity.toLowerCase().includes(search.toLowerCase()) ||
    p.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('proj_title')}</h1>
          <p className="text-slate-600">{t('proj_sub')}</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={t('proj_search_placeholder')}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-slate-900 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(p => (
          <Link href={`/projects/${p.slug}`} key={p.id} className="block group">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                {p.verification_status === 'Verified' && (
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    {t('proj_publicly_verifiable')}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                {p.name}
              </h3>
              <p className="text-slate-500 text-sm mb-4">{p.operator}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center text-slate-700">
                  <span className="font-bold text-slate-900 mr-1 text-sm">{p.open_cases}</span> {t('proj_open_issues')}
                </div>
                <div>{p.district}, {p.province}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
