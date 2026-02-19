import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases } from '../data/useCases';
import { loadAndInitSDK, connectGami, PORTAL_IDS, mapStructToTicket, type GamiSDK } from '../lib/gamilab';
import type { UseCaseId, Ticket } from '../types';

interface Screen2RecordingProps {
  useCaseId: UseCaseId;
  initialData?: Partial<Ticket>;
  existingTranscript?: string;
  onComplete: (ticketData: Partial<Ticket>, transcript: string, pass2Prompt: string) => void;
  onBack: () => void;
}

type InitPhase = 'idle' | 'loading_sdk' | 'connecting' | 'joining_portal' | 'creating_thread' | 'registering_events' | 'ready' | 'error';

const INIT_PHASE_LABELS: Record<InitPhase, { fr: string; en: string }> = {
  idle: { fr: 'Initialisation...', en: 'Initializing...' },
  loading_sdk: { fr: 'Chargement du SDK...', en: 'Loading SDK...' },
  connecting: { fr: 'Connexion au serveur...', en: 'Connecting to server...' },
  joining_portal: { fr: 'Accès au portail...', en: 'Joining portal...' },
  creating_thread: { fr: 'Création de la session...', en: 'Creating session...' },
  registering_events: { fr: 'Préparation...', en: 'Preparing...' },
  ready: { fr: 'Prêt', en: 'Ready' },
  error: { fr: 'Erreur', en: 'Error' },
};

const EXTRACTION_TIMEOUT_MS = 8000;

const QUESTION_FIELD_MAP: Record<UseCaseId, string[]> = {
  it_support: ['device', 'symptoms', 'frequency'],
  ecommerce: ['order_number', 'problem_type', 'product_description'],
  saas: ['feature', 'symptoms', 'impact'],
  dev_portal: ['request_type', 'description', 'urgency'],
};

const FIELD_LABELS: Record<string, { fr: string; en: string }> = {
  device: { fr: 'Appareil', en: 'Device' },
  symptoms: { fr: 'Symptômes', en: 'Symptoms' },
  frequency: { fr: 'Fréquence', en: 'Frequency' },
  environment: { fr: 'Environnement', en: 'Environment' },
  actions_tried: { fr: 'Actions essayées', en: 'Actions tried' },
  impact: { fr: 'Impact', en: 'Impact' },
  order_number: { fr: 'N° de commande', en: 'Order number' },
  problem_type: { fr: 'Type de problème', en: 'Problem type' },
  product_description: { fr: 'Produit concerné', en: 'Affected product' },
  delivery_status: { fr: 'Statut livraison', en: 'Delivery status' },
  desired_resolution: { fr: 'Résolution souhaitée', en: 'Desired resolution' },
  purchase_date: { fr: 'Date d\'achat', en: 'Purchase date' },
  feature: { fr: 'Fonctionnalité', en: 'Feature' },
  steps_to_reproduce: { fr: 'Étapes de reproduction', en: 'Steps to reproduce' },
  request_type: { fr: 'Type de demande', en: 'Request type' },
  description: { fr: 'Description', en: 'Description' },
  urgency: { fr: 'Urgence', en: 'Urgency' },
  context: { fr: 'Contexte', en: 'Context' },
  expected_behavior: { fr: 'Comportement attendu', en: 'Expected behavior' },
  ideas_needs: { fr: 'Idées / Besoins', en: 'Ideas / Needs' },
};

const EXCLUDED_DISPLAY_KEYS = new Set(['use_case', 'language', 'status', 'tags', 'priority', 'id', 'created_at', 'raw_transcript', 'email']);

export function Screen2Recording({ useCaseId, initialData, existingTranscript, onComplete, onBack }: Screen2RecordingProps) {
  const { language, t } = useLanguage();
  const useCase = useCases.find(uc => uc.id === useCaseId);

  const [initPhase, setInitPhase] = useState<InitPhase>('idle');
  const [initError, setInitError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [passCount, setPassCount] = useState(initialData ? 1 : 0);
  const [transcript, setTranscript] = useState(existingTranscript || '');
  const [liveText, setLiveText] = useState('');
  const [structData, setStructData] = useState<Partial<Ticket>>(initialData || {});
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gamiRef = useRef<GamiSDK | null>(null);
  const eventRefsRef = useRef<symbol[]>([]);
  const finalizingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const extractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const initAbortRef = useRef<AbortController | null>(null);

  const getFieldLabel = (fieldName: string) =>
    FIELD_LABELS[fieldName]?.[language] || fieldName;

  const getMissingRequiredFields = () => {
    if (!useCase) return [];
    return useCase.requiredFields.filter(f => !structData[f as keyof Ticket]);
  };

  const getMissingFieldsPrompt = () => {
    const missing = getMissingRequiredFields();
    if (missing.length === 0) return '';
    const labels = missing.map(f => getFieldLabel(f)).join(', ');
    return language === 'fr'
      ? `Merci de préciser : ${labels}`
      : `Please specify: ${labels}`;
  };

  const finalizeExtraction = useCallback(() => {
    console.log('[Gamilab] finalizeExtraction() called');
    if (extractionTimeoutRef.current) {
      clearTimeout(extractionTimeoutRef.current);
      extractionTimeoutRef.current = null;
    }
    finalizingRef.current = false;
    isStoppingRef.current = false;
    setIsRecording(false);
    setIsProcessing(false);
    setHasResult(true);
    setPassCount(prev => prev + 1);
  }, []);

  const cleanupEvents = useCallback(() => {
    const gami = gamiRef.current;
    if (gami && eventRefsRef.current.length > 0) {
      eventRefsRef.current.forEach(ref => gami.off(ref));
      eventRefsRef.current = [];
    }
  }, []);

  const registerEvents = useCallback((gami: GamiSDK) => {
    cleanupEvents();
    const refs: symbol[] = [];

    refs.push(gami.on('audio:recording', (state: unknown) => {
      console.log('[Gamilab] audio:recording →', state);
      if (!mountedRef.current) return;
      const recording = state === 'recording';
      setIsRecording(recording);
      if (!recording && finalizingRef.current) {
        setIsProcessing(true);
      }
    }));

    refs.push(gami.on('thread:text_current', (text: unknown) => {
      if (!mountedRef.current) return;
      setLiveText(typeof text === 'string' ? text : '');
    }));

    refs.push(gami.on('thread:text_history', (text: unknown) => {
      if (!mountedRef.current) return;
      setTranscript(typeof text === 'string' ? text : '');
      setLiveText('');
    }));

    refs.push(gami.on('thread:struct_current', (data: unknown) => {
      if (!mountedRef.current) return;
      const mapped = mapStructToTicket(data as Record<string, unknown>);
      if (Object.keys(mapped).length > 0) {
        setStructData(mapped);
      }
    }));

    refs.push(gami.on('thread:extraction_status', (status: unknown) => {
      console.log(`[Gamilab] thread:extraction_status → ${status} (finalizing: ${finalizingRef.current})`);
      if (!mountedRef.current) return;
      if (status === 'done' && finalizingRef.current) {
        finalizeExtraction();
      }
    }));

    eventRefsRef.current = refs;
  }, [cleanupEvents, finalizeExtraction]);

  const initSession = useCallback(async () => {
    if (initAbortRef.current) {
      initAbortRef.current.abort();
    }
    const abort = new AbortController();
    initAbortRef.current = abort;

    try {
      setInitPhase('loading_sdk');
      setInitError('');

      const gami = await loadAndInitSDK();
      if (abort.signal.aborted || !mountedRef.current) return;

      setInitPhase('connecting');
      await connectGami('gamilab.ch');
      if (abort.signal.aborted || !mountedRef.current) return;

      const portalId = PORTAL_IDS[useCaseId];
      setInitPhase('joining_portal');
      await gami.use_portal(portalId);
      if (abort.signal.aborted || !mountedRef.current) return;

      setInitPhase('registering_events');
      gamiRef.current = gami;
      registerEvents(gami);

      setInitPhase('creating_thread');
      const threadInfo = await gami.create_thread();
      console.log('[Gamilab] thread →', threadInfo.thread_id);
      if (abort.signal.aborted || !mountedRef.current) return;

      setInitPhase('ready');
    } catch (err) {
      if (abort.signal.aborted || !mountedRef.current) return;
      console.error('[Gamilab] Init error:', err);
      setInitPhase('error');
      setInitError(err instanceof Error ? err.message : String(err));
    }
  }, [useCaseId, registerEvents]);

  useEffect(() => {
    mountedRef.current = true;
    initSession();

    return () => {
      mountedRef.current = false;
      if (initAbortRef.current) initAbortRef.current.abort();
      if (extractionTimeoutRef.current) clearTimeout(extractionTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      cleanupEvents();
    };
  }, [useCaseId, initSession, cleanupEvents]);

  const handleStartRecording = async () => {
    if (!gamiRef.current) return;
    setHasResult(false);
    finalizingRef.current = false;
    isStoppingRef.current = false;
    try {
      if (passCount === 0) {
        await gamiRef.current.start_recording();
      } else {
        await gamiRef.current.resume_recording();
      }
    } catch (err) {
      console.error('[Gamilab] Recording start error:', err);
      setInitPhase('error');
      setInitError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleStopRecording = async () => {
    if (!gamiRef.current || isStoppingRef.current) return;
    isStoppingRef.current = true;
    finalizingRef.current = true;
    setIsRecording(false);
    setIsProcessing(true);
    try {
      await gamiRef.current.pause_recording();
    } catch (err) {
      console.error('[Gamilab] pause_recording error:', err);
    }

    if (extractionTimeoutRef.current) clearTimeout(extractionTimeoutRef.current);
    extractionTimeoutRef.current = setTimeout(() => {
      if (finalizingRef.current) {
        console.warn('[Gamilab] extraction_status timeout — forcing finalization');
        finalizeExtraction();
      }
    }, EXTRACTION_TIMEOUT_MS);
  };

  const handleRetry = () => {
    setInitPhase('idle');
    setInitError('');
    initSession();
  };

  const handleContinue = () => {
    onComplete(structData, transcript, getMissingFieldsPrompt());
  };

  if (!useCase) return <div>Error loading use case</div>;

  const questionFields = QUESTION_FIELD_MAP[useCaseId] || [];
  const missingFields = getMissingRequiredFields();
  const extraCapturedFields = Object.entries(structData).filter(([key, value]) => {
    if (!value || EXCLUDED_DISPLAY_KEYS.has(key)) return false;
    if (questionFields.includes(key)) return false;
    return true;
  });

  const answeredCount = questionFields.filter(f => !!structData[f as keyof Ticket]).length;
  const totalQuestions = questionFields.length;
  const targetProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (targetProgress <= displayedProgress) {
      setDisplayedProgress(targetProgress);
      return;
    }
    const step = Math.max(1, Math.round((targetProgress - displayedProgress) / 30));
    progressIntervalRef.current = setInterval(() => {
      setDisplayedProgress(prev => {
        const next = prev + step;
        if (next >= targetProgress) {
          clearInterval(progressIntervalRef.current!);
          progressIntervalRef.current = null;
          return targetProgress;
        }
        return next;
      });
    }, 50);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [targetProgress]);

  const progress = displayedProgress;
  const progressColor = targetProgress === 100 ? 'bg-spicy-sweetcorn' : 'bg-chunky-bee';
  const isInitializing = initPhase !== 'ready' && initPhase !== 'error';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate hover:text-charcoal transition-colors text-sm shrink-0"
          >
            ← {t('back')}
          </button>
          <h2 className="text-base sm:text-xl font-bold text-charcoal font-grotesk truncate">
            {useCase.icon} {useCase.name[language]}
          </h2>
        </div>
        <span className="text-xs text-slate bg-off-white border border-light-gray rounded-full px-3 py-1 shrink-0">
          {useCase.context[language]}
        </span>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate">{t('progressLabel')}</span>
          <span className="text-xs font-bold text-charcoal">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-charcoal text-sm font-grotesk">
                {language === 'fr' ? 'Questions clés' : 'Key questions'}
              </h3>
              <span className="text-xs text-slate">
                {answeredCount}/{questionFields.length} {language === 'fr' ? 'répondues' : 'answered'}
              </span>
            </div>

            <div className="space-y-2">
              {useCase.questions[language].map((question, index) => {
                const fieldName = questionFields[index];
                const rawValue = fieldName ? structData[fieldName as keyof Ticket] : undefined;
                const fieldValue = rawValue !== undefined && rawValue !== null
                  ? (Array.isArray(rawValue) ? rawValue.join(', ') : String(rawValue))
                  : undefined;
                const hasAnswer = !!fieldValue;

                return (
                  <div
                    key={index}
                    className={`rounded-lg border transition-all duration-200 ${
                      hasAnswer
                        ? 'border-spicy-sweetcorn border-opacity-50 bg-spicy-sweetcorn bg-opacity-5'
                        : 'border-light-gray bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          hasAnswer
                            ? 'bg-spicy-sweetcorn text-white'
                            : isRecording
                            ? 'bg-chunky-bee bg-opacity-30 text-chunky-bee border border-chunky-bee border-opacity-40 animate-pulse'
                            : 'bg-light-gray text-slate'
                        }`}
                      >
                        {hasAnswer ? '✓' : index + 1}
                      </span>
                      <span className={`text-sm flex-1 ${hasAnswer ? 'text-charcoal font-medium' : 'text-slate'}`}>
                        {question}
                      </span>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        hasAnswer ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {hasAnswer && (
                        <div className="px-4 pb-3 pl-12">
                          <p className="text-sm text-rockman-blue font-medium leading-relaxed">
                            {fieldValue}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {extraCapturedFields.length > 0 && (
              <div className="mt-4 pt-4 border-t border-light-gray">
                <p className="text-xs font-semibold text-slate mb-2 uppercase tracking-wide">
                  {language === 'fr' ? 'Infos complémentaires captées' : 'Additional captured info'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {extraCapturedFields.map(([key, value]) => {
                    const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                    return (
                      <div
                        key={key}
                        className="inline-flex items-center gap-1.5 bg-rockman-blue bg-opacity-10 border border-rockman-blue border-opacity-20 rounded-full px-3 py-1"
                      >
                        <span className="text-xs text-slate font-medium">{getFieldLabel(key)} :</span>
                        <span className="text-xs text-charcoal">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-5">
            {isInitializing && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-8 h-8 border-2 border-rockman-blue border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate">
                  {INIT_PHASE_LABELS[initPhase]?.[language] || t('connecting')}
                </p>
              </div>
            )}

            {initPhase === 'error' && (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-sm text-spicy-sweetcorn text-center">{initError || t('connectionError')}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-rockman-blue text-white rounded-lg text-sm font-medium hover:bg-joust-blue transition-colors"
                >
                  {t('retryConnection')}
                </button>
              </div>
            )}

            {initPhase === 'ready' && (
              <div className="flex flex-col gap-3">
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 py-3 text-slate text-sm">
                    <div className="w-4 h-4 border-2 border-rockman-blue border-t-transparent rounded-full animate-spin" />
                    <span>{t('processingAudio')}</span>
                  </div>
                )}

                {!isRecording && !isProcessing && !hasResult && (
                  <button
                    onClick={handleStartRecording}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rockman-blue text-white rounded-lg font-medium text-sm hover:bg-joust-blue transition-colors shadow-sm"
                  >
                    <MicIcon className="w-4 h-4" />
                    {passCount === 0 ? t('startRecording') : t('resumeRecording')}
                  </button>
                )}

                {isRecording && (
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-full bg-spicy-sweetcorn opacity-30 animate-ping" />
                      <button
                        onClick={handleStopRecording}
                        className="relative w-12 h-12 rounded-full bg-spicy-sweetcorn text-white flex items-center justify-center shadow-lg hover:bg-chunky-bee transition-colors"
                      >
                        <StopIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-spicy-sweetcorn">{t('recordingActive')}</p>
                      <button
                        onClick={handleStopRecording}
                        className="text-xs text-slate hover:text-charcoal underline transition-colors mt-0.5"
                      >
                        {t('stopRecording')}
                      </button>
                    </div>
                    <WaveformIcon />
                  </div>
                )}

                {hasResult && !isRecording && !isProcessing && (
                  <div className="flex flex-col gap-2">
                    {missingFields.length > 0 && (
                      <div className="bg-chunky-bee bg-opacity-10 border border-chunky-bee border-opacity-30 rounded-lg p-3">
                        <p className="text-xs font-semibold text-charcoal mb-1.5">
                          {t('missingFieldsTitle')} :
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {missingFields.map(f => (
                            <span key={f} className="text-xs bg-white border border-light-gray rounded-full px-2 py-0.5 text-charcoal">
                              {getFieldLabel(f)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {missingFields.length === 0 && (
                      <div className="flex items-center gap-2 bg-spicy-sweetcorn bg-opacity-10 border border-spicy-sweetcorn border-opacity-30 rounded-lg p-3">
                        <span className="text-spicy-sweetcorn font-bold text-base">✓</span>
                        <p className="text-xs font-medium text-charcoal">{t('allFieldsCaptured')}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      {missingFields.length > 0 && (
                        <button
                          onClick={handleStartRecording}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-off-white border border-light-gray text-charcoal rounded-lg font-medium text-xs hover:bg-light-gray transition-colors"
                        >
                          <MicIcon className="w-3.5 h-3.5" />
                          {t('recordMissingInfo')}
                        </button>
                      )}
                      <button
                        onClick={handleContinue}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 bg-spicy-sweetcorn text-white rounded-lg font-medium text-sm hover:bg-chunky-bee transition-colors shadow-sm ${
                          missingFields.length > 0 ? '' : 'w-full'
                        }`}
                      >
                        {t('continueToReview')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-off-white border border-light-gray rounded-lg shadow-sm p-5 flex flex-col">
          <h3 className="font-semibold text-charcoal mb-3 text-sm font-grotesk">
            {t('liveTranscription')}
          </h3>
          <div className="bg-white rounded-lg p-4 border border-light-gray flex-1 overflow-y-auto min-h-36 lg:min-h-48">
            {transcript || liveText ? (
              <p className="text-slate text-sm whitespace-pre-wrap leading-relaxed">
                {transcript}
                {liveText && (
                  <span className="text-slate opacity-70">
                    {transcript ? ' ' : ''}{liveText}
                    <span className="inline-block w-0.5 h-4 bg-slate ml-0.5 animate-pulse align-middle" />
                  </span>
                )}
              </p>
            ) : isRecording ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-spicy-sweetcorn rounded-full animate-pulse"
                      style={{
                        height: `${10 + Math.sin(i * 1.2) * 8 + 8}px`,
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate">
                  {language === 'fr' ? 'En écoute...' : 'Listening...'}
                </p>
              </div>
            ) : (
              <p className="text-silver text-sm italic">{t('speakNowHint')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {[3, 6, 9, 7, 4].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-spicy-sweetcorn rounded-full animate-pulse"
          style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
