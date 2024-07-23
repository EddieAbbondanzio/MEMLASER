import { HeapString } from "@memlaser/database";
import { getStringsByIndex } from "../../src/processing/strings.js";
import { createTestSQLiteDB } from "../_factories/db.js";
import { test } from "node:test";
import assert from "node:assert";

test("getStringsByIndex", async () => {
  const db = await createTestSQLiteDB();

  await db
    .createQueryBuilder()
    .insert()
    .into(HeapString)
    .values([
      { index: 1, value: "a" },
      { index: 2, value: "b" },
      { index: 3, value: "c" },
      { index: 4, value: "d" },
    ])
    .execute();

  const dict = await getStringsByIndex(db, [2, 3]);

  assert.strictEqual(dict["2"], { id: 2, index: 2, value: "b" });
  assert.strictEqual(dict["3"], { id: 3, index: 3, value: "c" });
});
