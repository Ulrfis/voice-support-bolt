import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases } from '../data/useCases';
import { transcriptExamples } from '../data/transcripts';
import type { UseCaseId, Ticket } from '../types';

interface Screen2RecordingProps {
  useCaseId: UseCaseId;
  onComplete: (ticketData: Partial<Ticket>, transcript: string, pass2Prompt: string) => void;
  onBack: () => void;
}

export function Screen2Recording({ useCaseId, onComplete, onBack }: Screen2RecordingProps) {
  const { language, t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [detectedFields, setDetectedFields] = useState<Partial<Ticket>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [pass2Prompt, setPass2Prompt] = useState('');
  const [isPass1Complete, setIsPass1Complete] = useState(false);
  const [isPass2Complete, setIsPass2Complete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const useCase = useCases.find(uc => uc.id === useCaseId);
  const examples = transcriptExamples.filter(ex => ex.use_case === useCaseId);
  const randomExample = examples[Math.floor(Math.random() * examples.length)];

  const typewriterEffect = async (
    text: string,
    fieldsToReveal: Partial<Ticket>,
    onChar?: (char: string, index: number) => void
  ) => {
    setIsTyping(true);
    setCurrentTranscript('');

    const textLength = text.length;
    const fieldKeys = Object.keys(fieldsToReveal).filter(
      key => key !== 'use_case' && key !== 'language' && key !== 'status' && fieldsToReveal[key as keyof Ticket]
    );
    const revealInterval = Math.floor(textLength / fieldKeys.length);

    for (let i = 0; i < textLength; i++) {
      await new Promise(resolve => setTimeout(resolve, 40));
      setCurrentTranscript(text.substring(0, i + 1));
      if (onChar) onChar(text[i], i);

      const fieldIndex = Math.floor(i / revealInterval);
      if (fieldIndex < fieldKeys.length && i % revealInterval === 0 && i > 0) {
        const fieldsToShow: Partial<Ticket> = {};
        for (let j = 0; j <= fieldIndex; j++) {
          const key = fieldKeys[j] as keyof Ticket;
          fieldsToShow[key] = fieldsToReveal[key];
        }
        setDetectedFields(fieldsToShow);
      }
    }

    setDetectedFields(fieldsToReveal);
    setIsTyping(false);
  };

  const handlePass1 = async () => {
    if (!randomExample) return;

    setProgress(30);
    const transcript = randomExample.pass1.transcript[language];

    await typewriterEffect(transcript, randomExample.pass1.fields, (_, index) => {
      const progressIncrement = (index / transcript.length) * 30;
      setProgress(30 + progressIncrement);
    });

    setProgress(60);
    await new Promise(resolve => setTimeout(resolve, 500));

    setMissingFields(randomExample.pass1.missingFields);
    setPass2Prompt(randomExample.pass2.prompt[language]);
    setIsPass1Complete(true);
  };

  const handlePass2 = async () => {
    if (!randomExample) return;

    const newTranscript = randomExample.pass2.transcript[language];

    setProgress(60);

    const updatedFields = { ...detectedFields, ...randomExample.pass2.fields };

    await typewriterEffect(newTranscript, updatedFields, (_, index) => {
      const newTextProgress = (index / newTranscript.length) * 40;
      setProgress(60 + newTextProgress);
    });

    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));

    setMissingFields([]);
    setIsPass2Complete(true);

    const fullTranscript = randomExample.pass1.transcript[language] + '\n\n' + newTranscript;

    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete(updatedFields, fullTranscript, pass2Prompt);
  };

  if (!useCase || !randomExample) {
    return <div>Error loading use case</div>;
  }

  const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: Record<string, { fr: string; en: string }> = {
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
      ideas_needs: { fr: 'Idées / Besoins', en: 'Ideas / Needs' }
    };

    return fieldLabels[fieldName]?.[language] || fieldName;
  };

  const getQuestionExamples = (index: number): { fr: string; en: string } => {
    const examples: Record<UseCaseId, { fr: string[]; en: string[] }> = {
      it_support: {
        fr: ['Ex: PC, clavier, souris, imprimante', 'Ex: écran noir, erreur, pas de connexion', 'Ex: depuis hier, une fois par jour'],
        en: ['Ex: PC, keyboard, mouse, printer', 'Ex: black screen, error, no connection', 'Ex: since yesterday, once a day']
      },
      ecommerce: {
        fr: ['Ex: 78432', 'Ex: pas reçu, mauvaise taille, produit défectueux', 'Ex: oui / non'],
        en: ['Ex: 78432', 'Ex: not received, wrong size, defective product', 'Ex: yes / no']
      },
      saas: {
        fr: ['Ex: export PDF, tableau de bord, login', 'Ex: erreur, lenteur, plantage', 'Ex: bloque le travail, gênant mais pas critique'],
        en: ['Ex: PDF export, dashboard, login', 'Ex: error, slowness, crash', 'Ex: blocks work, annoying but not critical']
      },
      dev_portal: {
        fr: ['Ex: bug / idée / question', 'Ex: double-clic crée doublons, manque documentation', 'Ex: urgent / pas urgent'],
        en: ['Ex: bug / idea / question', 'Ex: double-click creates duplicates, missing documentation', 'Ex: urgent / not urgent']
      }
    };

    return {
      fr: examples[useCaseId]?.fr[index] || '',
      en: examples[useCaseId]?.en[index] || ''
    };
  };

  const progressColor = progress < 60 ? 'bg-chunky-bee' : progress < 100 ? 'bg-chunky-bee' : 'bg-spicy-sweetcorn';

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
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate">{t('progressLabel')}</span>
          <span className="text-sm font-medium text-charcoal font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-charcoal mb-3 text-sm font-grotesk">Questions:</h3>
          <ul className="space-y-2">
            {useCase.questions[language].map((question, index) => {
              const examples = getQuestionExamples(index);
              return (
                <li key={index} className="flex items-start gap-2 text-sm group relative">
                  <span className="text-spicy-sweetcorn font-semibold shrink-0">{index + 1}.</span>
                  <div className="flex-1">
                    <span className="text-slate">{question}</span>
                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-charcoal text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                      {examples[language]}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handlePass1}
              disabled={isTyping || isPass1Complete}
              className="w-full px-4 py-2 bg-rockman-blue text-white rounded-lg hover:bg-joust-blue disabled:bg-silver disabled:cursor-not-allowed font-medium text-sm transition-colors shadow-sm"
            >
              {t('testPass1')}
            </button>

            {isPass1Complete && !isPass2Complete && missingFields.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-charcoal mb-2 text-sm font-grotesk">{t('remainingQuestions')}</h4>
                <div className="bg-chunky-bee bg-opacity-20 border border-chunky-bee rounded-lg p-3 mb-3">
                  <p className="text-charcoal text-xs">{pass2Prompt}</p>
                </div>
                <div className="space-y-1 mb-4">
                  {missingFields.map((field) => (
                    <div key={field} className="text-slate flex items-center gap-2 text-xs">
                      <span className="text-chunky-bee">•</span>
                      <span>{getFieldLabel(field)}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handlePass2}
                  disabled={isTyping}
                  className="w-full px-4 py-2 bg-spicy-sweetcorn text-white rounded-lg hover:bg-chunky-bee disabled:bg-silver disabled:cursor-not-allowed font-medium text-sm transition-colors shadow-sm"
                >
                  {t('testPass2')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-6">
          {currentTranscript ? (
            <>
              <h3 className="font-semibold text-charcoal mb-3 text-sm font-grotesk">{t('transcription')}:</h3>
              <div className="bg-white rounded-lg p-4 border border-light-gray mb-4 max-h-64 overflow-y-auto">
                <p className="text-slate text-sm whitespace-pre-wrap">{currentTranscript}</p>
              </div>

              {Object.keys(detectedFields).length > 0 && (
                <div>
                  <h3 className="font-semibold text-charcoal mb-2 text-sm font-grotesk">{t('detectedAnswers')}</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(detectedFields).map(([key, value]) => {
                      if (key === 'use_case' || key === 'language' || key === 'status' || !value) return null;

                      return (
                        <div
                          key={key}
                          className="bg-spicy-sweetcorn bg-opacity-10 border border-spicy-sweetcorn rounded-lg p-3 animate-fade-in"
                        >
                          <div className="font-medium text-charcoal text-xs mb-1 font-grotesk">
                            {getFieldLabel(key)}
                          </div>
                          <div className="text-slate text-xs">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-silver text-sm">
              {language === 'fr' ? 'La transcription apparaîtra ici...' : 'Transcription will appear here...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
