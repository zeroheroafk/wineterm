/**
 * The homepage's editorial blocks: the newest published article leads the
 * page whatever its kind, and the latest analysis under the prices never
 * repeats it.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { publishedArticles } from "@/content/articles";
import { getHomeService } from "@/services/home";

/** Newest first, keeping the listed order for articles of the same day. */
const newestFirst = [...publishedArticles].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

describe("homepage", () => {
  it("leads with the newest published article, whatever its kind", async () => {
    const lead = await getHomeService().getLeadArticle();
    const [newest] = newestFirst;
    assert.ok(lead);
    assert.equal(lead.href, newest.href);
    assert.equal(lead.kind, newest.kind);
    assert.equal(lead.publishedAt, newest.publishedAt);
  });

  it("shows the latest analyses after the lead, never the lead itself", async () => {
    const home = getHomeService();
    const [lead, leadAnalysis, secondary] = await Promise.all([
      home.getLeadArticle(),
      home.getLeadAnalysis(),
      home.getSecondaryAnalysis(),
    ]);
    const expected = newestFirst
      .filter((article) => article.kind === "analysis" && article.href !== lead?.href)
      .slice(0, 3)
      .map((article) => article.id);
    const shown = [leadAnalysis, ...secondary].flatMap((article) =>
      article ? [article.id] : [],
    );
    assert.deepEqual(shown, expected);
  });
});
