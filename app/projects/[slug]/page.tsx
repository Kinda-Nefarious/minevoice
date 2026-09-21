'use client';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck, MapPin, Pickaxe, FileText } from 'lucide-react';
import { AccountabilityGraph } from '@/components/AccountabilityGraph';
import Link from 'next/link';

export default function ProjectDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const projects = useAppStore(state => state.projects);
  const cases = useAppStore(state => state.cases);
  const { t } = useTranslation();
  
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Project not found</h1>
        <Link href="/projects" className="text-emerald-600 hover:text-emerald-700 font-semibold">{t('issues_back_btn')}</Link>
      </div>
    );
  }

  const projectCases = cases.filter(c => c.project_id === project.id && c.public_visibility !== 'private');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.back()} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> {t('issues_back_btn')}
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-8">
        <div className="p-8 md:p-12 border-b border-slate-200">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {project.verification_status === 'Verified' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" /> {t('proj_publicly_verifiable')}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                    Not publicly verifiable
                  </span>
                )}
                <span className="inline-flex items-center text-[11px] font-mono font-semibold text-slate-400 tracking-wider uppercase">
                  DEMO DATA
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">{project.name}</h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium">{project.operator}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 md:text-right shrink-0">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('proj_open_issues')}</p>
                <p className="text-3xl font-extrabold text-amber-600">{project.open_cases}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('proj_resolved_issues')}</p>
                <p className="text-3xl font-extrabold text-emerald-600">{project.resolved_cases}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-slate-100 text-sm text-slate-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              {project.district}, {project.province}
            </div>
            <div className="flex items-center">
              <Pickaxe className="w-4 h-4 mr-2 text-slate-400" />
              {project.commodity}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t('proj_obligations')}</h2>
            <div className="space-y-4">
              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                <div className="flex items-start mb-2">
                  <FileText className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">Dust Suppression</h4>
                    <p className="text-sm text-slate-600 mt-1">Operator must conduct water spraying on haul roads at least twice daily during dry season.</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                  <span>Source: ESIA 2024, Page 42</span>
                  <span className="font-semibold text-emerald-700">Verified</span>
                </div>
              </div>

              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                <div className="flex items-start mb-2">
                  <FileText className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">Water Quality Monitoring</h4>
                    <p className="text-sm text-slate-600 mt-1">Quarterly testing of community boreholes within 5km radius of tailings facility.</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                  <span>Source: EMA Permit Conditions</span>
                  <span className="font-semibold text-emerald-700">Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{t('proj_recent_issues')}</h2>
              <Link href="/issues" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">{t('nav_issues')}</Link>
            </div>
            
            <div className="space-y-4">
              {projectCases.slice(0, 3).map(c => (
                <Link href={`/issues/${c.reference_number}`} key={c.id} className="block group">
                  <div className="p-4 border border-slate-200 rounded-xl hover:border-emerald-400 transition-colors bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{c.reference_number}</span>
                      <span className="text-xs font-medium text-slate-500">{new Date(c.updated_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">{c.category}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{c.public_summary}</p>
                  </div>
                </Link>
              ))}
              
              {projectCases.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No public issues found for this project.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accountability Relationship View (Requirement #11) */}
      <div className="mb-8">
        <AccountabilityGraph />
      </div>
    </div>
  );
}
