'use client';
import Link from 'next/link';
import { LanguageSelector } from './LanguageSelector';
import { NotificationCenter } from './NotificationCenter';
import { useTranslation } from '@/lib/i18n';
import { Shield } from 'lucide-react';

export function Navigation() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              {t('nav_brand')}
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/report" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {t('nav_report')}
            </Link>
            <Link href="/issues" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {t('nav_issues')}
            </Link>
            <Link href="/projects" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {t('nav_projects')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Language Selector Dropdown */}
          <LanguageSelector />

          {/* Demo Authority Link */}
          <Link
            href="/authority"
            className="text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full transition-colors hidden sm:flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('nav_authority')}</span>
          </Link>
        </div>
      </div>

      {/* Mobile sub-bar for quick navigation */}
      <div className="flex md:hidden border-t border-slate-100 px-4 py-2 bg-slate-50/80 justify-around text-xs font-medium text-slate-600">
        <Link href="/report" className="hover:text-emerald-700 py-1">
          {t('nav_report')}
        </Link>
        <Link href="/issues" className="hover:text-emerald-700 py-1">
          {t('nav_issues')}
        </Link>
        <Link href="/projects" className="hover:text-emerald-700 py-1">
          {t('nav_projects')}
        </Link>
        <Link href="/authority" className="hover:text-emerald-700 py-1 font-semibold text-emerald-700">
          Authority
        </Link>
      </div>
    </header>
  );
}
