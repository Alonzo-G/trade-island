import assert from "node:assert/strict";
import test from "node:test";
import { parseFollowUpPrefix, formatFollowUpSuffix } from "../../src/features/todos/followUp.ts";

test("follow-up tags are stripped from the title and land in their fields", () => {
  assert.deepEqual(parseFollowUpPrefix("@Acme @US #7 send samples quote"), {
    title: "send samples quote", customer: "Acme", country: "US", followUpDays: 7,
  });
  assert.deepEqual(parseFollowUpPrefix("@客户 @德国 #30 寄样"), {
    title: "寄样", customer: "客户", country: "德国", followUpDays: 30,
  });
});

test("a todo without tags is unchanged, and partial tags are kept", () => {
  assert.deepEqual(parseFollowUpPrefix("plain todo"), { title: "plain todo" });
  assert.deepEqual(parseFollowUpPrefix("call @Bob"), { title: "call", customer: "Bob" });
  assert.deepEqual(parseFollowUpPrefix("quote #5"), { title: "quote", followUpDays: 5 });
});

test("an out-of-range cadence is not a cadence; tags inside words need a boundary", () => {
  assert.deepEqual(parseFollowUpPrefix("#999 extreme"), { title: "extreme" });
  assert.deepEqual(parseFollowUpPrefix("abc#5def"), { title: "abc#5def" });
  assert.deepEqual(parseFollowUpPrefix("see @email"), { title: "see", customer: "email" });
});

test("formatting appends the tags back; round-trip parses to the same fields", () => {
  const fields = { title: "send quote", customer: "Acme", country: "US", followUpDays: 7 };
  const text = formatFollowUpSuffix(fields);
  assert.equal(text, "send quote @Acme @US #7");
  assert.deepEqual(parseFollowUpPrefix(text), fields);
  assert.equal(formatFollowUpSuffix({ title: "plain" }), "plain");
});
