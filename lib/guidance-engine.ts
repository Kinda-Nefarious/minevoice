import { Case, IssueStatus, SupportedLanguage } from './store';
import { evaluateEscalation, EscalationRule, CONFIGURED_ESCALATION_RULES } from './escalation-rules';

export type ReporterActionLevel = 'none' | 'recommended' | 'required';

export type NextActionType =
  | 'draft'
  | 'needs_information'
  | 'ready_for_review'
  | 'prepared_for_submission'
  | 'awaiting_acknowledgement'
  | 'acknowledged'
  | 'information_requested'
  | 'under_review'
  | 'inspection_assigned'
  | 'inspection_completed'
  | 'action_reported'
  | 'awaiting_community_verification'
  | 'verified_resolved'
  | 'partially_resolved'
  | 'resolution_disputed'
  | 'redirected'
  | 'closed_without_resolution'
  | 'withdrawn';

export interface NextStepGuidance {
  action_type: NextActionType;
  headline: string;
  primary_message: string;
  secondary_message?: string;
  reporter_action_level: ReporterActionLevel;
  reporter_action_label: string;
  reporter_action_description: string;
  expected_next_step: string;
  expected_by_text?: string;
  response_clock: {
    label: string;
    days: number;
    benchmark_text?: string;
    source?: string;
    is_overdue: boolean;
    has_verified_deadline: boolean;
  };
  escalation: {
    available: boolean;
    rule_id?: string;
    title?: string;
    suggested_action?: string;
    why_suggested?: string;
    source_rule?: string;
    escalation_target?: string;
    contact_guidance?: string;
  };
  evidence_suggestion?: {
    text: string;
    items?: string[];
  };
  source_info: {
    badge: string;
    citation?: string;
    disclaimer: string;
  };
  cta?: {
    label: string;
    action_type: 'verify_resolution' | 'provide_info' | 'view_escalation' | 'add_evidence' | 'track_case' | 'none';
    target_id?: string;
  };
  tiny_indicator: string;
  last_updated: {
    label: string;
    formatted_date: string;
    relative_time: string;
    raw: string;
  };
  // Multilingual question titles
  questions: {
    where_now: string;
    what_next: string;
    action_needed: string;
    when_update: string;
    what_if_stalled: string;
  };
}

interface LanguageStrings {
  questions: {
    where_now: string;
    what_next: string;
    action_needed: string;
    when_update: string;
    what_if_stalled: string;
  };
  action_levels: {
    none: { label: string; desc: string };
    recommended: { label: string; desc: string };
    required: { label: string; desc: string };
  };
  tiny_prefix: {
    next: string;
    waiting_ack: string;
    review: string;
    inspection: string;
    verification: string;
    resolved: string;
    disputed: string;
  };
  last_updated_label: string;
}

const I18N_STRINGS: Record<'en' | 'sn' | 'nd' | 'sw', LanguageStrings> = {
  en: {
    questions: {
      where_now: 'Where is my grievance now?',
      what_next: 'What is expected to happen next?',
      action_needed: 'Do I need to do anything?',
      when_update: 'When should I expect another update?',
      what_if_stalled: 'What can I do if nothing happens?'
    },
    action_levels: {
      none: {
        label: 'No action required',
        desc: 'Nothing is required from you right now. The case is being processed.'
      },
      recommended: {
        label: 'Action recommended',
        desc: 'You may strengthen this grievance or monitor on-the-ground progress.'
      },
      required: {
        label: 'Action required',
        desc: 'Your input or community confirmation is needed to continue this workflow.'
      }
    },
    tiny_prefix: {
      next: 'Next',
      waiting_ack: 'Awaiting acknowledgement',
      review: 'Under review',
      inspection: 'Inspection scheduled',
      verification: 'Community verification',
      resolved: 'Verified resolved',
      disputed: 'Resolution disputed'
    },
    last_updated_label: 'Last update date'
  },
  sn: {
    questions: {
      where_now: 'Gunun’una rangu riri papi iye zvino?',
      what_next: 'Chii chiri kutarisirwa kuitika?',
      action_needed: 'Pane zvandinofanira kuita here?',
      when_update: 'Mhinduro inotarisirwa riini?',
      what_if_stalled: 'Ko kana pasina chinoitika?'
    },
    action_levels: {
      none: {
        label: 'Hapana chekuita',
        desc: 'Hapana zvamunofanira kuita pari zvino. Nyaya irikugadziriswa.'
      },
      recommended: {
        label: 'Zvinokurudzirwa',
        desc: 'Munogona kuwedzera humbowo kana kuongorora kufambira mberi munharaunda.'
      },
      required: {
        label: 'Danho rinodiwa',
        desc: 'Mhinduro yenyu kana kusimbisa kwenharaunda kuri kudiwa pari zvino.'
      }
    },
    tiny_prefix: {
      next: 'Zvinotevera',
      waiting_ack: 'Kutambirwa kwegunun’una',
      review: 'Kuongororwa kwenyaya',
      inspection: 'Kuongorora panzvimbo',
      verification: 'Kusimbisa kwenharaunda',
      resolved: 'Yapedzwa zvachose',
      disputed: 'Zvakapikiswa nenharaunda'
    },
    last_updated_label: 'Musi wekupedzisira kugadziriswa'
  },
  nd: {
    questions: {
      where_now: 'Isikhalazo sami siphi khathesi?',
      what_next: 'Kuyini okulandelayo?',
      action_needed: 'Kukhona okumele ngikwenze?',
      when_update: 'Isibuyekezo silindelwe nini?',
      what_if_stalled: 'Kuzakwenzakalani nxa kungekho okwenzakalayo?'
    },
    action_levels: {
      none: {
        label: 'Akukho okudingekayo',
        desc: 'Akukho okumele ukwenze khathesi. Indaba isasebenzwa.'
      },
      recommended: {
        label: 'Kuyakhuthazwa',
        desc: 'Ungafaka ubufakazi obungeziweyo kumbe uhlole inqubekela-phambili.'
      },
      required: {
        label: 'Isenzo siyadingeka',
        desc: 'Uvo lwakho kumbe isiqiniseko somphakathi siyadingeka khathesi.'
      }
    },
    tiny_prefix: {
      next: 'Okulandelayo',
      waiting_ack: 'Ukulindela ukwamukelwa',
      review: 'Ukuhlolisiswa',
      inspection: 'Ukuhlolwa kwendawo',
      verification: 'Ukuqinisekiswa ngumphakathi',
      resolved: 'Kuqediwe sibili',
      disputed: 'Kuphikiswe ngumphakathi'
    },
    last_updated_label: 'Ilanga lokucina lokulungiswa'
  },
  sw: {
    questions: {
      where_now: 'Lalamiko langu limefikia wapi sasa?',
      what_next: 'Nini kinachotarajiwa kufuata?',
      action_needed: 'Je, ninahitajika kufanya chochote?',
      when_update: 'Lini nitapokea taarifa inayofuata?',
      what_if_stalled: 'Nifanye nini kukiwa hakuna kinachoendelea?'
    },
    action_levels: {
      none: {
        label: 'Hakuna hatua inayohitajika',
        desc: 'Huna haja ya kufanya chochote kwa sasa. Kesi inashughulikiwa na mamlaka.'
      },
      recommended: {
        label: 'Hatua inapendekezwa',
        desc: 'Unaweza kuongeza ushahidi au kufuatilia maendeleo ya utatuzi eneo la tukio.'
      },
      required: {
        label: 'Hatua inahitajika',
        desc: 'Ushirikiano wako au uthibitisho wa jamii unahitajika ili kuendeleza mchakato huu.'
      }
    },
    tiny_prefix: {
      next: 'Inayofuata',
      waiting_ack: 'Inasubiri kupokewa',
      review: 'Inakaguliwa',
      inspection: 'Ukaguzi umepangwa',
      verification: 'Uthibitisho wa jamii',
      resolved: 'Imethibitishwa kutatuliwa',
      disputed: 'Inapingwa na jamii'
    },
    last_updated_label: 'Tarehe ya sasisho la mwisho'
  }
};

/**
 * Deterministically resolves the next step guidance object for any case.
 * Ensures zero AI hallucinations of government deadlines and strictly derives
 * guidance from case status, authority state, verified escalation rules,
 * and community verification feedback.
 */
export function resolveNextStepGuidance(
  issue: Case,
  lang: SupportedLanguage = 'en'
): NextStepGuidance {
  const activeLang: 'en' | 'sn' | 'nd' | 'sw' = (lang === 'sn' || lang === 'nd' || lang === 'sw') ? lang : 'en';
  const strings = I18N_STRINGS[activeLang];

  const primaryAuthority = issue.routes?.[0]?.authority_id?.toUpperCase() || 'EMA';
  const authorityFullName = getAuthorityFullName(issue.routes?.[0]?.authority_id || 'ema');

  // Response clock assessment & escalation check
  const escalation = evaluateEscalation(
    issue.status,
    issue.created_at,
    issue.updated_at,
    issue.routes?.[0]?.authority_id || 'ema',
    issue.category
  );

  const status = issue.status;
  const daysTotal = escalation.days_awaiting_acknowledgement;
  const daysUnderReview = escalation.days_under_review;
  const daysSinceUpdate = escalation.last_update_days_ago;

  // EMA has a known Client Charter standard of 5 working days for incident intake
  const isEma = (issue.routes?.[0]?.authority_id || 'ema').toLowerCase() === 'ema';

  // Base fallback structure
  let actionType: NextActionType = 'awaiting_acknowledgement';
  let headline = '';
  let primaryMessage = '';
  let secondaryMessage: string | undefined = undefined;
  let reporterActionLevel: ReporterActionLevel = 'none';
  let expectedNextStep = '';
  let expectedByText: string | undefined = undefined;
  let tinyIndicator = '';
  let evidenceSuggestionText: string | undefined = undefined;
  let evidenceItems: string[] | undefined = undefined;
  let cta: NextStepGuidance['cta'] = undefined;

  let responseClockDays = daysTotal;
  let responseClockLabel = 'Days waiting for acknowledgement';
  let responseClockBenchmark: string | undefined = undefined;
  let responseClockSource: string | undefined = undefined;
  let hasVerifiedDeadline = false;
  let isClockOverdue = false;

  let sourceBadge = 'MineVoice Process Guidance';
  let sourceCitation: string | undefined = undefined;
  const sourceDisclaimer = 'This is a simulated MineVoice workflow unless confirmed through an official integration. MineVoice helps organise and route information and does not provide legal advice.';

  switch (status) {
    case 'Draft': {
      actionType = 'draft';
      headline = activeLang === 'sn'
        ? 'Gunun’una renyu harisati ratumirwa.'
        : activeLang === 'nd'
        ? 'Isikhalazo sakho asikathunyelwa.'
        : activeLang === 'sw'
        ? 'Lalamiko lako bado halijawasilishwa rasmi.'
        : 'Your grievance has not been submitted yet.';
      primaryMessage = activeLang === 'sn'
        ? 'Ongororai mashoko enyu uye humbowo hwenyu musati matumira kune vane masimba.'
        : activeLang === 'nd'
        ? 'Hlolisisa imininingwane yakho lobufakazi ungakathumeli.'
        : activeLang === 'sw'
        ? 'Kagua maelezo yako na ushahidi unaounga mkono kabla ya kuwasilisha kwa mamlaka husika.'
        : 'Review your details and supporting evidence before submitting to the authorities.';
      reporterActionLevel = 'required';
      expectedNextStep = 'Complete and confirm submission.';
      tinyIndicator = 'Draft: Ready to submit';
      cta = { label: 'Continue Report', action_type: 'provide_info' };
      break;
    }

    case 'Needs information': {
      actionType = 'needs_information';
      headline = activeLang === 'sn'
        ? 'Mamwe mashoko anodiwa kuti nyaya iyi ienderere mberi.'
        : activeLang === 'nd'
        ? 'Kudingeka imininingwane eyengeziweyo ukuze indaba iqhubekele phambili.'
        : activeLang === 'sw'
        ? 'Maelezo zaidi yanahitajika kabla ya lalamiko hili kuendelea mbele.'
        : 'More information is needed before this grievance can move forward.';
      primaryMessage = activeLang === 'sn'
        ? 'Ndokumbira mupe nzvimbo inofungidzirwa uye musi wakatanga dambudziko iri.'
        : activeLang === 'nd'
        ? 'Sicela unikeze indawo ecatshangelwayo kanye lesikhathi okwaqala ngaso.'
        : activeLang === 'sw'
        ? 'Tafadhali toa makadirio ya eneo au eleza lini uchafuzi au athari zilipoanza.'
        : 'Please provide approximate location details or describe when the contamination or impact began.';
      reporterActionLevel = 'required';
      expectedNextStep = 'Add missing details to complete the intake file.';
      tinyIndicator = 'Action required: More info needed';
      cta = { label: 'Add Information', action_type: 'provide_info' };
      break;
    }

    case 'Ready for review': {
      actionType = 'ready_for_review';
      headline = activeLang === 'sn'
        ? 'Gunun’una renyu rine mashoko ose anodiwa.'
        : activeLang === 'nd'
        ? 'Isikhalazo sakho silemininingwane yonke edingekayo.'
        : activeLang === 'sw'
        ? 'Lalamiko lako lina taarifa zote kuu zinazohitajika kwa ukaguzi.'
        : 'Your grievance contains the main information needed for review.';
      primaryMessage = activeLang === 'sn'
        ? 'Tarisisai kana MineVoice yanzwisisa chirevo chenyu musati matumira.'
        : activeLang === 'nd'
        ? 'Hlola ukuthi iMineVoice iqonde kahle isikhalazo sakho ungakasithumeli.'
        : activeLang === 'sw'
        ? 'Hakikisha kwamba MineVoice imeelewa ripoti yako kwa usahihi kabla ya kuiwasilisha.'
        : 'Check that MineVoice understood your report correctly before submitting.';
      reporterActionLevel = 'recommended';
      expectedNextStep = 'Verification of summary and confirmation of routing.';
      tinyIndicator = 'Review: Ready for submission';
      cta = { label: 'Review Grievance', action_type: 'provide_info' };
      break;
    }

    case 'Prepared for submission': {
      actionType = 'prepared_for_submission';
      headline = activeLang === 'sn'
        ? `Gunun’una renyu rakagadzirira kutumirwa ku${primaryAuthority}.`
        : activeLang === 'nd'
        ? `Isikhalazo sakho silungele ukuthunyelwa ku-${primaryAuthority}.`
        : activeLang === 'sw'
        ? `Lalamiko lako liko tayari kutumwa kwa ${primaryAuthority}.`
        : `Your grievance is ready to be sent to ${primaryAuthority}.`;
      primaryMessage = `Intake dossier is prepared for ${authorityFullName}. Facts and approximate location will be shared.`;
      reporterActionLevel = 'required';
      expectedNextStep = `Dispatch to ${primaryAuthority} regulatory queue.`;
      tinyIndicator = `Ready for ${primaryAuthority}`;
      cta = { label: 'Confirm Submission', action_type: 'provide_info' };
      break;
    }

    case 'Submitted by platform':
    case 'Submitted externally by reporter':
    case 'Awaiting acknowledgement': {
      actionType = 'awaiting_acknowledgement';
      responseClockDays = daysTotal;
      responseClockLabel = 'Days waiting for acknowledgement';

      if (isEma) {
        hasVerifiedDeadline = true;
        responseClockBenchmark = 'Expected acknowledgement: within 5 working days';
        responseClockSource = 'EMA Client Service Charter (2022 Revision), Section 4.1';
        isClockOverdue = daysTotal >= 5;
      } else {
        hasVerifiedDeadline = false;
        responseClockBenchmark = 'MineVoice does not currently have a verified response deadline for this authority.';
        isClockOverdue = daysTotal >= 14;
      }

      headline = activeLang === 'sn'
        ? `Gunun’una renyu rakatumirwa ku${primaryAuthority}.`
        : activeLang === 'nd'
        ? `Isikhalazo sakho sesithunyelwe ku-${primaryAuthority}.`
        : activeLang === 'sw'
        ? `Lalamiko lako limewasilishwa kwa ${primaryAuthority}.`
        : `Your grievance has been submitted to ${primaryAuthority}.`;

      primaryMessage = activeLang === 'sn'
        ? `MineVoice yakamirira kuti ${primaryAuthority} itambire gunun’una iri pamutemo.`
        : activeLang === 'nd'
        ? `IMineVoice ilindele ukwamukelwa ngokusemthethweni kusuka ku-${primaryAuthority}.`
        : activeLang === 'sw'
        ? `MineVoice inasubiri uthibitisho rasmi wa kupokelewa kutoka kwa ${authorityFullName}.`
        : `MineVoice is waiting for formal acknowledgement from ${authorityFullName}.`;

      secondaryMessage = isClockOverdue
        ? `Submitted ${daysTotal} days ago. No authority acknowledgement has been recorded yet (standard timeframe: 5 working days).`
        : `Submitted ${daysTotal} day(s) ago with reference number ${issue.reference_number}. Case is in queue.`;

      reporterActionLevel = isClockOverdue ? 'recommended' : 'none';
      expectedNextStep = `Preliminary administrative intake and registration by ${primaryAuthority} District Officer.`;
      tinyIndicator = `Next: Awaiting ${primaryAuthority} acknowledgement`;

      sourceBadge = isEma ? 'Client Charter Standard' : 'MineVoice Process Guidance';
      sourceCitation = isEma ? 'EMA Client Service Charter (2022)' : undefined;

      if (issue.evidence_completeness !== 'Strong documentation') {
        evidenceSuggestionText = 'Additional supporting evidence (photos of water, date notes, or neighbor testimony) can strengthen your report while awaiting acknowledgement.';
        evidenceItems = ['Photographs of affected source', 'Date contamination first appeared', 'Witness testimony'];
      }
      break;
    }

    case 'Acknowledged': {
      actionType = 'acknowledged';
      responseClockDays = daysUnderReview || 1;
      responseClockLabel = 'Days since acknowledgement';
      headline = activeLang === 'sn'
        ? `${primaryAuthority} yatambira gunun’una renyu zviri pamutemo.`
        : activeLang === 'nd'
        ? `I-${primaryAuthority} isiyemukele isikhalazo sakho ngokusemthethweni.`
        : activeLang === 'sw'
        ? `${authorityFullName} imethibitisha rasmi kupokea lalamiko lako.`
        : `${authorityFullName} has acknowledged your grievance.`;

      primaryMessage = activeLang === 'sn'
        ? `Nyaya iyi yakanyoreswa muqueue ye${primaryAuthority}. Hapana chekuita kubva kwamuri pari zvino.`
        : activeLang === 'nd'
        ? `Indaba ibhalisiwe kuluhlu lwe-${primaryAuthority}. Akukho okumele ukwenze khathesi.`
        : activeLang === 'sw'
        ? `Kesi hii imesajiliwa kwenye orodha ya ${primaryAuthority}. Huna haja ya kufanya chochote kwa sasa.`
        : `The authority has formally accepted the grievance into their intake queue. No action is required from you right now.`;

      secondaryMessage = 'The authority has acknowledged the case. A technical assessment, inspector assignment, or request for additional details is expected next.';
      reporterActionLevel = 'none';
      expectedNextStep = 'Internal technical review, field visit scheduling, or inspector allocation.';
      tinyIndicator = `Next: ${primaryAuthority} review & inspection planning`;
      sourceBadge = 'Verified Authority Acknowledged';
      break;
    }

    case 'Information requested': {
      actionType = 'information_requested';
      headline = activeLang === 'sn'
        ? `${primaryAuthority} iri kukumbira mamwe mashoko pamusoro penyaya iyi.`
        : activeLang === 'nd'
        ? `I-${primaryAuthority} icela imininingwane eyengeziweyo ngaloludaba.`
        : activeLang === 'sw'
        ? `${authorityFullName} inaomba maelezo ya ziada kabla ya kuendelea mbele.`
        : `${authorityFullName} needs more information before continuing.`;

      primaryMessage = activeLang === 'sn'
        ? `Hofisi ye${primaryAuthority} yakumbira tsananguro yakadzama kana mifananidzo yehumbowo.`
        : activeLang === 'nd'
        ? `Ihhovisi le-${primaryAuthority} licele incazelo egcweleyo kumbe imifanekiso yobufakazi.`
        : activeLang === 'sw'
        ? `Ofisi ya ${primaryAuthority} imeomba ufafanuzi wa kina au picha za ushahidi kabla ya kuendelea na uchunguzi.`
        : `The authority has requested additional facts or documentation to substantiate the report before proceeding.`;

      secondaryMessage = 'Please provide the requested details so the regulatory inspection or review can proceed.';
      reporterActionLevel = 'required';
      expectedNextStep = 'Reporter submits requested clarifications or photographs.';
      tinyIndicator = 'Action required: Authority requested details';
      cta = { label: 'Provide Requested Information', action_type: 'provide_info' };
      break;
    }

    case 'Under review': {
      actionType = 'under_review';
      responseClockDays = daysUnderReview || daysSinceUpdate;
      responseClockLabel = 'Days under active review';
      headline = activeLang === 'sn'
        ? `Gunun’una renyu riri kuongororwa ne${primaryAuthority}.`
        : activeLang === 'nd'
        ? `Isikhalazo sakho sihlolisiswa yi-${primaryAuthority}.`
        : activeLang === 'sw'
        ? `Lalamiko lako linakaguliwa rasmi na ${authorityFullName}.`
        : `Your grievance is currently under review by ${authorityFullName}.`;

      primaryMessage = activeLang === 'sn'
        ? `Vakuru ve${primaryAuthority} vari kuongorora mashoko akapiwa. Hapana zvinodiwa kubva kwamuri pari zvino.`
        : activeLang === 'nd'
        ? `Iziphathamandla ze-${primaryAuthority} zihlola imininingwane. Akukho okudingekayo kuwe khathesi.`
        : activeLang === 'sw'
        ? `Maafisa wa ${primaryAuthority} wanakagua ukweli na vigezo vya kiufundi. Hakuna hatua inayohitajika kutoka kwako katika hatua hii.`
        : `The authority is reviewing the facts and technical merits. No action is required from you at this stage.`;

      secondaryMessage = daysSinceUpdate >= 10
        ? `No new update has been posted for ${daysSinceUpdate} days. Follow-up inquiry pathway is available.`
        : `Active review in progress. Last status update logged ${daysSinceUpdate} day(s) ago.`;

      reporterActionLevel = daysSinceUpdate >= 10 ? 'recommended' : 'none';
      expectedNextStep = 'Findings publication, concession directive, or dispatch of technical inspectors.';
      tinyIndicator = `Next: ${primaryAuthority} review findings`;
      break;
    }

    case 'Inspection assigned': {
      actionType = 'inspection_assigned';
      const inspector = issue.demo_inspection?.inspector_name || 'T. Hove';
      const proposedDate = issue.demo_inspection?.proposed_inspection_date || 'Upcoming';
      headline = activeLang === 'sn'
        ? `Mushandi wekuongorora panzvimbo akagadzwa ne${primaryAuthority}.`
        : activeLang === 'nd'
        ? `Umhloli wendawo usesabelwe yi-${primaryAuthority}.`
        : activeLang === 'sw'
        ? `Mkaguzi wa eneo la tukio ameteuliwa na ${primaryAuthority}.`
        : `An on-site inspection has been assigned by ${primaryAuthority}.`;

      primaryMessage = `Inspector ${inspector} has been designated for field assessment. Proposed date: ${proposedDate}.`;
      secondaryMessage = 'This is a simulated MineVoice workflow unless confirmed through an official integration.';
      reporterActionLevel = 'none';
      expectedNextStep = `Field visit to ${issue.ward || 'the community'} to perform technical audit or water sampling.`;
      tinyIndicator = `Next: Field inspection (${proposedDate})`;
      sourceBadge = 'Simulated MineVoice Workflow';
      break;
    }

    case 'Inspection completed': {
      actionType = 'inspection_completed';
      headline = activeLang === 'sn'
        ? 'Kuongorora panzvimbo kwapera; mushumo uri kugadzirwa.'
        : activeLang === 'nd'
        ? 'Ukuhlolwa kwendawo sekuqediwe; umbiko usalungiswa.'
        : activeLang === 'sw'
        ? 'Ukaguzi wa eneo umekamilika; taarifa rasmi ya ukaguzi inaandaliwa.'
        : 'Inspection completed; awaiting official inspection report.';

      primaryMessage = 'The field officer has completed the site inspection and sample collection. Findings are being compiled.';
      secondaryMessage = 'This is a simulated MineVoice workflow unless confirmed through an official integration.';
      reporterActionLevel = 'none';
      expectedNextStep = 'Publication of laboratory test results and determination of corrective action.';
      tinyIndicator = 'Next: Awaiting inspection findings & lab certs';
      sourceBadge = 'Simulated MineVoice Workflow';
      break;
    }

    case 'Action reported': {
      actionType = 'action_reported';
      const claimText = issue.authority_resolution_claim?.action_summary || 'Corrective remediation reported by operator and authority.';
      headline = activeLang === 'sn'
        ? 'Vakuru vakashuma kuti danho rekugadzirisa rakatorwa.'
        : activeLang === 'nd'
        ? 'Iziphathamandla zibike ukuthi kuthathwe isinyathelo sokulungisa.'
        : activeLang === 'sw'
        ? 'Mamlaka imeripoti kuwa hatua za utatuzi zimechukuliwa.'
        : 'The authority has reported that corrective action was taken.';

      primaryMessage = `The authority states: "${claimText}". Under MineVoice civic accountability protocols, an authority claim is not treated as final resolution until confirmed by affected community members.`;
      secondaryMessage = 'We are waiting for on-the-ground verification from community residents.';
      reporterActionLevel = 'required';
      expectedNextStep = 'Community verification feedback submission.';
      tinyIndicator = 'Next: Community confirmation required';
      cta = { label: 'Verify Outcome', action_type: 'verify_resolution', target_id: 'verification-section' };
      sourceBadge = 'Civic Verification Protocol';
      break;
    }

    case 'Awaiting community verification': {
      actionType = 'awaiting_community_verification';
      const claimSummary = issue.authority_resolution_claim?.action_summary || 'Work completed on site.';
      headline = activeLang === 'sn'
        ? 'Vane masimba vanoti dambudziko ragadziriswa. Zvino tinoda maonero enharaunda.'
        : activeLang === 'nd'
        ? 'Iziphathamandla zithi indaba isilungisiwe. Khathesi sidinga uvo lomphakathi.'
        : activeLang === 'sw'
        ? 'Mamlaka inasema tatizo hili limetatuliwa. Sasa tunahitaji uthibitisho wa jamii.'
        : 'The authority says this issue was addressed. We now need the community’s view.';

      primaryMessage = activeLang === 'sn'
        ? `Chirevo chemubatanidzwa chinoti: "${claimSummary}". Dambudziko iri ragadziriswa zvechokwadi munharaunda menyu here?`
        : activeLang === 'nd'
        ? `Isitatimende sithi: "${claimSummary}". Loludaba selulungiswe sibili emphakathini wenu na?`
        : activeLang === 'sw'
        ? `Taarifa ya mamlaka inasema: "${claimSummary}". Je, tatizo hili limetatuliwa kweli katika eneo lako?`
        : `The authority reported: "${claimSummary}". Has this problem actually been resolved on the ground?`;

      secondaryMessage = 'Under MineVoice standards, an institutional report alone does not close a case. Confirmation from residents who live near the site is required.';
      reporterActionLevel = 'required';
      expectedNextStep = 'Affected residents submit verification (Fully resolved, Partially resolved, or Disputed).';
      tinyIndicator = 'Action required: Community verification needed';
      cta = { label: 'Verify Resolution', action_type: 'verify_resolution', target_id: 'verification-section' };
      sourceBadge = 'Community Verification Standard';
      break;
    }

    case 'Verified resolved': {
      actionType = 'verified_resolved';
      headline = activeLang === 'sn'
        ? 'Gunun’una iri rakasimbiswa kuti rakagadziriswa zvizere.'
        : activeLang === 'nd'
        ? 'Loludaba seluqinisekiswe ukuthi selulungisiwe ngokupheleleyo.'
        : activeLang === 'sw'
        ? 'Lalamiko hili limethibitishwa kuwa limetatuliwa kikamilifu.'
        : 'This grievance has been verified as resolved.';

      primaryMessage = 'Both the authority’s corrective action and on-the-ground community verification have confirmed that the problem has been addressed.';
      secondaryMessage = issue.verification_feedback
        ? `Verified by ${issue.verification_feedback.verified_by || 'Community Representative'} on ${new Date(issue.verification_feedback.verified_at).toLocaleDateString()}.`
        : 'Community confirmation recorded.';
      reporterActionLevel = 'none';
      expectedNextStep = 'Case concluded. Archival for long-term concession compliance records.';
      tinyIndicator = 'Case: Verified resolved';
      sourceBadge = 'Two-Stage Verified Resolution';
      break;
    }

    case 'Partially resolved': {
      actionType = 'partially_resolved';
      headline = activeLang === 'sn'
        ? 'Mamwe matanho akatorwa, asi nharaunda inoti dambudziko harisati rapera zvizere.'
        : activeLang === 'nd'
        ? 'Kukhona okwenziweyo, kodwa umphakathi uthi indaba ayikaqediwe ngokugcweleyo.'
        : activeLang === 'sw'
        ? 'Baadhi ya hatua zimechukuliwa, lakini jamii inaripoti kuwa tatizo halijakwisha kabisa.'
        : 'Some action was taken, but the community reports the issue is not fully resolved.';

      primaryMessage = issue.verification_feedback?.verification_notes ||
        'The authority took initial action, but community feedback notes that key elements (such as lab certificates, compensation, or secondary repairs) remain pending.';
      secondaryMessage = 'Follow-up monitoring continues until outstanding requirements are satisfied.';
      reporterActionLevel = 'recommended';
      expectedNextStep = 'Outstanding laboratory certificates publication or completion of secondary works.';
      tinyIndicator = 'Status: Partially resolved (Ongoing)';
      sourceBadge = 'Community Verified Partial Resolution';
      break;
    }

    case 'Resolution disputed': {
      actionType = 'resolution_disputed';
      headline = activeLang === 'sn'
        ? 'Vane masimba vanoti dambudziko rapera, asi nharaunda inopikisa izvi.'
        : activeLang === 'nd'
        ? 'Iziphathamandla zithi indaba iphelile, kodwa umphakathi uyaphikisana lalokhu.'
        : activeLang === 'sw'
        ? 'Mamlaka inasema tatizo limetatuliwa, lakini jamii inapinga na kutokubaliana.'
        : 'The authority reports that the issue was resolved, but the community disagrees.';

      primaryMessage = 'The authority claimed corrective work was completed, but community residents report that the problem continues. MineVoice has not independently determined which account is correct.';
      secondaryMessage = 'A verified escalation pathway for tripartite dispute resolution is available.';
      reporterActionLevel = 'recommended';
      expectedNextStep = 'Extraordinary tripartite review or third-party independent testing.';
      tinyIndicator = 'Alert: Resolution disputed';
      cta = { label: 'View Escalation Options', action_type: 'view_escalation' };
      sourceBadge = 'Community Dispute Protocol';
      break;
    }

    case 'Redirected': {
      actionType = 'redirected';
      headline = activeLang === 'sw'
        ? `Lalamiko hili limeelekezwa kwa ${primaryAuthority}.`
        : `This grievance has been redirected to ${primaryAuthority}.`;
      primaryMessage = `The initial reviewer assessed that statutory jurisdiction belongs to ${authorityFullName}.`;
      reporterActionLevel = 'none';
      expectedNextStep = `Intake acknowledgement from ${primaryAuthority}.`;
      tinyIndicator = `Redirected to ${primaryAuthority}`;
      break;
    }

    case 'Closed without resolution': {
      actionType = 'closed_without_resolution';
      headline = activeLang === 'sw'
        ? 'Kesi hii imefungwa bila utatuzi uliothibitishwa.'
        : 'This case has been closed without a verified resolution.';
      primaryMessage = 'The institutional authority closed the record without on-the-ground community confirmation. You can review available formal appeal or escalation pathways.';
      reporterActionLevel = 'recommended';
      expectedNextStep = 'Independent legal clinic consultation or petition to the Provincial Directorate.';
      tinyIndicator = 'Closed without resolution';
      cta = { label: 'View Escalation Options', action_type: 'view_escalation' };
      break;
    }

    case 'Withdrawn': {
      actionType = 'withdrawn';
      headline = activeLang === 'sw'
        ? 'Lalamiko hili lilifutwa na mtoa taarifa.'
        : 'This grievance was withdrawn by the reporter.';
      primaryMessage = 'No further statutory action or community verification is scheduled for this record.';
      reporterActionLevel = 'none';
      expectedNextStep = 'Record archived.';
      tinyIndicator = 'Withdrawn by reporter';
      break;
    }

    default: {
      headline = `Case status: ${status}`;
      primaryMessage = `Your case is currently recorded as "${status}".`;
      expectedNextStep = 'Routine administrative processing.';
      tinyIndicator = `Status: ${status}`;
      break;
    }
  }

  // Check Escalation availability from verified rules
  let escalationRule: EscalationRule | null = escalation.suggested_rule;
  let escalationAvailable = Boolean(escalationRule);

  // If case is disputed, always prioritize the disputed escalation rule
  if (status === 'Resolution disputed') {
    const disputedRule = CONFIGURED_ESCALATION_RULES.find(r => r.trigger_condition === 'disputed_resolution');
    if (disputedRule) {
      escalationRule = disputedRule;
      escalationAvailable = true;
    }
  }

  // Reporter action label and description based on level
  const actionLevelInfo = strings.action_levels[reporterActionLevel];
  const reporterActionLabel = actionLevelInfo.label;
  const reporterActionDesc = actionLevelInfo.desc;

  // Format last update date
  const updatedDate = new Date(issue.updated_at || issue.created_at);
  const formattedDate = !isNaN(updatedDate.getTime()) 
    ? updatedDate.toLocaleDateString(
        activeLang === 'sn' ? 'sn-ZW' : activeLang === 'nd' ? 'nd-ZW' : activeLang === 'sw' ? 'sw-TZ' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : issue.updated_at;

  const daysAgo = Math.max(0, Math.floor((Date.now() - (isNaN(updatedDate.getTime()) ? Date.now() : updatedDate.getTime())) / (1000 * 60 * 60 * 24)));
  const relativeTime = daysAgo === 0 
    ? (activeLang === 'sn' ? 'Nhasi' : activeLang === 'nd' ? 'Lamuhla' : activeLang === 'sw' ? 'Leo' : 'Today')
    : daysAgo === 1
    ? (activeLang === 'sn' ? 'Nezuro' : activeLang === 'nd' ? 'Izolo' : activeLang === 'sw' ? 'Jana' : 'Yesterday')
    : (activeLang === 'sn' ? `Mazuva ${daysAgo} apfuura` : activeLang === 'nd' ? `Ensuku ezingi-${daysAgo} ezedluleyo` : activeLang === 'sw' ? `Siku ${daysAgo} zilizopita` : `${daysAgo} days ago`);

  return {
    action_type: actionType,
    headline,
    primary_message: primaryMessage,
    secondary_message: secondaryMessage,
    reporter_action_level: reporterActionLevel,
    reporter_action_label: reporterActionLabel,
    reporter_action_description: reporterActionDesc,
    expected_next_step: expectedNextStep,
    expected_by_text: expectedByText,
    response_clock: {
      label: responseClockLabel,
      days: responseClockDays,
      benchmark_text: responseClockBenchmark,
      source: responseClockSource,
      is_overdue: isClockOverdue,
      has_verified_deadline: hasVerifiedDeadline
    },
    escalation: {
      available: escalationAvailable,
      rule_id: escalationRule?.id,
      title: escalationRule?.title,
      suggested_action: escalationRule?.suggested_action,
      why_suggested: escalationRule?.why_suggested,
      source_rule: escalationRule?.source_rule,
      escalation_target: escalationRule?.escalation_target,
      contact_guidance: escalationRule?.contact_guidance
    },
    evidence_suggestion: evidenceSuggestionText ? {
      text: evidenceSuggestionText,
      items: evidenceItems
    } : undefined,
    source_info: {
      badge: sourceBadge,
      citation: sourceCitation,
      disclaimer: sourceDisclaimer
    },
    cta,
    tiny_indicator: tinyIndicator,
    last_updated: {
      label: strings.last_updated_label,
      formatted_date: formattedDate,
      relative_time: relativeTime,
      raw: issue.updated_at || issue.created_at
    },
    questions: strings.questions
  };
}

/**
 * Returns a short, compact next step indicator for issue cards in the public directory.
 * E.g. "Next: Awaiting EMA acknowledgement" or "Next: Community verification"
 */
export function getTinyNextStepIndicator(issue: Case, lang: SupportedLanguage = 'en'): string {
  const guidance = resolveNextStepGuidance(issue, lang);
  return guidance.tiny_indicator;
}

/**
 * Determines whether a tiny next-step indicator should be displayed on a public directory card.
 * Restricted to high-significance workflow states to prevent visual clutter.
 */
export function shouldShowTinyIndicator(issue: Case): boolean {
  return (
    issue.status === 'Awaiting acknowledgement' ||
    issue.status === 'Submitted by platform' ||
    issue.status === 'Awaiting community verification' ||
    issue.status === 'Action reported' ||
    issue.status === 'Information requested' ||
    issue.status === 'Resolution disputed'
  );
}

function getAuthorityFullName(authId: string): string {
  switch (authId.toLowerCase()) {
    case 'ema':
      return 'Environmental Management Agency (EMA)';
    case 'mines':
      return 'Ministry of Mines and Mining Development';
    case 'rdc':
      return 'Goromonzi Rural District Council (RDC)';
    case 'zhrc':
      return 'Zimbabwe Human Rights Commission (ZHRC)';
    case 'company':
      return 'Company Grievance Mechanism';
    default:
      return authId.toUpperCase();
  }
}
