import test from "node:test";
import assert from "node:assert/strict";
import { runPiiAndSecretCheck, extractLivePrivateTokens } from "../scripts/check-staged.js";

test("PII and Secret Detection Test Suite", async (t) => {
  await t.test("1. Successfully scans repository without false positives", async () => {
    const passed = await runPiiAndSecretCheck(true);
    assert.strictEqual(passed, true, "Existing tracked repo files must not trigger PII/Secret flags");
  });

  await t.test("2. Dynamic Live Data token extraction from .data/ and data/", async () => {
    const dynamicRules = extractLivePrivateTokens();
    assert.ok(Array.isArray(dynamicRules), "Expected dynamic rules array");
    // If local database or user import YAML exists, verify dynamic tokens are extracted
    if (dynamicRules.length > 0) {
      assert.ok(
        dynamicRules.some((r) => r.category === "Cross-Pollinated Live Data"),
        "Expected Cross-Pollinated Live Data category rules"
      );
    }
  });
});
