// See: https://v8docs.nodesource.com/node-22.4/df/d0c/v8-profiler_8h_source.html#l00546
export enum EdgeType {
  Context = "context",
  Element = "element",
  Property = "property",
  Internal = "internal",
  Hidden = "hidden",
  Shortcut = "shortcut",
  Weak = "weak",
}

export enum EdgeField {
  Type = "type",
  NameOrIndex = "name_or_index",
  ToNode = "to_node",
}

const IGNORED_FOR_RETAINED_SIZE = [EdgeType.Shortcut];

export function isRetainingEdge(edgeType: EdgeType) {
  return !IGNORED_FOR_RETAINED_SIZE.includes(edgeType);
}
