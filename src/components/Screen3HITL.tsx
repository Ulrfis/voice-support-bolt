import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCases } from '../data/useCases';
import { supabase } from '../lib/supabase';
import type { Ticket, UseCaseId, Status, Priority, Category, Tag } from '../types';

interface Screen3HITLProps {
  useCaseId: UseCaseId;
  initialData: Partial<Ticket>;
  transcript: string;
  ticketId: string;
  onValidate: (ticketData: Partial<Ticket>) => void;
  onBack: () => void;
}

const statusOptions: Status[] = ['new', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
const priorityOptions: Priority[] = ['critical', 'high', 'medium', 'low'];
const tagOptions: Tag[] = ['urgent', 'recurring', 'first_contact', 'escalation', 'vip_customer', 'workaround_available'];

export function Screen3HITL({ useCaseId, initialData, transcript, ticketId, onValidate, onBack }: Screen3HITLProps) {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Ticket>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const useCase = useCases.find(uc => uc.id === useCaseId);

  if (!useCase) return <div>Error loading use case</div>;

  const updateField = async (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    setIsSaving(true);
    const { error } = await supabase
      .from('tickets')
      .update({ [field]: value })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating field:', error);
    }
    setIsSaving(false);
  };

  const toggleTag = async (tag: Tag) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    setFormData(prev => ({ ...prev, tags: newTags }));

    setIsSaving(true);
    const { error } = await supabase
      .from('tickets')
      .update({ tags: newTags })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating tags:', error);
    }
    setIsSaving(false);
  };

  const isFieldComplete = (field: string) => {
    const value = formData[field as keyof Ticket];
    return value !== undefined && value !== '' && value !== null;
  };

  const allRequiredFieldsComplete = useCase.requiredFields.every(isFieldComplete);

  const getFieldConfig = (fieldName: string) => {
    const configs: Record<string, { label: { fr: string; en: string }; type: string; required: boolean }> = {
      device: { label: { fr: 'Appareil', en: 'Device' }, type: 'text', required: true },
      symptoms: { label: { fr: 'Symptômes', en: 'Symptoms' }, type: 'textarea', required: true },
      frequency: { label: { fr: 'Fréquence', en: 'Frequency' }, type: 'text', required: true },
      environment: { label: { fr: 'Environnement', en: 'Environment' }, type: 'text', required: false },
      actions_tried: { label: { fr: 'Actions essayées', en: 'Actions tried' }, type: 'textarea', required: false },
      impact: { label: { fr: 'Impact', en: 'Impact' }, type: 'textarea', required: false },
      order_number: { label: { fr: 'Numéro de commande', en: 'Order number' }, type: 'text', required: true },
      problem_type: { label: { fr: 'Type de problème', en: 'Problem type' }, type: 'text', required: true },
      product_description: { label: { fr: 'Description produit', en: 'Product description' }, type: 'text', required: true },
      delivery_status: { label: { fr: 'Statut livraison', en: 'Delivery status' }, type: 'text', required: false },
      desired_resolution: { label: { fr: 'Résolution souhaitée', en: 'Desired resolution' }, type: 'textarea', required: false },
      purchase_date: { label: { fr: 'Date d\'achat', en: 'Purchase date' }, type: 'text', required: false },
      feature: { label: { fr: 'Fonctionnalité', en: 'Feature' }, type: 'text', required: true },
      steps_to_reproduce: { label: { fr: 'Étapes de reproduction', en: 'Steps to reproduce' }, type: 'textarea', required: false },
      request_type: { label: { fr: 'Type de demande', en: 'Request type' }, type: 'text', required: true },
      description: { label: { fr: 'Description', en: 'Description' }, type: 'textarea', required: true },
      urgency: { label: { fr: 'Urgence', en: 'Urgency' }, type: 'text', required: true },
      context: { label: { fr: 'Contexte', en: 'Context' }, type: 'textarea', required: false },
      expected_behavior: { label: { fr: 'Comportement attendu', en: 'Expected behavior' }, type: 'textarea', required: false },
      ideas_needs: { label: { fr: 'Idées / Besoins', en: 'Ideas / Needs' }, type: 'textarea', required: false }
    };

    return configs[fieldName];
  };

  const renderField = (fieldName: string) => {
    const config = getFieldConfig(fieldName);
    if (!config) return null;

    const value = formData[fieldName as keyof Ticket] || '';
    const isRequired = useCase.requiredFields.includes(fieldName);
    const isComplete = isFieldComplete(fieldName);

    return (
      <div key={fieldName} className="space-y-1">
        <label className="block">
          <span className="text-sm font-medium text-charcoal">
            {config.label[language]}
            {isRequired && <span className="text-spicy-sweetcorn ml-1">*</span>}
            {!isRequired && <span className="text-silver text-xs ml-1">({t('optionalField')})</span>}
          </span>
        </label>
        {config.type === 'textarea' ? (
          <textarea
            value={String(value)}
            onChange={(e) => updateField(fieldName, e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-spicy-sweetcorn focus:border-transparent ${
              isRequired && !isComplete ? 'border-spicy-sweetcorn bg-chunky-bee bg-opacity-10' : 'border-light-gray'
            }`}
            rows={2}
          />
        ) : (
          <input
            type="text"
            value={String(value)}
            onChange={(e) => updateField(fieldName, e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-spicy-sweetcorn focus:border-transparent ${
              isRequired && !isComplete ? 'border-spicy-sweetcorn bg-chunky-bee bg-opacity-10' : 'border-light-gray'
            }`}
          />
        )}
      </div>
    );
  };

  const getFieldsForUseCase = () => {
    const fieldsByUseCase: Record<UseCaseId, string[]> = {
      it_support: ['device', 'symptoms', 'frequency', 'environment', 'actions_tried', 'impact'],
      ecommerce: ['order_number', 'problem_type', 'product_description', 'delivery_status', 'desired_resolution', 'purchase_date'],
      saas: ['feature', 'symptoms', 'impact', 'environment', 'steps_to_reproduce', 'frequency'],
      dev_portal: ['request_type', 'description', 'urgency', 'context', 'expected_behavior', 'ideas_needs']
    };

    return fieldsByUseCase[useCaseId] || [];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-2 text-slate hover:text-charcoal transition-colors text-sm"
      >
        ← {language === 'fr' ? 'Retour à l\'enregistrement' : 'Back to recording'}
      </button>

      <div className="bg-off-white border border-light-gray rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-charcoal font-grotesk">
            {t('reviewAndEdit')}
          </h2>
          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-xs text-slate animate-pulse">
                {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
              </span>
            )}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-xs text-rockman-blue hover:text-joust-blue font-medium transition-colors flex items-center gap-1"
            >
              {showTranscript ? '▼' : '▶'} {language === 'fr' ? 'Transcript' : 'Transcript'}
            </button>
          </div>
        </div>

        {showTranscript && (
          <div className="mb-3 p-3 bg-rockman-blue bg-opacity-5 border border-rockman-blue border-opacity-20 rounded">
            <p className="text-xs font-medium text-charcoal mb-1">{language === 'fr' ? 'Transcript original' : 'Original transcript'}</p>
            <p className="text-xs text-slate whitespace-pre-wrap">{transcript}</p>
          </div>
        )}

        {allRequiredFieldsComplete ? (
          <p className="text-spicy-sweetcorn text-xs font-medium mb-3">{t('allComplete')}</p>
        ) : (
          <p className="text-chunky-bee text-xs font-medium mb-3">{t('someFieldsMissing')}</p>
        )}

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block mb-1">
              <span className="text-sm font-medium text-charcoal">{t('status')}</span>
            </label>
            <select
              value={formData.status || 'new'}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-light-gray rounded focus:ring-2 focus:ring-spicy-sweetcorn"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {t(`status${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">
              <span className="text-sm font-medium text-charcoal">{t('priority')}</span>
            </label>
            <select
              value={formData.priority || 'medium'}
              onChange={(e) => updateField('priority', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-light-gray rounded focus:ring-2 focus:ring-spicy-sweetcorn"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>
                  {t(`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">
              <span className="text-sm font-medium text-charcoal">{t('category')}</span>
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-light-gray rounded focus:ring-2 focus:ring-spicy-sweetcorn"
            >
              <option value="">-</option>
              {useCase.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="block mb-1">
            <span className="text-sm font-medium text-charcoal">{t('tags')}</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {tagOptions.map(tag => {
              const isSelected = (formData.tags || []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-spicy-sweetcorn text-white'
                      : 'bg-off-white border border-light-gray text-slate hover:bg-light-gray'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-light-gray pt-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getFieldsForUseCase().map(renderField)}
          </div>
        </div>

        {!allRequiredFieldsComplete && (
          <div className="mb-3 flex items-start gap-2 bg-chunky-bee bg-opacity-10 border border-chunky-bee border-opacity-30 rounded-lg p-3">
            <span className="text-chunky-bee shrink-0 mt-0.5">🎤</span>
            <p className="text-xs text-charcoal">
              {language === 'fr'
                ? 'Certains champs sont manquants. Vous pouvez les compléter ici ou revenir à l\'enregistrement pour les dicter à voix haute.'
                : 'Some fields are missing. You can fill them here or go back to recording to dictate them aloud.'}
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-off-white border border-light-gray text-charcoal rounded hover:bg-light-gray font-medium transition-colors text-sm shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {language === 'fr' ? 'Dicter à la voix' : 'Dictate by voice'}
          </button>
          <button
            onClick={() => onValidate({ ...formData, raw_transcript: transcript })}
            disabled={!allRequiredFieldsComplete}
            className="flex-1 px-4 py-2 bg-spicy-sweetcorn text-white rounded hover:bg-chunky-bee disabled:bg-silver disabled:cursor-not-allowed font-medium transition-colors shadow-sm text-sm"
          >
            {t('validate')}
          </button>
        </div>
      </div>
    </div>
  );
}
