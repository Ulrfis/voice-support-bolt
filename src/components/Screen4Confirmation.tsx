import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases, agents } from '../data/useCases';
import { isNotionConfigured, pushTicketToNotion } from '../lib/notion';
import type { Ticket } from '../types';

interface Screen4ConfirmationProps {
  ticket: Ticket;
  onViewAllTickets: () => void;
}

export function Screen4Confirmation({ ticket, onViewAllTickets }: Screen4ConfirmationProps) {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [notionStatus, setNotionStatus] = useState<'idle' | 'pushing' | 'done' | 'error'>('idle');
  const notionConfigured = isNotionConfigured();

  const useCase = useCases.find(uc => uc.id === ticket.use_case);
  const estimatedTime = ticket.priority === 'critical' ? 10 : ticket.priority === 'high' ? 20 : ticket.priority === 'medium' ? 35 : 45;

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-spicy-sweetcorn',
      high: 'bg-chunky-bee',
      medium: 'bg-joust-blue',
      low: 'bg-rockman-blue'
    };
    return colors[priority as keyof typeof colors] || 'bg-silver';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSend = async () => {
    console.log('Sending notification to:', email);
  };

  const handleNotionPush = async () => {
    setNotionStatus('pushing');
    const result = await pushTicketToNotion(ticket);
    setNotionStatus(result.success ? 'done' : 'error');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-spicy-sweetcorn bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-spicy-sweetcorn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-charcoal font-grotesk">
                {t('ticketCreated')} #{ticket.id.slice(0, 8)}
              </h1>
              <p className="text-xs text-slate">{formatDate(ticket.created_at)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
            {t(`priority${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}`)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 text-xs border-t border-light-gray pt-3">
          <div>
            <p className="text-slate">{t('status')}</p>
            <p className="font-medium text-charcoal">
              {t(`status${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', '')}`)}
            </p>
          </div>
          <div>
            <p className="text-slate">{t('category')}</p>
            <p className="font-medium text-charcoal">{ticket.category || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate">{useCase?.name[language]}</p>
            <p className="font-medium text-charcoal text-xs">{useCase?.context[language]}</p>
          </div>
        </div>

        {ticket.tags && ticket.tags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-light-gray">
            <div className="flex flex-wrap gap-1">
              {ticket.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-spicy-sweetcorn bg-opacity-20 text-charcoal rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-charcoal mb-2 text-sm font-grotesk flex items-center gap-2">
            <svg className="w-4 h-4 text-rockman-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {t('availableAgents')}
          </h3>
          <div className="space-y-2">
            {agents.map((agent, index) => (
              <div key={index} className="flex items-center gap-2 bg-white border border-light-gray rounded p-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rockman-blue to-joust-blue rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {agent.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal text-xs truncate">{agent.name}</p>
                  <p className="text-xs text-slate truncate">{agent.specialty[language]}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-charcoal text-xs">{estimatedTime + index * 5} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {useCase && (
          <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-charcoal mb-2 text-sm font-grotesk flex items-center gap-2">
              <svg className="w-4 h-4 text-rockman-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('usefulArticles')}
            </h3>
            <div className="space-y-1">
              {useCase.articles[language].map((article, index) => (
                <a
                  key={index}
                  href="#"
                  className="block p-2 border border-light-gray rounded hover:border-spicy-sweetcorn hover:bg-chunky-bee hover:bg-opacity-10 transition-colors"
                >
                  <span className="text-slate text-xs">{article}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotionIcon className="w-5 h-5 text-charcoal" />
            <div>
              <p className="text-sm font-semibold text-charcoal">{t('pushToNotion')}</p>
              {!notionConfigured && (
                <p className="text-xs text-slate">{t('notionConfigureHint')}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleNotionPush}
            disabled={!notionConfigured || notionStatus === 'pushing' || notionStatus === 'done'}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:cursor-not-allowed
              bg-charcoal text-white hover:bg-slate disabled:bg-silver disabled:text-white"
          >
            {notionStatus === 'pushing'
              ? (language === 'fr' ? 'Envoi...' : 'Pushing...')
              : notionStatus === 'done'
              ? (language === 'fr' ? '✓ Envoyé' : '✓ Pushed')
              : notionStatus === 'error'
              ? (language === 'fr' ? 'Réessayer' : 'Retry')
              : !notionConfigured
              ? t('notionNotConfigured')
              : t('pushToNotion')}
          </button>
        </div>
      </div>

      <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <label className="text-xs font-medium text-charcoal mb-1 block">
              {language === 'fr' ? 'Recevoir une notification' : 'Receive a notification'}
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-3 py-2 text-sm border border-light-gray rounded focus:ring-2 focus:ring-spicy-sweetcorn focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!email}
                className="px-4 py-2 bg-spicy-sweetcorn text-white rounded hover:bg-chunky-bee disabled:bg-silver disabled:cursor-not-allowed font-medium transition-colors shadow-sm text-sm"
              >
                {email ? t('sendWithEmail') : t('send')}
              </button>
            </div>
          </div>
          <button
            onClick={onViewAllTickets}
            className="inline-flex items-center gap-2 text-rockman-blue hover:text-joust-blue font-medium transition-colors text-sm whitespace-nowrap"
          >
            {t('viewAllTickets')} →
          </button>
        </div>
      </div>
    </div>
  );
}

function NotionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}
