/**
 * Consistency checks for the directory listings: ids that serve as
 * anchors without clashing with a category's, categories named once per
 * company, and addresses and check dates that parse; and a navigation
 * link to each category's section.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { directoryCompanies } from "@/content/directory";
import { primaryNavigation } from "@/lib/navigation";
import { DIRECTORY_CATEGORIES } from "@/services/types";

describe("directory categories", () => {
  it("each have a navigation link to their section, in order", () => {
    const directory = primaryNavigation.find(
      (section) => section.href === "/directory",
    );
    assert.deepEqual(
      directory?.items.map((item) => item.href),
      DIRECTORY_CATEGORIES.map((category) => `/directory#${category}`),
    );
  });
});

describe("directory listings", () => {
  it("have unique ids that are slugs and no category's", () => {
    const ids = directoryCompanies.map((company) => company.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id);
      assert.ok(!(DIRECTORY_CATEGORIES as string[]).includes(id), id);
    }
  });

  it("name each category once, the main one apart from the others", () => {
    for (const company of directoryCompanies) {
      const categories = [company.category, ...company.otherCategories];
      assert.equal(new Set(categories).size, categories.length, company.id);
    }
  });

  it("link to https addresses and date the check against their sources", () => {
    for (const company of directoryCompanies) {
      assert.ok(company.sources.length > 0, company.id);
      for (const url of [company.website, ...company.sources]) {
        assert.equal(new URL(url).protocol, "https:", `${company.id}: ${url}`);
      }
      assert.match(company.checkedAt, /^\d{4}-\d{2}-\d{2}$/, company.id);
      assert.equal(
        new Date(company.checkedAt).toISOString().slice(0, 10),
        company.checkedAt,
        company.id,
      );
    }
  });
});
