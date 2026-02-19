import { Monitor, ShoppingBag, BarChart3, Code2, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases } from '../data/useCases';
import type { UseCaseId } from '../types';

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  ShoppingBag,
  BarChart3,
  Code2,
};

const iconBg: Record<string, string> = {
  it_support: 'bg-rockman-blue/10 text-rockman-blue',
  ecommerce: 'bg-spicy-sweetcorn/20 text-chunky-bee',
  saas: 'bg-joust-blue/10 text-joust-blue',
  dev_portal: 'bg-rockman-blue/10 text-rockman-blue',
};

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

      <h2 className="text-2xl font-semibold text-charcoal mb-8 text-center font-grotesk">
        {t('selectUseCase')}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {useCases.map((useCase) => {
          const Icon = iconMap[useCase.icon] ?? Monitor;
          return (
            <button
              key={useCase.id}
              onClick={() => onSelectUseCase(useCase.id)}
              className="group flex flex-col items-center text-center bg-white border-2 border-light-gray rounded-2xl px-4 py-8 hover:border-rockman-blue hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rockman-blue focus:ring-offset-2"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110 ${iconBg[useCase.id]}`}>
                <Icon size={30} strokeWidth={1.75} />
              </div>
              <span className="text-base font-bold text-charcoal group-hover:text-rockman-blue transition-colors font-grotesk leading-tight mb-2">
                {useCase.name[language]}
              </span>
              <span className="text-xs text-silver leading-snug">
                {useCase.context[language]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
