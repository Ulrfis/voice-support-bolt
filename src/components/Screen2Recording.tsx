import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases } from '../data/useCases';
import { waitForGami, PORTAL_IDS, mapStructToTicket, type GamiSDK } from '../lib/gamilab';
import type { UseCaseId, Ticket } from '../types';

interface Screen2RecordingProps {
  useCaseId: UseCaseId;
  onComplete: (ticketData: Partial<Ticket>, transcript: string, pass2Prompt: string) => void;
  onBack: () => void;
}

type InitStatus = 'connecting' | 'ready' | 'error';

const FIELD_LABELS: Record<string, { fr: string; en: string }> = {
  device: { fr: 'Appareil', en: 'Device' },
  symptoms: { fr: 'Symptômes', en: 'Symptoms' },
  frequency: { fr: 'Fréquence', en: 'Frequency' },
  environment: { fr: 'Environnement', en: 'Environment' },
  actions_tried: { fr: 'Actions essayées', en: 'Actions tried' },
  impact: { fr: 'Impact', en: 'Impact' },
  order_number: { fr: 'Numéro de commande', en: 'Order number' },
  problem_type: { fr: 'Type de problème', en: 'Problem type' },
  product_description: { fr: 'Description produit', en: 'Product description' },
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

export function Screen2Recording({ useCaseId, onComplete, onBack }: Screen2RecordingProps) {
  const { language, t } = useLanguage();
  const useCase = useCases.find(uc => uc.id === useCaseId);

  const [initStatus, setInitStatus] = useState<InitStatus>('connecting');
  const [initError, setInitError] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const [transcript, setTranscript] = useState('');
  const [liveText, setLiveText] = useState('');
  const [structData, setStructData] = useState<Partial<Ticket>>({});

  const gamiRef = useRef<GamiSDK | null>(null);
  const eventRefsRef = useRef<symbol[]>([]);
  const finalizingRef = useRef(false);

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

  useEffect(() => {
    let mounted = true;
    let gami: GamiSDK | null = null;

    const init = async () => {
      try {
        gami = await waitForGami();
        if (!mounted) return;

        await gami.connect('gamilab.ch');
        if (!mounted) return;

        await gami.use_portal(PORTAL_IDS[useCaseId]);
        if (!mounted) return;

        await gami.create_thread();
        if (!mounted) return;

        gamiRef.current = gami;

        const refs: symbol[] = [];

        refs.push(gami.on('audio:recording', (state: unknown) => {
          const recording = state === 'recording';
          setIsRecording(recording);
          if (!recording && finalizingRef.current) {
            setIsProcessing(true);
          }
        }));

        refs.push(gami.on('thread:text_current', (text: unknown) => {
          setLiveText(text as string || '');
        }));

        refs.push(gami.on('thread:text_history', (text: unknown) => {
          setTranscript(text as string || '');
          setLiveText('');
        }));

        refs.push(gami.on('thread:struct_current', (data: unknown) => {
          const mapped = mapStructToTicket(data as Record<string, unknown>);
          setStructData(mapped);
        }));

        refs.push(gami.on('thread:extraction_status', (status: unknown) => {
          if (status === 'done' && finalizingRef.current) {
            finalizingRef.current = false;
            setIsProcessing(false);
            setHasResult(true);
            setPassCount(prev => prev + 1);
            setProgress(100);
          }
        }));

        eventRefsRef.current = refs;
        setInitStatus('ready');
      } catch (err) {
        if (!mounted) return;
        setInitStatus('error');
        setInitError(err instanceof Error ? err.message : String(err));
      }
    };

    init();

    return () => {
      mounted = false;
      if (gami) {
        eventRefsRef.current.forEach(ref => gami!.off(ref));
        eventRefsRef.current = [];
        gami.disconnect().catch(() => {});
      }
    };
  }, [useCaseId]);

  useEffect(() => {
    if (!isRecording && !isProcessing) return;

    const target = isRecording ? 60 : 92;
    const interval = setInterval(() => {
      setProgress(prev => (prev < target ? prev + 0.6 : target));
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, isProcessing]);

  const handleStartRecording = async () => {
    if (!gamiRef.current) return;
    setHasResult(false);
    finalizingRef.current = false;
    setProgress(0);
    try {
      if (passCount === 0) {
        await gamiRef.current.start_recording();
      } else {
        await gamiRef.current.resume_recording();
      }
    } catch (err) {
      setInitStatus('error');
      setInitError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleStopRecording = async () => {
    if (!gamiRef.current) return;
    finalizingRef.current = true;
    await gamiRef.current.pause_recording();
  };

  const handleRetry = () => {
    setInitStatus('connecting');
    setInitError('');
    window.location.reload();
  };

  const handleContinue = () => {
    onComplete(structData, transcript, getMissingFieldsPrompt());
  };

  if (!useCase) return <div>Error loading use case</div>;

  const missingFields = getMissingRequiredFields();
  const capturedFieldCount = Object.entries(structData).filter(
    ([k, v]) => !['use_case', 'language', 'status', 'tags'].includes(k) && v
  ).length;

  const progressColor = hasResult ? 'bg-spicy-sweetcorn' : 'bg-chunky-bee';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate hover:text-charcoal transition-colors"
          >
            ← {t('back')}
          </button>
          <h2 className="text-2xl font-bold text-charcoal font-grotesk">
            {useCase.icon} {useCase.name[language]}
          </h2>
        </div>
        <span className="text-xs text-slate bg-off-white border border-light-gray rounded-full px-3 py-1">
          {useCase.context[language]}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate">{t('progressLabel')}</span>
          <span className="text-sm font-bold text-charcoal">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-charcoal mb-3 text-sm font-grotesk">
            {language === 'fr' ? 'Questions clés :' : 'Key questions:'}
          </h3>
          <ul className="space-y-2 mb-6">
            {useCase.questions[language].map((question, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-spicy-sweetcorn font-semibold shrink-0">{index + 1}.</span>
                <span className="text-slate">{question}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-4 border-t border-light-gray">
            {initStatus === 'connecting' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-10 h-10 border-2 border-rockman-blue border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate">{t('connecting')}</p>
              </div>
            )}

            {initStatus === 'error' && (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-sm text-spicy-sweetcorn text-center">{t('connectionError')}</p>
                {initError && <p className="text-xs text-slate text-center break-all">{initError}</p>}
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-rockman-blue text-white rounded-lg text-sm font-medium hover:bg-joust-blue transition-colors"
                >
                  {t('retryConnection')}
                </button>
              </div>
            )}

            {initStatus === 'ready' && (
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
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-spicy-sweetcorn opacity-30 animate-ping" />
                      <button
                        onClick={handleStopRecording}
                        className="relative w-16 h-16 rounded-full bg-spicy-sweetcorn text-white flex items-center justify-center shadow-lg hover:bg-chunky-bee transition-colors"
                      >
                        <StopIcon className="w-6 h-6" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-spicy-sweetcorn animate-pulse">
                      {t('recordingActive')}
                    </p>
                    <button
                      onClick={handleStopRecording}
                      className="text-xs text-slate hover:text-charcoal underline transition-colors"
                    >
                      {t('stopRecording')}
                    </button>
                  </div>
                )}

                {hasResult && !isRecording && !isProcessing && (
                  <div className="flex flex-col gap-3">
                    <div className="bg-white border border-light-gray rounded-lg p-3">
                      <p className="text-xs font-semibold text-charcoal mb-1 font-grotesk">
                        {language === 'fr' ? `${capturedFieldCount} champ(s) capturé(s)` : `${capturedFieldCount} field(s) captured`}
                      </p>
                      {missingFields.length === 0 ? (
                        <p className="text-xs text-rockman-blue">{t('allFieldsCaptured')}</p>
                      ) : (
                        <>
                          <p className="text-xs text-slate mb-2">{t('missingFieldsTitle')} :</p>
                          <div className="space-y-1">
                            {missingFields.map(f => (
                              <div key={f} className="flex items-center gap-2 text-xs text-charcoal">
                                <span className="text-chunky-bee">•</span>
                                <span>{getFieldLabel(f)}</span>
                              </div>
                            ))}
                          </div>
                          {getMissingFieldsPrompt() && (
                            <p className="mt-2 text-xs text-slate italic">{getMissingFieldsPrompt()}</p>
                          )}
                        </>
                      )}
                    </div>

                    {missingFields.length > 0 && (
                      <button
                        onClick={handleStartRecording}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-chunky-bee text-charcoal rounded-lg font-medium text-sm hover:bg-spicy-sweetcorn hover:text-white transition-colors shadow-sm"
                      >
                        <MicIcon className="w-4 h-4" />
                        {t('recordMissingInfo')}
                      </button>
                    )}

                    <button
                      onClick={handleContinue}
                      className="w-full px-4 py-2 bg-rockman-blue text-white rounded-lg font-medium text-sm hover:bg-joust-blue transition-colors shadow-sm"
                    >
                      {t('continueToReview')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-charcoal mb-2 text-sm font-grotesk">
              {t('liveTranscription')}
            </h3>
            <div className="bg-white rounded-lg p-4 border border-light-gray min-h-32 max-h-48 overflow-y-auto">
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
              ) : (
                <p className="text-silver text-sm italic">{t('speakNowHint')}</p>
              )}
            </div>
          </div>

          {Object.keys(structData).length > 0 && (
            <div className="flex-1">
              <h3 className="font-semibold text-charcoal mb-2 text-sm font-grotesk">
                {t('extractedData')}
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {Object.entries(structData).map(([key, value]) => {
                  if (!value || key === 'use_case' || key === 'language' || key === 'status') return null;
                  const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                  if (!displayValue) return null;

                  return (
                    <div
                      key={key}
                      className="bg-spicy-sweetcorn bg-opacity-10 border border-spicy-sweetcorn border-opacity-40 rounded-lg p-3 animate-fade-in"
                    >
                      <div className="font-medium text-charcoal text-xs mb-0.5 font-grotesk">
                        {getFieldLabel(key)}
                      </div>
                      <div className="text-slate text-xs">{displayValue}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isRecording && Object.keys(structData).length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4">
              <div className="flex items-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-spicy-sweetcorn rounded-full animate-pulse"
                    style={{
                      height: `${12 + i * 6}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
                <div className="w-1 bg-spicy-sweetcorn rounded-full animate-pulse h-8" style={{ animationDelay: '0.6s' }} />
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i + 5}
                    className="w-1 bg-spicy-sweetcorn rounded-full animate-pulse"
                    style={{
                      height: `${24 - i * 6}px`,
                      animationDelay: `${(i + 5) * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate">
                {language === 'fr' ? 'Les champs s\'extraient pendant que vous parlez...' : 'Fields are extracted as you speak...'}
              </p>
            </div>
          )}
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
