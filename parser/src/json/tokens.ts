// Src: https://github.com/uhop/stream-json/wiki/Parser#stream-of-tokens
export type Token =
  // object
  | { name: "startObject" }
  // sequence of object properties: key, then value
  | { name: "endObject" }

  // array
  | { name: "startArray" }
  // sequence of values
  | { name: "endArray" }

  // key
  | { name: "startKey" }
  // sequence of string chunks:
  | { name: "stringChunk"; value: string }
  | { name: "endKey" }
  // when packing:
  | { name: "keyValue"; value: string }

  // string
  | { name: "startString" }
  // sequence of string chunks:
  | { name: "stringChunk"; value: string }
  | { name: "endString" }
  // when packing:
  | { name: "stringValue"; value: string }

  // number
  | { name: "startNumber" }
  // sequence of number chunks (as strings):
  | { name: "numberChunk"; value: string }
  | { name: "endNumber" }
  // when packing:
  | { name: "numberValue"; value: string }

  // null, true, false
  | { name: "nullValue"; value: null }
  | { name: "trueValue"; value: true }
  | { name: "falseValue"; value: false };
