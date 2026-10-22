/**
 * Consistency checks for the Industry stories: unique ids, a date and a
 * linked source on each, and every coverage topic with at least one story.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { industryStories } from "@/content/industry";
import { INDUSTRY_TOPIC_LABELS, type IndustryTopic } from "@/services/types";

describe("industry stories", () => {
  it("have unique ids, a date and a linked source", () => {
    const ids = industryStories.map((story) => story.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const story of industryStories) {
      assert.match(story.publishedAt, /^\d{4}-\d{2}-\d{2}$/, story.id);
      assert.ok(!Number.isNaN(Date.parse(story.publishedAt)), story.id);
      assert.ok(story.source.name.length > 0, story.id);
      assert.match(story.source.url, /^https:\/\//, story.id);
    }
  });

  it("cover every topic", () => {
    for (const topic of Object.keys(INDUSTRY_TOPIC_LABELS) as IndustryTopic[]) {
      assert.ok(
        industryStories.some((story) => story.topic === topic),
        topic,
      );
    }
  });
});
