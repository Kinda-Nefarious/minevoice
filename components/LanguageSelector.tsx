'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslation, SupportedLanguage } from '@/lib/i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';

export function LanguageSelector() {
  const { currentLang, setLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = supportedLanguages.find((l) => l.code === currentLang) || supportedLanguages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="font-semibold text-slate-900">{activeOption.nativeLabel}</span>
        <span className="text-slate-400 hidden lg:inline">({activeOption.label})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 border border-slate-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Community Language</p>
          </div>
          <div className="space-y-0.5" role="menu">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as SupportedLanguage);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  role="menuitem"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{lang.nativeLabel}</span>
                      <span className="text-[10px] text-slate-400 font-normal">· {lang.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{lang.region}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
