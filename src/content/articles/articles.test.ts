/**
 * Consistency checks for the published articles and monthly reports:
 * each is served at the address its preview links to, every citation
 * names a listed source and every source is cited, a chart shows the
 * figures the paragraph it follows states, and every table row fills its
 * columns.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { publishedArticles } from "@/content/articles";
import { formatShare } from "@/lib/format";

describe("published articles", () => {
  it("have unique ids and link to their own page", () => {
    const ids = publishedArticles.map((article) => article.id);
    assert.equal(new Set(ids).size, ids.length);
    const sections = { analysis: "analysis", "monthly-report": "monthly-reports" };
    for (const article of publishedArticles) {
      assert.ok(article.kind in sections, `${article.id} is a ${article.kind}`);
      const section = sections[article.kind as keyof typeof sections];
      assert.equal(article.href, `/insights/${section}/${article.id}`);
    }
  });

  it("cite only listed sources, and cite each of them", () => {
    for (const article of publishedArticles) {
      const cited = new Set([
        ...article.body.flatMap((p) => p.cites ?? []),
        ...(article.tables ?? []).flatMap((t) => t.cites),
      ]);
      for (const number of cited) {
        assert.ok(
          number >= 1 && number <= article.sources.length,
          `${article.id} cites [${number}]`,
        );
      }
      assert.equal(cited.size, article.sources.length, article.id);
    }
  });

  it("chart the figures stated in the paragraph before the chart", () => {
    for (const article of publishedArticles) {
      if (!article.chart) continue;
      const paragraph = article.body[article.chart.afterParagraph];
      assert.ok(paragraph, `${article.id} chart position`);
      for (const bar of article.chart.bars) {
        assert.ok(
          paragraph.text.includes(formatShare(bar.percent)),
          `${article.id}: ${bar.label} ${formatShare(bar.percent)}`,
        );
      }
    }
  });

  it("fill every column of their tables, after a paragraph they have", () => {
    for (const article of publishedArticles) {
      for (const table of article.tables ?? []) {
        assert.ok(article.body[table.afterParagraph], `${article.id}: ${table.title}`);
        for (const row of table.rows) {
          assert.equal(row.cells.length, table.columns.length, `${table.title}: ${row.label}`);
        }
      }
    }
  });
});
