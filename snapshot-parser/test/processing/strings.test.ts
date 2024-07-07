import { getStringsByIndex } from "../../src/processing/strings.js";
import { HeapString } from "../../src/sqlite/entities/heapString.js";
import { createTestSQLiteDB } from "../_factories/db.js";

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
  expect(dict["2"]).toEqual({ id: 2, index: 2, value: "b" });
  expect(dict["3"]).toEqual({ id: 3, index: 3, value: "c" });
});
