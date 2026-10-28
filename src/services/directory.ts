/**
 * Directory service: the companies listed in src/content/directory.
 * Typed interface, swappable for a database later.
 */

import { directoryCompanies } from "@/content/directory";
import type { DirectoryCompany } from "@/services/types";

export interface DirectoryService {
  /** Every listed company, by name. */
  getCompanies(): Promise<DirectoryCompany[]>;
}

const byName = new Intl.Collator("en-GB", { sensitivity: "base" });

class StaticDirectoryService implements DirectoryService {
  async getCompanies(): Promise<DirectoryCompany[]> {
    return [...directoryCompanies].sort((a, b) =>
      byName.compare(a.name, b.name),
    );
  }
}

let service: DirectoryService | null = null;

export function getDirectoryService(): DirectoryService {
  service ??= new StaticDirectoryService();
  return service;
}
