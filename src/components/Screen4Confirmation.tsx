import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases, agents } from '../data/useCases';
import type { Ticket, UseCaseId } from '../types';

interface Screen4ConfirmationProps {
  ticket: Ticket;
  onViewAllTickets: () => void;
}

export function Screen4Confirmation({ ticket, onViewAllTickets }: Screen4ConfirmationProps) {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');

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
