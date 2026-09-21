'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { processGrievanceText, processGrievanceAudio } from '../actions/grievance';
import { useAppStore, IssueCategory, Route, GeolocationData, MatchedObligation, CaseAttachment, ReporterContact } from '@/lib/store';
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
  ShieldCheck,
  Edit3,
  Save,
  X,
  Globe,
  Compass,
  Sparkles,
  Building2,
  Paperclip,
  UploadCloud,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  UserCheck,
  UserX,
  Shield,
  HelpCircle,
  FileUp,
  File,
  Plus,
  Image as ImageIcon,
  Music
} from 'lucide-react';

type Step = 'choose' | 'input' | 'understanding' | 'followup' | 'evidence' | 'reporter_details' | 'privacy' | 'success';

const MINING_SECTOR_PRESETS = [
  { name: 'Ward 14 Chikwaka Village, Goromonzi (Lithium Belt)', lat: -17.8284, lng: 31.3541, district: 'Goromonzi', province: 'Mashonaland East', project: 'Mavambo Lithium Project' },
  { name: 'Ward 14 Haulage Corridor (Pit #2 Access)', lat: -17.8241, lng: 31.3489, district: 'Goromonzi', province: 'Mashonaland East', project: 'Mavambo Lithium Project' },
  { name: 'Nyagui River Stream Crossing (Ward 14)', lat: -17.8312, lng: 31.3598, district: 'Goromonzi', province: 'Mashonaland East', project: 'Mavambo Lithium Project' },
  { name: 'Chikwaka Primary School Perimeter', lat: -17.8220, lng: 31.3450, district: 'Goromonzi', province: 'Mashonaland East', project: 'Mavambo Lithium Project' },
  { name: 'Ward 8 Nyamuzuwe, Mutoko (Black Granite Concession)', lat: -17.3980, lng: 32.2260, district: 'Mutoko', province: 'Mashonaland East', project: 'Mutoko Granite Quarry Operations' },
  { name: 'Ward 6 Runde River Catchment, Zvishavane (Platinum / Chrome)', lat: -20.3267, lng: 30.0665, district: 'Zvishavane', province: 'Midlands', project: 'Zvishavane Mineral Operations' },
  { name: 'Ward 15 Deka River Basin, Hwange (Coal & Thermal Zone)', lat: -18.3647, lng: 26.4988, district: 'Hwange', province: 'Matabeleland North', project: 'Hwange Coal & Power Concession' },
  { name: 'Ward 11 Bikita Minerals Corridor (Lithium & Petalite)', lat: -19.9572, lng: 31.4329, district: 'Bikita', province: 'Masvingo', project: 'Bikita Minerals Lithium Project' },
  { name: 'Ward 29 Chiadzwa / Save River (Diamond Concessions)', lat: -19.4678, lng: 32.4821, district: 'Mutare Rural (Marange)', province: 'Manicaland', project: 'Chiadzwa Diamond Concessions' }
];

const KEY_MINING_DISTRICTS = [
  { district: 'Goromonzi', province: 'Mashonaland East', project: 'Mavambo Lithium Project' },
  { district: 'Mutoko', province: 'Mashonaland East', project: 'Mutoko Granite Quarry Operations' },
  { district: 'Zvishavane', province: 'Midlands', project: 'Zvishavane Mineral Operations' },
  { district: 'Shurugwi', province: 'Midlands', project: 'Shurugwi Chrome & Platinum Operations' },
  { district: 'Hwange', province: 'Matabeleland North', project: 'Hwange Coal & Power Concession' },
  { district: 'Bikita', province: 'Masvingo', project: 'Bikita Minerals Lithium Project' },
  { district: 'Mutare Rural (Marange)', province: 'Manicaland', project: 'Chiadzwa Diamond Concessions' },
  { district: 'Gwanda', province: 'Matabeleland South', project: 'Gwanda Greenstone Gold Mining' },
  { district: 'Kwekwe', province: 'Midlands', project: 'Kwekwe Gold & Roasting Complex' },
  { district: 'Bindura', province: 'Mashonaland Central', project: 'Bindura Nickel & Gold Operations' },
  { district: 'Mberengwa', province: 'Midlands', project: 'Sandawana Lithium & Emeralds' },
  { district: 'Geita', province: 'Geita Region', project: 'Lake Victoria Gold Corridor' },
  { district: 'Kolwezi', province: 'Lualaba', project: 'Copperbelt Extraction Zone' }
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

  // Smart Evidence Assistant & Real File Attachment state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<CaseAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEvidenceItems, setSelectedEvidenceItems] = useState<string[]>([]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newAttachment: CaseAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
          uploaded_at: new Date().toISOString(),
          caption: '',
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAttachmentCaption = (id: string, caption: string) => {
    setAttachments(prev => prev.map(a => a.id === id ? { ...a, caption } : a));
  };

  // Reporter Contact & Identity state (Dedicated Step 5)
  const [reporterChoice, setReporterChoice] = useState<'provide' | 'anonymous'>('provide');
  const [reporterName, setReporterName] = useState('');
  const [reporterCountryCode, setReporterCountryCode] = useState('+263');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterHasWhatsapp, setReporterHasWhatsapp] = useState(true);
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterRole, setReporterRole] = useState('Community Resident / Farmer');
  const [reporterVillage, setReporterVillage] = useState('');
  const [reporterContactMethod, setReporterContactMethod] = useState<'whatsapp' | 'sms' | 'call'>('whatsapp');
  const [reporterConsentAcknowledged, setReporterConsentAcknowledged] = useState(true);

  const [privacy, setPrivacy] = useState<'public_anonymous'|'public_community'|'private'>('public_anonymous');
  const [generatedRef, setGeneratedRef] = useState('');

  // Report fidelity editing state in Step 2
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedOriginal, setEditedOriginal] = useState('');
  const [editedEnglish, setEditedEnglish] = useState('');

  const handleSaveReportEdits = () => {
    if (aiResult) {
      setAiResult({
        ...aiResult,
        original_summary: editedOriginal,
        english_summary: editedEnglish,
      });
    }
    setIsEditingReport(false);
  };

  const handleSelectDistrict = (districtName: string, provinceName: string, projectName: string) => {
    if (aiResult) {
      setAiResult({
        ...aiResult,
        project_name: projectName,
        location: {
          ...(aiResult.location || {}),
          district: districtName,
          province: provinceName,
          location_analysis: `Location confirmed as ${districtName} (${provinceName}) for ${projectName}.`
        }
      });
    }
  };

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
      setEditedOriginal(result.original_summary || text);
      setEditedEnglish(result.english_summary || text);
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
      setEditedOriginal(result.original_summary || 'Voice message recorded by community member.');
      setEditedEnglish(result.english_summary || result.original_summary || 'Voice message recorded by community member.');
      setStep('understanding');
    } catch (error) {
      alert('Failed to process audio.');
    }
    setIsProcessing(false);
  };

  const getFollowUpQuestions = (category: string) => {
    if (currentLang === 'sw') {
      switch (category) {
        case 'Water & Pollution':
          return [
            { id: 'water_source', label: 'Ni chanzo gani cha maji kimeathiriwa? (Kisima, mto, chemchemi)' },
            { id: 'when_started', label: 'Uchafuzi au mabadiliko haya yalianza lini?' }
          ];
        case 'Air, Dust, Noise & Blasting':
          return [
            { id: 'frequency', label: 'Hali hii ya milipuko au vumbi hutokea mara ngapi kwa wiki?' },
            { id: 'damage', label: 'Je, kuna nyufa zimejitokeza kwenye nyumba au majengo ya jamii?' }
          ];
        default:
          return [
            { id: 'reported_before', label: 'Je, umewahi kuripoti suala hili kwa mamlaka yoyote hapo awali? Kwa nani?' },
            { id: 'outcome_sought', label: 'Ni suluhu au hatua gani unayotaka ichukuliwe?' }
          ];
      }
    }

    if (currentLang === 'nd') {
      switch (category) {
        case 'Water & Pollution':
          return [
            { id: 'water_source', label: 'Yiphi indawo yamanzi ethintekileyo? (Ibhobholo, umfula, kumbe umthombo)' },
            { id: 'when_started', label: 'Lokhu kungcola kwaqala nini?' }
          ];
        case 'Air, Dust, Noise & Blasting':
          return [
            { id: 'frequency', label: 'Lokhu kwenzakala kangaki ngeviki?' },
            { id: 'damage', label: 'Kukhona imifantu ebonakele ezindlini na?' }
          ];
        default:
          return [
            { id: 'reported_before', label: 'Wake wakubika lokhu kwabanye na? Kubani?' },
            { id: 'outcome_sought', label: 'Yisiphi isixazululo osifisayo?' }
          ];
      }
    }

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
    attachments.length > 0
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

    const reporterContactPayload: ReporterContact = reporterChoice === 'provide' ? {
      consent_to_contact: true,
      full_name: reporterName.trim() || undefined,
      phone_country_code: reporterCountryCode,
      phone_number: reporterPhone.trim() || undefined,
      whatsapp_available: reporterHasWhatsapp,
      email: reporterEmail.trim() || undefined,
      community_role: reporterRole,
      village_or_ward: reporterVillage.trim() || undefined,
      preferred_contact_method: reporterContactMethod,
      confidentiality_notice_acknowledged: reporterConsentAcknowledged,
    } : {
      consent_to_contact: false,
      preferred_contact_method: 'none',
      confidentiality_notice_acknowledged: true,
    };

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
      attachments,
      reporter_contact: reporterContactPayload,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          date: new Date().toISOString().split('T')[0],
          title: 'Grievance submitted',
          actor: 'Community Reporter',
          status_code: 'Submitted by platform',
          description: `Grievance registered with ${selectedEvidenceItems.length} evidence checklist item(s) and ${attachments.length} attached file(s). ${reporterChoice === 'provide' ? `Confidential contact registered (${reporterContactMethod.toUpperCase()} updates).` : 'Submitted 100% anonymously.'}`,
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
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2 overflow-x-auto gap-1">
            <span className={step === 'input' ? 'text-emerald-700 font-bold' : ''}>1. Tell Issue</span>
            <span>&rarr;</span>
            <span className={step === 'understanding' ? 'text-emerald-700 font-bold' : ''}>2. Review AI</span>
            <span>&rarr;</span>
            <span className={step === 'followup' ? 'text-emerald-700 font-bold' : ''}>3. Location</span>
            <span>&rarr;</span>
            <span className={step === 'evidence' ? 'text-emerald-700 font-bold' : ''}>4. Evidence</span>
            <span>&rarr;</span>
            <span className={step === 'reporter_details' ? 'text-emerald-700 font-bold' : ''}>5. Reporter Details</span>
            <span>&rarr;</span>
            <span className={step === 'privacy' ? 'text-emerald-700 font-bold' : ''}>6. Privacy & Submit</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{
                width: step === 'input' ? '16%' :
                       step === 'understanding' ? '33%' :
                       step === 'followup' ? '50%' :
                       step === 'evidence' ? '66%' :
                       step === 'reporter_details' ? '83%' : '100%'
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

      {/* STEP 1: INPUT TEXT OR AUDIO */}
      {step === 'input' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={(e) => {
              handleFileUpload(e.target.files);
              if (e.target) e.target.value = '';
            }}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,audio/*"
          />

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

              {/* Real Attachment Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    <span>Attach Files / Photos {attachments.length > 0 ? `(${attachments.length})` : ''}</span>
                  </button>
                  <p className="text-xs text-slate-500">
                    You can type in English, Shona, Ndebele, or Swahili.
                  </p>
                </div>
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

              {/* Attached Files Preview Grid */}
              {attachments.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <span>Attached Evidence Files ({attachments.length})</span>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add more
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-lg text-xs">
                        {file.type.startsWith('image/') && file.dataUrl ? (
                          <img src={file.dataUrl} alt={file.name} className="w-10 h-10 rounded object-cover border shrink-0" />
                        ) : file.type.startsWith('audio/') ? (
                          <div className="w-10 h-10 rounded bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                            <Music className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(file.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

              {/* Voice mode attachment button */}
              <div className="w-full max-w-md flex flex-col items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  <span>Attach Supporting Photos / Documents ({attachments.length})</span>
                </button>
                {attachments.length > 0 && (
                  <p className="text-xs text-emerald-700 font-medium">
                    {attachments.length} file(s) attached to this voice grievance.
                  </p>
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

      {/* STEP 2: REVIEW AI ANALYSIS, REPORT FIDELITY & LOCATION ANALYSIS */}
      {step === 'understanding' && aiResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Review AI Analysis & Reported Issue</h2>
              <p className="text-sm text-slate-600 mt-1">
                Your direct report is preserved below. Verify what was reported, the language translation, and where the issue could possibly be.
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
              Step 2 of 5
            </span>
          </div>

          {/* Verification & Language Meta Bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Detected Language:{' '}
                <strong className="text-slate-900">
                  {aiResult.detected_language === 'sn' ? 'ChiShona (Shona)' :
                   aiResult.detected_language === 'nd' ? 'isiNdebele (Ndebele)' :
                   aiResult.detected_language === 'sw' ? 'Kiswahili (Swahili)' : 'English'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Community Statement Preserved</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full ml-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{Math.round((aiResult.confidence || 0.9) * 100)}% Intake Confidence</span>
            </div>
          </div>

          {/* Section 1: Preserved Report Description & Multilingual Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Reported Issue Description
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isEditingReport) {
                    setIsEditingReport(false);
                  } else {
                    setEditedOriginal(aiResult.original_summary || '');
                    setEditedEnglish(aiResult.english_summary || '');
                    setIsEditingReport(true);
                  }
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-1 px-2.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                {isEditingReport ? (
                  <>
                    <X className="w-3.5 h-3.5" /> Cancel editing
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" /> Edit / refine text
                  </>
                )}
              </button>
            </div>

            {isEditingReport ? (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Original Statement
                  </label>
                  <textarea
                    rows={3}
                    value={editedOriginal}
                    onChange={(e) => setEditedOriginal(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter the exact community statement..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    English Summary (for formal public dossier & regulators)
                  </label>
                  <textarea
                    rows={3}
                    value={editedEnglish}
                    onChange={(e) => setEditedEnglish(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter factual English summary..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveReportEdits}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingReport(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Original Community Statement (as reported)
                  </span>
                  <div className="mt-1.5 text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm leading-relaxed">
                    &ldquo;{aiResult.original_summary}&rdquo;
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    English Summary for Authorities & Regulators
                  </span>
                  <p className="mt-1.5 text-slate-900 leading-relaxed font-medium text-sm bg-white p-3.5 rounded-xl border border-slate-200">
                    {aiResult.english_summary}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Where It Could Possibly Be (Location & Concession Analysis) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Where It Could Possibly Be (Location & Concession Analysis)
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Estimated Mining Operation / Project
                </span>
                <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {aiResult.project_name || 'Local Mining Operation'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Estimated District & Province
                </span>
                <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-500" />
                  {aiResult.location?.district && aiResult.location?.district !== 'Unspecified'
                    ? `${aiResult.location.district}${aiResult.location?.province && aiResult.location?.province !== 'Unspecified' ? `, ${aiResult.location.province}` : ''}`
                    : 'Unspecified District (Select below or in Step 3)'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 leading-relaxed">
              <span className="font-bold">Location Analysis: </span>
              {aiResult.location?.location_analysis || 'No specific location was mentioned in the report. Please select or pin your location below or in Step 3.'}
            </div>

            {/* Quick District Switcher */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Confirm or switch mining district / corridor:
              </label>
              <div className="flex flex-wrap gap-2">
                {KEY_MINING_DISTRICTS.map((item) => {
                  const isSelected = aiResult.location?.district === item.district;
                  return (
                    <button
                      key={item.district}
                      type="button"
                      onClick={() => handleSelectDistrict(item.district, item.province, item.project)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      <span>{item.district}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        ({item.province.replace('Mashonaland ', 'Mash. ').replace('Matabeleland ', 'Mat. ')})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Category & Potential Obligation Matches */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('report_category_label')}</span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-lg font-bold text-slate-900">{aiResult.category}</span>
                {aiResult.subcategory && (
                  <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">
                    {aiResult.subcategory}
                  </span>
                )}
                {aiResult.urgency && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    aiResult.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Urgency: {aiResult.urgency.toUpperCase()}
                  </span>
                )}
              </div>
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

            {/* Real File Upload & Attachment Manager */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <input
                type="file"
                ref={evidenceFileInputRef}
                multiple
                onChange={(e) => {
                  handleFileUpload(e.target.files);
                  if (e.target) e.target.value = '';
                }}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,audio/*"
              />

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Attach Supporting Documents, Photos & Audio (Optional)
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  {attachments.length} file(s) attached
                </span>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  Drop supporting photos, lab reports, or audio files here
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4 max-w-md mx-auto">
                  Photos of cracked walls, water discolouration, borehole lab tests, mining notices, or voice witness recordings (JPG, PNG, PDF, DOCX, MP3, WAV up to 25MB each).
                </p>
                <button
                  type="button"
                  onClick={() => evidenceFileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold shadow-sm inline-flex items-center gap-2 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  <span>Browse Files From Device</span>
                </button>
              </div>

              {/* Uploaded Files Gallery with Captions and Delete */}
              {attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Attached Files in Dossier ({attachments.length}):
                  </span>
                  <div className="space-y-2">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {file.type.startsWith('image/') && file.dataUrl ? (
                            <img
                              src={file.dataUrl}
                              alt={file.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : file.type.startsWith('audio/') ? (
                            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 border border-purple-100">
                              <Music className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 text-xs truncate">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {(file.size / 1024).toFixed(0)} KB • Uploaded just now
                            </div>
                          </div>
                        </div>

                        {/* Caption input */}
                        <div className="flex items-center gap-2 sm:w-1/2">
                          <input
                            type="text"
                            value={file.caption || ''}
                            onChange={(e) => handleUpdateAttachmentCaption(file.id, e.target.value)}
                            placeholder="Add brief note (e.g. Borehole water sample, blast crack)"
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(file.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button onClick={() => setStep('reporter_details')} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-colors shadow-sm flex items-center gap-2">
              <span>Continue to Reporter Details</span>
              <span>&rarr;</span>
            </button>
            <button onClick={() => setStep('followup')} className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors">
              {t('report_go_back')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REPORTER CONTACT & IDENTIFICATION (DEDICATED PAGE) */}
      {step === 'reporter_details' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Reporter Contact & Identification</h2>
              <p className="text-sm text-slate-600 mt-1">
                Decide whether you wish to provide contact details for case alerts or remain 100% anonymous.
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
              Step 5 of 6
            </span>
          </div>

          {/* Transparency & Whistleblower Information Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Why do we ask for reporter details, and how are you protected?</span>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-700">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  1. Direct Case Alerts
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Receive SMS or WhatsApp updates when environmental inspectors (EMA), mining commissioners, or company liaisons schedule site inspections or issue remediation notices.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  2. Legal & Advocacy Corroboration
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Accredited civil society legal teams (e.g. ZELA, human rights monitors) can reach out to gather witness statements, conduct independent water testing, or offer free legal representation.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  3. Strict Anti-Reprisal Shield
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Your identity is held in encrypted escrow and NEVER disclosed to mining operators, local concession security, or public portals without your explicit written authorization.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">100% Voluntary: </span>
                You are never required to provide your name or phone number. If you fear retribution or prefer discretion, you can select 100% Anonymous Mode and track case milestones anytime using your private Case Reference ID.
              </div>
            </div>
          </div>

          {/* Big Privacy Selection Cards */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Choose your contact preference:
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setReporterChoice('provide')}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
                  reporterChoice === 'provide'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Provide Contact Details</h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep me informed of official updates via WhatsApp or SMS. My details are confidential and shielded under whistleblower protocol.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReporterChoice('anonymous')}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
                  reporterChoice === 'anonymous'
                    ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                      <UserX className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Stay 100% Anonymous</h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Zero Contact Stored
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Do not store my name, phone number, or email. I will keep my Case Reference Number and check public updates manually.
                </p>
              </button>
            </div>
          </div>

          {/* Form if 'provide' is selected */}
          {reporterChoice === 'provide' ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Shield className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Confidential Contact Information
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Full Name or Pseudonym / Alias
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={e => setReporterName(e.target.value)}
                    placeholder="e.g. Tendai M. or Ward 14 Resident"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    You may use an alias, nickname, or initials if you prefer anonymity.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Phone Number (for Case Updates)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={reporterCountryCode}
                      onChange={e => setReporterCountryCode(e.target.value)}
                      className="p-3 border border-slate-300 rounded-xl text-xs text-slate-900 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shrink-0"
                    >
                      <option value="+263">ZW +263</option>
                      <option value="+27">ZA +27</option>
                      <option value="+260">ZM +260</option>
                      <option value="+258">MZ +258</option>
                      <option value="+255">TZ +255</option>
                      <option value="+243">CD +243</option>
                      <option value="+44">UK +44</option>
                      <option value="+1">US +1</option>
                      <option value="+">Other</option>
                    </select>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={e => setReporterPhone(e.target.value)}
                      placeholder="77 123 4567"
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="whatsapp-toggle"
                      checked={reporterHasWhatsapp}
                      onChange={e => setReporterHasWhatsapp(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <label htmlFor="whatsapp-toggle" className="text-[11px] text-slate-600 cursor-pointer">
                      This number is on WhatsApp (Recommended for low-data notifications)
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Preferred Notification Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReporterContactMethod('whatsapp')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        reporterContactMethod === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setReporterContactMethod('sms')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        reporterContactMethod === 'sms'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      📱 SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setReporterContactMethod('call')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        reporterContactMethod === 'call'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      📞 Phone Call
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={e => setReporterEmail(e.target.value)}
                    placeholder="name@example.com (optional)"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Community Role / Affiliation
                  </label>
                  <select
                    value={reporterRole}
                    onChange={e => setReporterRole(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="Community Resident / Farmer">Community Resident / Farmer</option>
                    <option value="Mine Worker / Contractor">Mine Worker / Contractor</option>
                    <option value="Youth / Community Organizer">Youth / Community Organizer</option>
                    <option value="Village Head / Traditional Leader">Village Head / Traditional Leader</option>
                    <option value="Healthcare Worker / Teacher">Healthcare Worker / Teacher</option>
                    <option value="Other Affected Resident">Other Affected Resident</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Village / Kraal / Ward (Optional)
                  </label>
                  <input
                    type="text"
                    value={reporterVillage}
                    onChange={e => setReporterVillage(e.target.value)}
                    placeholder="e.g. Chikwaka Village, Ward 14"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consent-check"
                  checked={reporterConsentAcknowledged}
                  onChange={e => setReporterConsentAcknowledged(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-0.5"
                />
                <label htmlFor="consent-check" className="text-xs text-slate-700 cursor-pointer leading-relaxed">
                  <span className="font-semibold text-slate-900">Confidentiality Guarantee: </span>
                  I understand that my contact details will be held in secure escrow. They will only be accessible to verified regulatory case officers or accredited human rights ombudsmen, and never released to mining concessionaires or public portals.
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-slate-700" />
                <span>Anonymous Mode Confirmed</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero personally identifiable information (no name, phone number, or email) will be stored with this grievance. Your submission will only contain the factual issue description, AI analysis, category, and any evidence you chose to attach.
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">How will you track your case?</div>
                <p>
                  Upon clicking submit on the next step, the platform will generate a unique private Case Reference Number (e.g. <strong>MG-2026-XXXX</strong>). You can save this number to track regulator responses and verification milestones anytime on the public tracking portal.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep('privacy')}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Continue to Privacy & Routing</span>
              <span>&rarr;</span>
            </button>
            <button
              type="button"
              onClick={() => setStep('evidence')}
              className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors"
            >
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
              <span className="text-xs font-semibold text-slate-500">Step 6 of 6</span>
            </div>
            <p className="text-slate-600 mb-6">{t('report_routes_sub')}</p>
            
            <div className="space-y-3 mb-6">
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

            {/* Submission Dossier Snapshot */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Dossier Contents:</span>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                  📎 {attachments.length} attachment(s)
                </span>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                  📋 {selectedEvidenceItems.length} evidence checklist item(s)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Reporter Status:</span>
                {reporterChoice === 'provide' ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold border border-emerald-200">
                    Protected Contact Registered ({reporterContactMethod.toUpperCase()})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg font-semibold">
                    100% Anonymous Mode
                  </span>
                )}
              </div>
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
            <button onClick={() => setStep('reporter_details')} className="px-6 py-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full font-semibold transition-colors">
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
          
          <div className="p-6 bg-slate-50 rounded-2xl inline-block border border-slate-200 mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('report_ref_label')}</p>
            <p className="text-3xl font-mono font-extrabold text-slate-900 tracking-wider">{generatedRef}</p>
          </div>

          {/* Submission confirmations */}
          <div className="max-w-md mx-auto space-y-2 text-xs text-left">
            {reporterChoice === 'provide' && reporterPhone ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Inspection and regulatory milestone updates will be sent via <strong>{reporterContactMethod.toUpperCase()}</strong> to <strong>{reporterCountryCode} {reporterPhone}</strong>.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Submitted in 100% Anonymous Mode. Keep your Case Reference ID safe to check public updates.</span>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>{attachments.length} supporting attachment(s)</strong> packaged in the intake dossier.
                </span>
              </div>
            )}
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
