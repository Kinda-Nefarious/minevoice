'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { processGrievanceText, processGrievanceAudio } from '../actions/grievance';
import { useAppStore, IssueCategory, Route, GeolocationData, MatchedObligation } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import GuidanceCard from '@/components/GuidanceCard';
import { getChecklistForCategory, calculateEvidenceCompleteness } from '@/lib/evidence-assistant';
import { 
  Mic, 
  Keyboard, 
  Loader2, 
  CheckCircle, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowLeft,
  MapPin,
  Navigation,
  Scale,
  Check,
  FileText,
  Lock,
  Eye,
  Info,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

type Step = 'choose' | 'input' | 'understanding' | 'followup' | 'evidence' | 'privacy' | 'success';

const MINING_SECTOR_PRESETS = [
  { name: 'Ward 14 Chikwaka Village (Near Tailings)', lat: -17.8284, lng: 31.3541 },
  { name: 'Ward 14 Haulage Corridor (Pit #2 Access)', lat: -17.8241, lng: 31.3489 },
  { name: 'Nyagui River Stream Crossing (Ward 14)', lat: -17.8312, lng: 31.3598 },
  { name: 'Chikwaka Primary School Perimeter', lat: -17.8220, lng: 31.3450 }
];

export default function ReportPage() {
  const router = useRouter();
  const cases = useAppStore(state => state.cases);
  const addCase = useAppStore(state => state.addCase);
  const { t, currentLang } = useTranslation();

  const [step, setStep] = useState<Step>('choose');
  const [inputType, setInputType] = useState<'text'|'audio'>('text');
  
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Geolocation state & Privacy Hardening
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationConsent, setLocationConsent] = useState<'precise' | 'approximate' | 'ward_only'>('approximate');
  const [sensitiveLocationProtected, setSensitiveLocationProtected] = useState(false);

  // Smart Evidence Assistant state
  const [selectedEvidenceItems, setSelectedEvidenceItems] = useState<string[]>([]);
  const [mockUploadedFileName, setMockUploadedFileName] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState<'public_anonymous'|'public_community'|'private'>('public_anonymous');
  const [generatedRef, setGeneratedRef] = useState('');

  // Geolocation handling
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus(t('report_geotag_capturing'));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        const acc = Math.round(position.coords.accuracy);

        setGeolocation({
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          captured_at: new Date().toISOString(),
          location_name: `Live GPS Fix (${lat}, ${lng})`,
          is_approximate: locationConsent !== 'precise',
          share_precision: locationConsent,
          consent_given: true,
          sensitive_location_protected: sensitiveLocationProtected
        });
        setIsLocating(false);
        setLocationStatus(null);
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus('GPS signal weak or permission blocked. You can pick a nearby concession sector below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectPreset = (preset: typeof MINING_SECTOR_PRESETS[0]) => {
    setGeolocation({
      latitude: preset.lat,
      longitude: preset.lng,
      accuracy: 25,
      captured_at: new Date().toISOString(),
      location_name: preset.name,
      is_approximate: true,
      share_precision: locationConsent === 'precise' ? 'precise' : 'approximate',
      consent_given: true,
      sensitive_location_protected: sensitiveLocationProtected
    });
    setLocationStatus(null);
  };

  // Audio handling
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1];
          await submitAudio(base64Audio, audioBlob.type);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const submitText = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const result = await processGrievanceText(text);
      setAiResult(result);
      // Pre-seed some evidence items from AI if available
      if (result.evidence_checklist_items && Array.isArray(result.evidence_checklist_items)) {
        // start empty so user can check
      }
      setStep('understanding');
    } catch (error) {
      alert('Failed to process. Please try again.');
    }
    setIsProcessing(false);
  };

  const submitAudio = async (base64Audio: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      const result = await processGrievanceAudio(base64Audio, mimeType);
      setAiResult(result);
      setStep('understanding');
    } catch (error) {
      alert('Failed to process audio.');
    }
    setIsProcessing(false);
  };

  const getFollowUpQuestions = (category: string) => {
    if (currentLang === 'sn') {
      switch (category) {
        case 'Water & Pollution':
          return [
            { id: 'water_source', label: 'Inzvimbo ipi yemvura yakanganisika? (Tsime, rwizi, kana bhodhoro)' },
            { id: 'when_started', label: 'Kusvibiswa uku kwakatanga riini?' }
          ];
        case 'Air, Dust, Noise & Blasting':
          return [
            { id: 'frequency', label: 'Izvi zvinoitika kakawanda sei pasvondo?' },
            { id: 'damage', label: 'Pane mitswe yakaonekwa padzimba here?' }
          ];
        default:
          return [
            { id: 'reported_before', label: 'Makambomhan’ara izvi kune vamwe here? Kunaani?' },
            { id: 'outcome_sought', label: 'Ndeipi mhinduro kana gadziriso yamunoda kuti iitwe?' }
          ];
      }
    }

    switch(category) {
      case 'Water & Pollution':
        return [
          { id: 'water_source', label: 'Which water source is affected? (Borehole, river, spring)' },
          { id: 'when_started', label: 'When did the contamination or change begin?' }
        ];
      case 'Air, Dust, Noise & Blasting':
        return [
          { id: 'frequency', label: 'How often does the blasting or dust activity occur?' },
          { id: 'damage', label: 'Have homes or community structures developed cracks?' }
        ];
      default:
        return [
          { id: 'reported_before', label: 'Have you reported this before? To whom?' },
          { id: 'outcome_sought', label: 'What outcome or resolution are you seeking?' }
        ];
    }
  };

  const toggleEvidenceItem = (itemLabel: string) => {
    if (selectedEvidenceItems.includes(itemLabel)) {
      setSelectedEvidenceItems(selectedEvidenceItems.filter(i => i !== itemLabel));
    } else {
      setSelectedEvidenceItems([...selectedEvidenceItems, itemLabel]);
    }
  };

  const currentCategory = aiResult?.category || 'Water & Pollution';
  const categoryChecklist = getChecklistForCategory(currentCategory);
  const evidenceAnalysis = calculateEvidenceCompleteness(
    selectedEvidenceItems.length,
    Boolean(mockUploadedFileName)
  );

  const submitFinal = () => {
    const refNum = `MG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedRef(refNum);
    
    // Final geolocation packaging with privacy enforcement
    let finalGeo = geolocation;
    if (finalGeo) {
      finalGeo = {
        ...finalGeo,
        share_precision: locationConsent,
        is_approximate: locationConsent !== 'precise' || sensitiveLocationProtected,
        sensitive_location_protected: sensitiveLocationProtected
      };
    }

    addCase({
      id: `c-${Date.now()}`,
      reference_number: refNum,
      status: 'Awaiting acknowledgement',
      urgency: aiResult.urgency || 'medium',
      original_language: aiResult.detected_language || currentLang || 'en',
      original_text: aiResult.original_summary || text || 'Voice message report',
      translated_text: aiResult.english_summary !== aiResult.original_summary ? aiResult.english_summary : null,
      category: (aiResult.category as IssueCategory) || 'Other / Unsure',
      subcategory: aiResult.subcategory || '',
      project_id: 'p-mavambo', // Mavambo Lithium Project
      province: aiResult.location?.province || 'Mashonaland East',
      district: aiResult.location?.district || 'Goromonzi',
      ward: aiResult.location?.ward || 'Ward 14',
      village_private: aiResult.location?.village || '',
      date_first_noticed: new Date().toISOString().split('T')[0],
      ongoing: true,
      immediate_danger: aiResult.immediate_danger || false,
      requested_remedy: answers['outcome_sought'] || '',
      ai_confidence: aiResult.confidence || 0.88,
      public_visibility: privacy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      routes: aiResult.suggested_routes || [],
      answers,
      public_summary: aiResult.english_summary || text,
      trust_label: 'Community reported',
      matched_obligations: aiResult.matched_obligations || [],
      geolocation: finalGeo,
      evidence_items: selectedEvidenceItems,
      evidence_completeness: evidenceAnalysis.level,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          date: new Date().toISOString().split('T')[0],
          title: 'Grievance submitted',
          actor: 'Community Reporter',
          status_code: 'Submitted by platform',
          description: `Grievance submitted with ${selectedEvidenceItems.length} supporting evidence checklist item(s).`,
          trust_label: 'Community reported'
        },
        {
          id: `t-${Date.now()}-2`,
          date: new Date().toISOString().split('T')[0],
          title: `Routed to ${aiResult.suggested_routes?.[0]?.authority_id?.toUpperCase() || 'Authority'}`,
          actor: 'MineVoice Platform',
          status_code: 'Awaiting acknowledgement',
          description: 'Official intake dossier formatted and routed to regulatory authority queue.',
          trust_label: 'Internal system'
        }
      ]
    });

    setStep('success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress indicator */}
      {step !== 'choose' && step !== 'success' && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className={step === 'input' ? 'text-emerald-700 font-bold' : ''}>1. Tell Issue</span>
            <span>&rarr;</span>
            <span className={step === 'understanding' ? 'text-emerald-700 font-bold' : ''}>2. Review AI Analysis</span>
            <span>&rarr;</span>
            <span className={step === 'followup' ? 'text-emerald-700 font-bold' : ''}>3. Details & Location</span>
            <span>&rarr;</span>
            <span className={step === 'evidence' ? 'text-emerald-700 font-bold' : ''}>4. Evidence (Optional)</span>
            <span>&rarr;</span>
            <span className={step === 'privacy' ? 'text-emerald-700 font-bold' : ''}>5. Privacy & Submit</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{
                width: step === 'input' ? '20%' :
                       step === 'understanding' ? '40%' :
                       step === 'followup' ? '60%' :
                       step === 'evidence' ? '80%' : '100%'
              }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: CHOOSE INPUT METHOD */}
      {step === 'choose' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('report_header_title')}</h1>
            <p className="text-slate-600 max-w-xl mx-auto">{t('report_header_sub')}</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-5">
            <button 
              onClick={() => { setInputType('audio'); setStep('input'); }} 
              className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl transition-all group text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mic className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{t('report_mode_speak')}</h3>
              <p className="text-sm text-slate-500">{t('report_mode_speak_desc')}</p>
            </button>

            <button 
              onClick={() => { setInputType('text'); setStep('input'); }} 
              className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl transition-all group text-center"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Keyboard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{t('report_mode_type')}</h3>
              <p className="text-sm text-slate-500">{t('report_mode_type_desc')}</p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INPUT TEXT OR AUDIO */}
      {step === 'input' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setStep('choose')} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('report_go_back')}
          </button>

          <h2 className="text-2xl font-bold text-slate-900">{t('report_describe_title')}</h2>
          
          {inputType === 'text' ? (
            <div className="space-y-4">
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full h-48 p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-slate-900 text-base"
                placeholder={t('report_placeholder')}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  You can type in English, Shona, Ndebele, or Swahili.
                </p>
                <button 
                  onClick={submitText}
                  disabled={!text.trim() || isProcessing}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-full font-semibold flex items-center justify-center shadow-sm transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin"/> {t('report_processing')}
                    </>
                  ) : (
                    t('report_continue_btn')
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center py-8 bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-sm text-slate-600 text-center max-w-md">
                {t('report_mode_speak_desc')}
              </p>
              <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center transition-colors">
                {isRecording ? (
                  <button onClick={stopRecording} className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-full">
                    <span className="w-8 h-8 bg-red-600 rounded-sm mb-2 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider">{t('report_stop_recording')}</span>
                  </button>
                ) : (
                  <button onClick={startRecording} className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-full group">
                    <Mic className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('report_start_recording')}</span>
                  </button>
                )}
              </div>
              {isProcessing && (
                <div className="flex items-center text-emerald-700 font-medium">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin"/> {t('report_processing')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: UNDERSTANDING & HARDENED OBLIGATION MATCHES */}
      {step === 'understanding' && aiResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{t('report_understood_title')}</h2>
            <span className="text-xs font-semibold text-slate-500">Step 2 of 5</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('report_category_label')}</span>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-lg font-bold text-slate-900">{aiResult.category}</span>
                {aiResult.subcategory && (
                  <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">
                    {aiResult.subcategory}
                  </span>
                )}
                {aiResult.confidence > 0.7 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {t('report_high_confidence')}
                  </span>
                )}
              </div>
            </div>

            {aiResult.original_summary && (
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Description</span>
                <p className="mt-1 text-slate-800 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm">
                  &ldquo;{aiResult.original_summary}&rdquo;
                </p>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">English Summary for Public Dossier</span>
              <p className="mt-1 text-slate-900 leading-relaxed font-medium">{aiResult.english_summary}</p>
            </div>

            {aiResult.immediate_danger && (
              <div className="p-4 bg-red-50 text-red-800 rounded-xl flex items-start border border-red-200">
                <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 shrink-0 text-red-600" />
                <p className="text-sm font-medium">{t('report_danger_warning')}</p>
              </div>
            )}

            {/* Hardened Potential Obligation Matches */}
            {aiResult.matched_obligations && aiResult.matched_obligations.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Potential Obligation Matches ({aiResult.matched_obligations.length})
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Statutory sources indexed from official regulatory instruments. These reflect potential relevance and do not constitute legal advice or formal determinations of liability.
                </p>

                <div className="space-y-3">
                  {aiResult.matched_obligations.map((ob: MatchedObligation, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-slate-900 text-sm">{ob.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {ob.match_strength || 'Strong obligation match'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-emerald-800 mb-1.5">
                        {ob.legal_instrument} • {ob.clause}
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed mb-2">
                        <span className="font-semibold text-slate-900">Requirement:</span> {ob.requirement}
                      </p>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-600">
                        <span className="font-semibold text-emerald-950">Potential formal remedy / escalation pathway:</span>{' '}
                        {ob.potential_remedy}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Source: {ob.source_name} ({ob.version_date})</span>
                        {ob.source_url && (
                          <a href={ob.source_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1">
                            Verified registry <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Legal Notice:</span> MineVoice helps organise and route information. It does not provide legal advice or determine legal liability.
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setStep('followup')} className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-colors">
              {t('report_confirm_correct')} &rarr;
            </button>
            <button onClick={() => setStep('input')} className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors">
              {t('report_go_back')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FOLLOW-UP & GEOLOCATION PRIVACY HARDENING */}
      {step === 'followup' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('report_more_details_title')}</h2>
              <span className="text-xs font-semibold text-slate-500">Step 3 of 5</span>
            </div>
            <p className="text-slate-600">{t('report_more_details_sub')}</p>
          </div>
          
          <div className="space-y-5">
            {getFollowUpQuestions(aiResult?.category || '').map(q => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-3">{q.label}</label>
                <input 
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                  className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                  placeholder={t('report_answer_placeholder')}
                />
              </div>
            ))}

            {/* Geolocation Section with Privacy Consent */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-slate-900">Location & Field Inspection Coordinates</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Providing an approximate or exact location helps authorities inspect the area. Public maps always mask exact coordinates.
                  </p>
                </div>
              </div>

              {/* Consent selection */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Location Sharing Consent
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationConsent('precise')}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      locationConsent === 'precise'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold mb-0.5">Share precise GPS for field dispatch</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      Accessible only to verified inspectorate with audit logging. Public sees approximate cluster.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationConsent('approximate')}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      locationConsent === 'approximate'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold mb-0.5">Approximate area only (Recommended)</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      Coordinates are blurred to the concession sector or ward centroid (500m–1km radius).
                    </div>
                  </button>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sensitive-loc-toggle"
                    checked={sensitiveLocationProtected}
                    onChange={e => setSensitiveLocationProtected(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <label htmlFor="sensitive-loc-toggle" className="text-xs text-slate-700 cursor-pointer">
                    <span className="font-bold">Sensitive location protection:</span> Treat as household dwelling or family graveyard; strictly blur to ward level.
                  </label>
                </div>
              </div>

              {geolocation ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        Location Captured
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">{geolocation.location_name}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-700">
                      Latitude: {geolocation.latitude} • Longitude: {geolocation.longitude} • Mode: {locationConsent}
                    </p>
                    <p className="text-[11px] text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Public map display: Approximate area for public safety.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeolocation(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 underline shrink-0"
                  >
                    Remove location
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCaptureGPS}
                      disabled={isLocating}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold inline-flex items-center shadow-sm transition-colors"
                    >
                      {isLocating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Capturing GPS...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          {t('report_geotag_btn')}
                        </>
                      )}
                    </button>
                  </div>

                  {locationStatus && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      {locationStatus}
                    </p>
                  )}

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Or select known concession sector:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MINING_SECTOR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-lg transition-colors text-slate-700 text-left"
                        >
                          📍 {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button onClick={() => setStep('evidence')} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-colors shadow-sm">
              Continue to Evidence Assistant &rarr;
            </button>
            <button onClick={() => setStep('understanding')} className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors">
              {t('report_go_back')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SMART EVIDENCE ASSISTANT */}
      {step === 'evidence' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Smart Evidence Assistant</h2>
              <span className="text-xs font-semibold text-slate-500">Step 4 of 5 (Optional)</span>
            </div>
            <p className="text-slate-600">
              This evidence may help document your grievance. You are never required to possess documentary evidence to submit a report, and lack of evidence does not mean your report is invalid.
            </p>
          </div>

          {/* Evidence Completeness Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Evidence Documentation Status
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${evidenceAnalysis.badgeColor}`}>
                  {evidenceAnalysis.level}
                </span>
              </div>
              <div className="text-right text-xs text-slate-500">
                {selectedEvidenceItems.length} checklist item(s) selected
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {evidenceAnalysis.helpText}
            </p>

            {/* Checklist items tailored to current category */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Relevant Evidence Checklist for {currentCategory}
              </h4>

              <div className="space-y-2.5">
                {categoryChecklist.map((item) => {
                  const isChecked = selectedEvidenceItems.includes(item.label);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleEvidenceItem(item.label)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                        <div className="text-[11px] text-emerald-800 font-medium">
                          Why this helps: {item.authoritative_relevance}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Photo or Document Attachment */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Attach Supporting Photo / File (Optional)
              </label>
              {mockUploadedFileName ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    {mockUploadedFileName} (Ready for attachment)
                  </span>
                  <button
                    onClick={() => setMockUploadedFileName(null)}
                    className="text-slate-500 hover:text-red-600 underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMockUploadedFileName('IMG_WaterSource_Turbid.jpg')}
                    className="px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1.5"
                  >
                    📷 Attach photo of affected water or cracks
                  </button>
                  <button
                    type="button"
                    onClick={() => setMockUploadedFileName('Borehole_Test_Notice_Sep2026.pdf')}
                    className="px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1.5"
                  >
                    📄 Attach document / previous notice
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button onClick={() => setStep('privacy')} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-colors shadow-sm">
              Continue to Privacy & Routing &rarr;
            </button>
            <button onClick={() => setStep('followup')} className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors">
              {t('report_go_back')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ROUTING & PRIVACY SELECTION */}
      {step === 'privacy' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('report_routes_title')}</h2>
              <span className="text-xs font-semibold text-slate-500">Step 5 of 5</span>
            </div>
            <p className="text-slate-600 mb-6">{t('report_routes_sub')}</p>
            
            <div className="space-y-3 mb-8">
              {aiResult?.suggested_routes?.map((route: Route, i: number) => (
                <div key={i} className="flex items-start p-4 border border-emerald-200 bg-emerald-50/70 rounded-2xl">
                  <ShieldAlert className="w-5 h-5 text-emerald-700 mr-3.5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 uppercase tracking-wide text-sm">{route.authority_id}</h4>
                    <p className="text-emerald-800 text-sm mt-0.5">{route.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('report_privacy_title')}</h2>
            <p className="text-slate-600 mb-4 text-sm">{t('report_privacy_sub')}</p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <button 
                onClick={() => setPrivacy('public_anonymous')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  privacy === 'public_anonymous' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-slate-900">{t('report_privacy_anon_title')}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{t('report_privacy_anon_desc')}</p>
              </button>
              
              <button 
                onClick={() => setPrivacy('private')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  privacy === 'private' ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-slate-700" />
                  <h4 className="font-bold text-slate-900">{t('report_privacy_private_title')}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{t('report_privacy_private_desc')}</p>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-4">
            <button onClick={submitFinal} className="flex-1 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-base transition-colors shadow">
              {t('report_submit_btn')}
            </button>
            <button onClick={() => setStep('evidence')} className="px-6 py-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors">
              {t('report_go_back')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: SUCCESS SCREEN */}
      {step === 'success' && (
        <div className="space-y-8 text-center animate-in zoom-in-95 duration-500 py-12">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">{t('report_success_title')}</h2>
          <p className="text-slate-600 max-w-md mx-auto">{t('report_success_sub')}</p>
          
          <div className="p-6 bg-slate-50 rounded-2xl inline-block border border-slate-200 mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('report_ref_label')}</p>
            <p className="text-3xl font-mono font-extrabold text-slate-900 tracking-wider">{generatedRef}</p>
          </div>

          {/* Compact "What Happens Next?" Guidance Card for Reporter */}
          {(() => {
            const createdCase = cases.find(c => c.reference_number === generatedRef);
            if (!createdCase) return null;
            return (
              <div className="max-w-xl mx-auto my-4 text-left">
                <GuidanceCard issue={createdCase} variant="compact" />
              </div>
            );
          })()}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/issues/${generatedRef}`} className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-colors">
              {t('report_track_case')}
            </Link>
            <Link href="/issues" className="px-8 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors">
              {t('report_view_directory')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
