import { X, Mic, CheckCircle, Send, ExternalLink, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const content = {
  fr: {
    title: 'À propos de cette application',
    subtitle: 'Voice Support Demo par Audiogami',
    whatIs: 'Qu\'est-ce que c\'est ?',
    whatIsBody: 'Cette application est un démonstrateur technique développé par Audiogami. Elle montre comment la voix d\'un utilisateur peut être capturée, transcrite et automatiquement transformée en données structurées en temps réel, grâce à l\'API Gamilab.',
    howItWorks: 'Comment ça marche ?',
    step1Title: 'Parlez',
    step1Body: 'L\'agent ou le client décrit son problème à voix haute. Gamilab transcrit et extrait les champs en temps réel.',
    step2Title: 'Vérifiez',
    step2Body: 'Un écran de validation humaine (Human-In-The-Loop) permet de corriger, compléter et valider les données extraites.',
    step3Title: 'Envoyez',
    step3Body: 'Le ticket est enregistré dans la base de données, prêt à être exploité par n\'importe quel outil métier.',
    useCases: 'Cas d\'usage fictifs présentés',
    useCasesBody: 'L\'application propose 4 scénarios de démonstration : Support IT, E-commerce, SaaS CRM et Portail Développeur. Ces cas d\'usage illustrent la polyvalence de l\'extraction structurée à partir de la voix.',
    techStack: 'Stack technique',
    techStackBody: 'React, TypeScript, Vite, Tailwind CSS, Supabase (base de données PostgreSQL), SDK Gamilab (WebSocket temps réel), Lucide React (icônes), PostHog (analytics).',
    aboutAudiogami: 'À propos d\'Audiogami',
    aboutAudiogamiBody: 'Audiogami est un projet développé par Gamilab qui explore les applications de l\'intelligence artificielle appliquée à la voix. L\'API Gamilab, au cœur de ce démonstrateur, permet de transformer des flux audio en données exploitables de manière automatique et configurable.\n\nCe démonstrateur a été développé par Memoways, partenaire d\'implémentation de Gamilab.',
    feedbackBtn: 'Faire un feedback / prendre contact',
    close: 'Fermer',
  },
  en: {
    title: 'About this application',
    subtitle: 'Voice Support Demo by Audiogami',
    whatIs: 'What is it?',
    whatIsBody: 'This application is a technical demonstrator developed by Audiogami. It shows how a user\'s voice can be captured, transcribed and automatically transformed into structured data in real time, using the Gamilab API.',
    howItWorks: 'How does it work?',
    step1Title: 'Speak',
    step1Body: 'The agent or client describes their problem out loud. Gamilab transcribes and extracts fields in real time.',
    step2Title: 'Review',
    step2Body: 'A Human-In-The-Loop validation screen allows you to correct, complete and validate the extracted data.',
    step3Title: 'Send',
    step3Body: 'The ticket is saved in the database, ready to be used by any business tool.',
    useCases: 'Fictional use cases presented',
    useCasesBody: 'The application offers 4 demo scenarios: IT Support, E-commerce, SaaS CRM and Developer Portal. These use cases illustrate the versatility of structured extraction from voice.',
    techStack: 'Tech stack',
    techStackBody: 'React, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL database), Gamilab SDK (real-time WebSocket), Lucide React (icons), PostHog (analytics).',
    aboutAudiogami: 'About Audiogami',
    aboutAudiogamiBody: 'Audiogami is a project developed by Gamilab that explores the applications of artificial intelligence applied to voice. The Gamilab API, at the heart of this demonstrator, enables the automatic and configurable transformation of audio streams into actionable data.\n\nThis demonstrator was developed by Memoways, a Gamilab implementation partner.',
    feedbackBtn: 'Give feedback / get in touch',
    close: 'Close',
  },
};

const BOOKING_URL = 'https://meeting.audiogami.com/team/audiogami/meet-ulrich';

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { language } = useLanguage();
  const t = content[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fade-in">
        <div className="sticky top-0 bg-white border-b border-light-gray px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-charcoal font-grotesk">{t.title}</h2>
            <p className="text-sm text-silver mt-0.5">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-off-white transition-colors text-slate hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          <section>
            <h3 className="text-base font-semibold text-charcoal font-grotesk mb-2">{t.whatIs}</h3>
            <p className="text-sm text-slate leading-relaxed">{t.whatIsBody}</p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-charcoal font-grotesk mb-3">{t.howItWorks}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-off-white rounded-xl p-4">
                <div className="w-9 h-9 rounded-full bg-rockman-blue flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">1. {t.step1Title}</p>
                  <p className="text-sm text-slate mt-0.5 leading-relaxed">{t.step1Body}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-off-white rounded-xl p-4">
                <div className="w-9 h-9 rounded-full bg-spicy-sweetcorn flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">2. {t.step2Title}</p>
                  <p className="text-sm text-slate mt-0.5 leading-relaxed">{t.step2Body}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-off-white rounded-xl p-4">
                <div className="w-9 h-9 rounded-full bg-rockman-blue flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">3. {t.step3Title}</p>
                  <p className="text-sm text-slate mt-0.5 leading-relaxed">{t.step3Body}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-base font-semibold text-charcoal font-grotesk mb-2">{t.useCases}</h3>
            <p className="text-sm text-slate leading-relaxed">{t.useCasesBody}</p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-charcoal font-grotesk mb-2">{t.techStack}</h3>
            <p className="text-sm text-slate leading-relaxed">{t.techStackBody}</p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-charcoal font-grotesk mb-2">{t.aboutAudiogami}</h3>
            <div className="space-y-2">
              {t.aboutAudiogamiBody.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-slate leading-relaxed">{para}</p>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-light-gray px-6 py-4 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rockman-blue text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-rockman-blue/90 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            {t.feedbackBtn}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-medium text-slate hover:bg-off-white transition-colors border border-light-gray"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
