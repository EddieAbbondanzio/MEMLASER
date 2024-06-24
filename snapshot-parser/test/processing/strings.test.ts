import { getStringsByIndex } from "../../src/processing/strings";
import { createInMemorySQLiteDB } from "../_factories/db";

test("getStringsByIndex", async () => {
  const db = await createInMemorySQLiteDB();

  await db
    .insertInto("strings")
    .values([
      { index: 1, value: "a" },
      { index: 2, value: "b" },
      { index: 3, value: "c" },
      { index: 4, value: "d" },
    ])
    .execute();

  const dict = await getStringsByIndex(db, [2, 3]);
  expect(dict["2"]).toEqual({ index: 2, value: "b" });
  expect(dict["3"]).toEqual({ index: 3, value: "c" });
});
