import type { UseCaseId } from '../types';

interface FieldRule {
  minWords?: number;
  minLength?: number;
  pattern?: RegExp;
}

const FIELD_RULES: Record<string, Record<string, FieldRule>> = {
  it_support: {
    device: { minWords: 1, minLength: 3 },
    symptoms: { minWords: 3, minLength: 10 },
    frequency: { minWords: 1, minLength: 3 },
    environment: { minWords: 1, minLength: 3 },
    actions_tried: { minWords: 2, minLength: 5 },
  },
  ecommerce: {
    order_number: { minLength: 2, pattern: /\d/ },
    problem_type: { minWords: 1, minLength: 3 },
    product_description: { minWords: 2, minLength: 5 },
    delivery_status: { minWords: 1, minLength: 3 },
    desired_resolution: { minWords: 2, minLength: 5 },
  },
  saas: {
    feature: { minWords: 1, minLength: 3 },
    symptoms: { minWords: 3, minLength: 10 },
    impact: { minWords: 2, minLength: 5 },
    environment: { minWords: 1, minLength: 3 },
    steps_to_reproduce: { minWords: 3, minLength: 10 },
  },
  dev_portal: {
    request_type: { minWords: 1, minLength: 3 },
    description: { minWords: 3, minLength: 10 },
    urgency: { minWords: 1, minLength: 3 },
    context: { minWords: 2, minLength: 5 },
    expected_behavior: { minWords: 2, minLength: 5 },
  },
};

const DEFAULT_RULE: FieldRule = { minWords: 1, minLength: 2 };

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isFieldSufficient(fieldName: string, value: unknown, useCaseId: UseCaseId): boolean {
  if (value === undefined || value === null) return false;
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return false;

  const rule = FIELD_RULES[useCaseId]?.[fieldName] || DEFAULT_RULE;

  if (rule.minLength && text.length < rule.minLength) return false;
  if (rule.minWords && countWords(text) < rule.minWords) return false;
  if (rule.pattern && !rule.pattern.test(text)) return false;

  return true;
}

export type FieldStatus = 'empty' | 'insufficient' | 'sufficient';

export function getFieldStatus(fieldName: string, value: unknown, useCaseId: UseCaseId): FieldStatus {
  if (value === undefined || value === null) return 'empty';
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return 'empty';
  return isFieldSufficient(fieldName, value, useCaseId) ? 'sufficient' : 'insufficient';
}
