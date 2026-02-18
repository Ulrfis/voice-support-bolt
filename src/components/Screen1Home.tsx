import { useLanguage } from '../contexts/LanguageContext';
import { useCases } from '../data/useCases';
import type { UseCaseId } from '../types';

interface Screen1HomeProps {
  onSelectUseCase: (useCaseId: UseCaseId) => void;
}

export function Screen1Home({ onSelectUseCase }: Screen1HomeProps) {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-charcoal mb-4 font-grotesk">
          {t('appTitle')}
        </h1>
        <p className="text-xl text-slate mb-8">
          {t('appSubtitle')}
        </p>

        <div className="inline-flex items-center gap-6 bg-off-white border border-light-gray px-8 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rockman-blue flex items-center justify-center text-white font-bold text-sm shadow-sm">1</div>
            <span className="text-sm font-medium text-charcoal">{t('step1')}</span>
          </div>
          <div className="w-px h-5 bg-light-gray" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-spicy-sweetcorn flex items-center justify-center text-white font-bold text-sm shadow-sm">2</div>
            <span className="text-sm font-medium text-charcoal">{t('step2')}</span>
          </div>
          <div className="w-px h-5 bg-light-gray" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rockman-blue flex items-center justify-center text-white font-bold text-sm shadow-sm">3</div>
            <span className="text-sm font-medium text-charcoal">{t('step3')}</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-charcoal mb-6 text-center font-grotesk">
        {t('selectUseCase')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {useCases.map((useCase) => (
          <button
            key={useCase.id}
            onClick={() => onSelectUseCase(useCase.id)}
            className="bg-white border-2 border-light-gray rounded-xl p-8 hover:border-rockman-blue hover:shadow-lg transition-all duration-200 text-left group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rockman-blue to-spicy-sweetcorn opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-xl" />
            <div className="text-5xl mb-4">{useCase.icon}</div>
            <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-rockman-blue transition-colors font-grotesk">
              {useCase.name[language]}
            </h3>
            <p className="text-slate">
              {useCase.context[language]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
