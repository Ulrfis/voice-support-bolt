import { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Screen1Home } from './components/Screen1Home';
import { Screen2Recording } from './components/Screen2Recording';
import { Screen3HITL } from './components/Screen3HITL';
import { Screen4Confirmation } from './components/Screen4Confirmation';
import { Backoffice } from './components/Backoffice';
import { DebugPanel } from './components/DebugPanel';
import { supabase } from './lib/supabase';
import type { UseCaseId, Ticket, Language } from './types';

const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug-panel');

type Screen = 'home' | 'recording' | 'hitl' | 'confirmation' | 'backoffice';

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseId | null>(null);
  const [ticketData, setTicketData] = useState<Partial<Ticket>>({});
  const [transcript, setTranscript] = useState('');
  const [pass2Prompt, setPass2Prompt] = useState('');
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const handleSelectUseCase = (useCaseId: UseCaseId) => {
    setSelectedUseCase(useCaseId);
    setCurrentScreen('recording');
  };

  const handleRecordingComplete = async (data: Partial<Ticket>, trans: string, prompt: string) => {
    setTicketData(data);
    setTranscript(trans);
    setPass2Prompt(prompt);

    if (createdTicket) {
      const { data: updated, error } = await supabase
        .from('tickets')
        .update({ ...data, raw_transcript: trans })
        .eq('id', createdTicket.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ticket:', error);
        alert('Error updating ticket');
        return;
      }

      setCreatedTicket(updated);
      setCurrentScreen('hitl');
      return;
    }

    const ticketToCreate = {
      ...data,
      use_case: selectedUseCase!,
      status: 'new',
      priority: 'medium',
      tags: [],
      language: language,
      raw_transcript: trans
    };

    const { data: newTicket, error } = await supabase
      .from('tickets')
      .insert([ticketToCreate])
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket');
      return;
    }

    setCreatedTicket(newTicket);
    setCurrentScreen('hitl');
  };

  const handleValidate = async (finalData: Partial<Ticket>) => {
    if (!createdTicket) {
      console.error('No ticket to update');
      return;
    }

    const { data, error } = await supabase
      .from('tickets')
      .update(finalData)
      .eq('id', createdTicket.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      alert('Error updating ticket');
    } else {
      setCreatedTicket(data);
      setCurrentScreen('confirmation');
    }
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedUseCase(null);
    setTicketData({});
    setTranscript('');
    setPass2Prompt('');
    setCreatedTicket(null);
  };

  const handleViewBackoffice = () => {
    setCurrentScreen('backoffice');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className={`min-h-screen bg-white transition-all duration-300 ${DEBUG_MODE ? 'pr-[380px]' : ''}`}>
      {DEBUG_MODE && <DebugPanel />}
      {currentScreen !== 'backoffice' && (
        <header className="bg-white border-b border-light-gray sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🎙️</span>
              <span className="text-xl font-bold text-charcoal font-grotesk">Audiogami</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-off-white hover:bg-light-gray rounded font-medium text-charcoal transition-colors"
            >
              {language.toUpperCase()}
            </button>
          </div>
        </header>
      )}

      <main>
        {currentScreen === 'home' && (
          <Screen1Home onSelectUseCase={handleSelectUseCase} />
        )}

        {currentScreen === 'recording' && selectedUseCase && (
          <Screen2Recording
            useCaseId={selectedUseCase}
            initialData={createdTicket ? ticketData : undefined}
            onComplete={handleRecordingComplete}
            onBack={handleBackToHome}
          />
        )}

        {currentScreen === 'hitl' && selectedUseCase && createdTicket && (
          <Screen3HITL
            useCaseId={selectedUseCase}
            initialData={ticketData}
            transcript={transcript}
            ticketId={createdTicket.id}
            onValidate={handleValidate}
            onBack={() => setCurrentScreen('recording')}
          />
        )}

        {currentScreen === 'confirmation' && createdTicket && (
          <Screen4Confirmation
            ticket={createdTicket}
            onViewAllTickets={handleViewBackoffice}
          />
        )}

        {currentScreen === 'backoffice' && (
          <Backoffice onClose={handleBackToHome} />
        )}
      </main>

      {currentScreen !== 'backoffice' && (
        <footer className="bg-white border-t border-light-gray mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center">
            <p className="text-sm text-slate">
              {t('poweredBy')}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
