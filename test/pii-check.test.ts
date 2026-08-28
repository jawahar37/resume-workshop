import test from "node:test";
import assert from "node:assert/strict";
import { runPiiAndSecretCheck } from "../scripts/check-staged.js";

test("PII and Secret Detection Test Suite", async (t) => {
  await t.test("1. Successfully scans repository without false positives", async () => {
    const passed = await runPiiAndSecretCheck(true);
    assert.strictEqual(passed, true, "Existing tracked repo files must not trigger PII/Secret flags");
  });
});
