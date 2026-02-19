import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import type { Ticket } from '../types';

interface BackofficeProps {
  onClose: () => void;
}

export function Backoffice({ onClose }: BackofficeProps) {
  const { language, t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tickets:', error);
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const deleteTicket = async (id: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer ce ticket ?' : 'Delete this ticket?')) return;

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (!error) {
      loadTickets();
      setSelectedTicket(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Created', 'Use Case', 'Status', 'Priority', 'Category'];
    const rows = filteredTickets.map(t => [
      t.id,
      new Date(t.created_at).toISOString(),
      t.use_case,
      t.status,
      t.priority,
      t.category || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    return tickets.filter(ticket => {
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesSearch = !normalizedSearch ||
        ticket.id.toLowerCase().includes(normalizedSearch) ||
        ticket.use_case.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, filterStatus, searchTerm]);

  const statusCounts = useMemo(() => {
    return {
      total: tickets.length,
      new: tickets.filter(t => t.status === 'new').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
  }, [tickets]);

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'text-red-700 bg-red-50 border border-red-200',
      high: 'text-spicy-sweetcorn bg-spicy-sweetcorn/10 border border-spicy-sweetcorn/30',
      medium: 'text-rockman-blue bg-rockman-blue/10 border border-rockman-blue/20',
      low: 'text-slate bg-off-white border border-light-gray'
    };
    return styles[priority as keyof typeof styles] || 'text-slate bg-off-white border border-light-gray';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'text-rockman-blue bg-rockman-blue/10 border border-rockman-blue/20',
      in_progress: 'text-spicy-sweetcorn bg-spicy-sweetcorn/10 border border-spicy-sweetcorn/30',
      waiting_customer: 'text-chunky-bee bg-chunky-bee/10 border border-chunky-bee/30',
      resolved: 'text-green-700 bg-green-50 border border-green-200',
      closed: 'text-slate bg-off-white border border-light-gray'
    };
    return styles[status as keyof typeof styles] || 'text-slate bg-off-white border border-light-gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate">
          <div className="w-5 h-5 border-2 border-rockman-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-white shadow-sm">
        <div className="h-0.5 bg-gradient-to-r from-rockman-blue via-spicy-sweetcorn to-chunky-bee" />
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/audiogami_logo-full-transparent_v2.png" alt="Audiogami" className="h-8 w-auto" />
              <div className="w-px h-6 bg-light-gray" />
              <h1 className="text-xl font-bold text-charcoal font-grotesk">{t('backoffice')}</h1>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors"
            >
              ← {t('back')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-light-gray p-5">
            <p className="text-xs text-slate mb-1 uppercase tracking-wide font-medium">Total</p>
            <p className="text-3xl font-bold text-charcoal font-grotesk">{statusCounts.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-light-gray p-5">
            <p className="text-xs text-slate mb-1 uppercase tracking-wide font-medium">{t('statusNew')}</p>
            <p className="text-3xl font-bold text-rockman-blue font-grotesk">{statusCounts.new}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-light-gray p-5">
            <p className="text-xs text-slate mb-1 uppercase tracking-wide font-medium">{t('statusInProgress')}</p>
            <p className="text-3xl font-bold text-spicy-sweetcorn font-grotesk">{statusCounts.in_progress}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-light-gray p-5">
            <p className="text-xs text-slate mb-1 uppercase tracking-wide font-medium">{t('statusResolved')}</p>
            <p className="text-3xl font-bold text-green-600 font-grotesk">{statusCounts.resolved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-light-gray p-5">
            <p className="text-xs text-slate mb-1 uppercase tracking-wide font-medium">{t('statusClosed')}</p>
            <p className="text-3xl font-bold text-silver font-grotesk">{statusCounts.closed}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-gray">
          <div className="p-6 border-b border-light-gray">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-charcoal font-grotesk">{t('allTickets')}</h2>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-rockman-blue text-white rounded-lg hover:bg-joust-blue text-sm font-medium transition-colors shadow-sm"
              >
                {t('export')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-light-gray rounded-lg text-sm focus:ring-2 focus:ring-spicy-sweetcorn focus:border-transparent outline-none"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-light-gray rounded-lg text-sm focus:ring-2 focus:ring-spicy-sweetcorn focus:border-transparent outline-none text-charcoal sm:w-auto w-full"
              >
                <option value="all">{language === 'fr' ? 'Tous les statuts' : 'All statuses'}</option>
                <option value="new">{t('statusNew')}</option>
                <option value="in_progress">{t('statusInProgress')}</option>
                <option value="waiting_customer">{t('statusWaitingCustomer')}</option>
                <option value="resolved">{t('statusResolved')}</option>
                <option value="closed">{t('statusClosed')}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-off-white border-b border-light-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate uppercase tracking-wide">{t('created')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate uppercase tracking-wide">Use Case</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate uppercase tracking-wide">{t('status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate uppercase tracking-wide">{t('priority')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate uppercase tracking-wide">{t('category')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate uppercase tracking-wide">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-off-white transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-charcoal">
                      {ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal">
                      {ticket.use_case}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate">
                      {ticket.category || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-rockman-blue hover:text-joust-blue font-medium mr-4 transition-colors"
                      >
                        {t('view')}
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTickets.length === 0 && (
              <div className="py-12 text-center text-slate text-sm">
                {language === 'fr' ? 'Aucun ticket trouvé' : 'No tickets found'}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-charcoal bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="h-0.5 bg-gradient-to-r from-rockman-blue via-spicy-sweetcorn to-chunky-bee rounded-t-xl" />
            <div className="p-6 border-b border-light-gray flex items-center justify-between">
              <h3 className="text-lg font-bold text-charcoal font-grotesk">{t('ticketDetails')}</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-gray text-slate hover:text-charcoal transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate mb-1 uppercase tracking-wide">ID</label>
                  <p className="text-charcoal font-mono text-sm break-all">{selectedTicket.id}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate mb-1 uppercase tracking-wide">{t('created')}</label>
                  <p className="text-charcoal text-sm">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedTicket.raw_transcript && (
                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate mb-2 uppercase tracking-wide">{t('transcription')}</label>
                  <div className="bg-off-white rounded-lg p-4 border border-light-gray">
                    <p className="text-charcoal text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.raw_transcript}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedTicket).map(([key, value]) => {
                  if (key === 'id' || key === 'created_at' || key === 'raw_transcript' || !value) return null;

                  return (
                    <div key={key} className="col-span-2">
                      <label className="block text-xs font-medium text-slate mb-1 uppercase tracking-wide">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-charcoal text-sm">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-light-gray bg-off-white rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-charcoal bg-white border border-light-gray rounded-lg hover:bg-light-gray text-sm font-medium transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
