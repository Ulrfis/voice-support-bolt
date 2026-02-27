import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases } from '../data/useCases';
import type { UseCaseId } from '../types';

interface Screen1HomeProps {
  onSelectUseCase: (useCaseId: UseCaseId) => void;
}

const disclaimer = {
  label: {
    fr: 'Avertissement : il s\'agit d\'une application de d\u00e9monstration \u2014 cliquez pour en savoir plus',
    en: 'Disclaimer: this is a demo application \u2014 click to learn more',
  },
  body: {
    fr: 'Cette application est une d\u00e9mo technique. Les cas d\'usage pr\u00e9sent\u00e9s sont fictifs. Son seul objectif est de montrer comment une transcription vocale peut \u00eatre automatiquement transform\u00e9e en donn\u00e9es structur\u00e9es gr\u00e2ce \u00e0 l\'API Gamilab.',
    en: 'This application is a technical demo. The use cases shown are fictional. Its sole purpose is to demonstrate how a voice transcription can be automatically transformed into structured data using the Gamilab API.',
  },
  troubleshoot: {
    fr: 'Si la capture audio est bloqu\u00e9e ou que la transformation ne se fait pas, rafra\u00eechissez la page.',
    en: 'If audio capture is blocked or the transformation does not work, refresh the page.',
  },
};

export function Screen1Home({ onSelectUseCase }: Screen1HomeProps) {
  const { language, t } = useLanguage();
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-charcoal mb-4 font-grotesk">
          {t('appTitle')}
        </h1>
        <p className="text-xl text-slate mb-8">
          {t('appSubtitle')}
        </p>

        <button
          onClick={() => setDisclaimerOpen(!disclaimerOpen)}
          className="inline-flex items-center gap-2 bg-spicy-sweetcorn bg-opacity-15 border border-spicy-sweetcorn border-opacity-40 text-spicy-sweetcorn rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-opacity-25 transition-all duration-200 mb-6"
        >
          <svg
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${disclaimerOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span>{disclaimer.label[language]}</span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            disclaimerOpen ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="max-w-2xl mx-auto bg-spicy-sweetcorn bg-opacity-10 border border-spicy-sweetcorn border-opacity-30 rounded-lg px-5 py-4 space-y-2">
            <p className="text-sm text-charcoal leading-relaxed">
              {disclaimer.body[language]}
            </p>
            <p className="text-sm text-charcoal leading-relaxed font-medium">
              {disclaimer.troubleshoot[language]}
            </p>
          </div>
        </div>

        <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 bg-off-white border border-light-gray px-6 sm:px-8 py-4 rounded-xl shadow-sm w-full sm:w-auto max-w-sm sm:max-w-none mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rockman-blue flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">1</div>
            <span className="text-sm font-medium text-charcoal">{t('step1')}</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-light-gray" />
          <div className="block sm:hidden w-5 h-px bg-light-gray" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-spicy-sweetcorn flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">2</div>
            <span className="text-sm font-medium text-charcoal">{t('step2')}</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-light-gray" />
          <div className="block sm:hidden w-5 h-px bg-light-gray" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rockman-blue flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">3</div>
            <span className="text-sm font-medium text-charcoal">{t('step3')}</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-charcoal mb-8 text-center font-grotesk">
        {t('selectUseCase')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {useCases.map((useCase) => (
          <button
            key={useCase.id}
            onClick={() => onSelectUseCase(useCase.id)}
            className="group flex flex-col items-center text-center bg-white border-2 border-light-gray rounded-2xl px-4 sm:px-6 py-8 sm:py-10 hover:border-rockman-blue hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rockman-blue focus:ring-offset-2 w-full"
          >
            <div className="text-5xl mb-5 transition-transform duration-200 group-hover:scale-110">
              {useCase.icon}
            </div>
            <span className="text-lg font-bold text-charcoal group-hover:text-rockman-blue transition-colors font-grotesk leading-tight mb-2">
              {useCase.name[language]}
            </span>
            <span className="text-sm text-silver leading-snug">
              {useCase.context[language]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
