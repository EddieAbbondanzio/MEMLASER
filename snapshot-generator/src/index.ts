import * as v8 from "v8";

class Foo {
  constructor() {}
}

class Bar {
  constructor() {}
}

async function main(): Promise<void> {
  console.log("Generating sample heapdump");

  const _foos = [new Foo(), new Foo(), new Foo()];
  const _bars = [new Bar()];

  v8.writeHeapSnapshot("out/foo-bar.heapsnapshot");

  console.log("Done!");
}
void main();
