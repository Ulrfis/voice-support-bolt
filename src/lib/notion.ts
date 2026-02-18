import type { Ticket } from '../types';

export function isNotionConfigured(): boolean {
  return !!(import.meta.env.VITE_NOTION_TOKEN && import.meta.env.VITE_NOTION_DATABASE_ID);
}

export async function pushTicketToNotion(
  _ticket: Ticket
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  if (!isNotionConfigured()) {
    return { success: false, error: 'not_configured' };
  }

  // TODO: Proxy through a Supabase Edge Function to avoid CORS
  // The Notion API does not allow direct browser requests
  // Edge function should POST to https://api.notion.com/v1/pages
  // with Authorization: Bearer VITE_NOTION_TOKEN
  // and body mapping ticket fields to Notion page properties
  return { success: false, error: 'not_implemented' };
}
