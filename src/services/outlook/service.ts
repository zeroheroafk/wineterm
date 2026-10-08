/**
 * Outlook service: serves the current Market Outlook edition.
 * Fixture-backed; a CMS or editorial workflow replaces it later.
 */

import { currentOutlook } from "@/fixtures/outlook";
import type { OutlookEdition } from "@/services/outlook/types";

export interface OutlookService {
  getCurrentEdition(): Promise<OutlookEdition>;
}

class FixtureOutlookService implements OutlookService {
  async getCurrentEdition(): Promise<OutlookEdition> {
    return currentOutlook;
  }
}

let service: OutlookService | null = null;

/**
 * Whether /outlook is served. The only edition is a sample written against
 * the fixtures, so the page is withheld, and no page links it, until a real
 * edition is written.
 */
export const OUTLOOK_PUBLISHED = false;

export function getOutlookService(): OutlookService {
  service ??= new FixtureOutlookService();
  return service;
}
