import { useState, useEffect } from 'react';
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

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    const { error } = await supabase
      .from('tickets')
      .update(updates)
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
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = !searchTerm ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.use_case.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'new').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'text-blue-600 bg-blue-100',
      in_progress: 'text-purple-600 bg-purple-100',
      waiting_customer: 'text-yellow-600 bg-yellow-100',
      resolved: 'text-green-600 bg-green-100',
      closed: 'text-gray-600 bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t('backoffice')}</h1>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← {t('back')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{statusCounts.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">{t('statusNew')}</p>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.new}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">{t('statusInProgress')}</p>
            <p className="text-3xl font-bold text-purple-600">{statusCounts.in_progress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">{t('statusResolved')}</p>
            <p className="text-3xl font-bold text-green-600">{statusCounts.resolved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">{t('statusClosed')}</p>
            <p className="text-3xl font-bold text-gray-600">{statusCounts.closed}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('allTickets')}</h2>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                {t('export')}
              </button>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('created')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Use Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('priority')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('category')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.use_case}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.category || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        {t('view')}
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{t('ticketDetails')}</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <p className="text-gray-900 font-mono">{selectedTicket.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('created')}</label>
                  <p className="text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedTicket.raw_transcript && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('transcription')}</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.raw_transcript}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedTicket).map(([key, value]) => {
                  if (key === 'id' || key === 'created_at' || key === 'raw_transcript' || !value) return null;

                  return (
                    <div key={key} className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-gray-900">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
