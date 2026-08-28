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

export function getOutlookService(): OutlookService {
  service ??= new FixtureOutlookService();
  return service;
}
