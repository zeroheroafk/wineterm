/**
 * Consistency checks for the news stories: each is served at the address
 * it links to, carries the illustrative status while it is a sample, has
 * a credited hero image stored at its stated size, and is tagged with
 * known topics; the News navigation links only to topics with stories.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { newsStories } from "@/fixtures/news";
import { navSection } from "@/lib/navigation";
import { getNewsService } from "@/services/news";
import { NEWS_TOPIC_LABELS, type NewsTopic } from "@/services/types";

const PUBLIC = new URL("../../public/", import.meta.url);

/** Width and height from a baseline or progressive JPEG's frame header. */
function jpegSize(bytes: Buffer): { width: number; height: number } {
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  throw new Error("No JPEG frame header");
}

describe("news stories", () => {
  it("have unique ids and link to their own page", () => {
    const ids = newsStories.map((story) => story.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const story of newsStories) {
      assert.equal(story.href, `/news/${story.id}`);
      assert.equal(story.status, "illustrative", story.id);
      assert.ok(story.body.length > 0, story.id);
    }
  });

  it("carry known topics, each once", () => {
    for (const story of newsStories) {
      assert.ok(story.topics.length > 0, story.id);
      assert.equal(new Set(story.topics).size, story.topics.length, story.id);
      for (const topic of story.topics) {
        assert.ok(topic in NEWS_TOPIC_LABELS, `${story.id}: ${topic}`);
      }
    }
  });

  it("have a described, credited image stored at its stated size", () => {
    for (const story of newsStories) {
      const { image } = story;
      assert.equal(image.src, `/news/${story.id}.jpg`);
      assert.ok(image.alt.length > 0, story.id);
      assert.ok(image.credit.url.startsWith("https://"), story.id);
      assert.ok(image.credit.licence.length > 0, story.id);
      const file = readFileSync(new URL(image.src.slice(1), PUBLIC));
      assert.deepEqual(
        jpegSize(file),
        { width: image.width, height: image.height },
        story.id,
      );
    }
  });
});

describe("news service", () => {
  const news = getNewsService();

  it("lists the newest first", async () => {
    const latest = await news.getLatestStories();
    assert.equal(latest.length, newsStories.length);
    for (let i = 1; i < latest.length; i += 1) {
      assert.ok(latest[i - 1].publishedAt >= latest[i].publishedAt);
    }
  });

  it("relates stories that share a topic, never the story itself", async () => {
    for (const story of newsStories) {
      for (const other of await news.getRelatedStories(story.id)) {
        assert.notEqual(other.id, story.id);
        assert.ok(
          other.topics.some((topic) => story.topics.includes(topic)),
          `${story.id} → ${other.id}`,
        );
      }
    }
  });

  it("counts every tag once per story", async () => {
    const counts = await news.getTopicCounts();
    const tags = newsStories.reduce((total, s) => total + s.topics.length, 0);
    assert.equal(
      Object.values(counts).reduce((total, count) => total + count, 0),
      tags,
    );
  });

  it("has stories for every topic the News navigation links to", async () => {
    const counts = await news.getTopicCounts();
    const items = navSection("/news").items;
    assert.ok(items.length > 0);
    for (const item of items) {
      const topic = item.href.replace("/news/topic/", "") as NewsTopic;
      assert.ok(topic in NEWS_TOPIC_LABELS, item.href);
      assert.ok(counts[topic] > 0, item.href);
    }
  });
});
