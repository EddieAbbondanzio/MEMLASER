import * as v8 from "v8";

class Foo {
  constructor(
    public num = 1,
    public bool = true,
  ) {}
}

class Bar {
  constructor() {}
}

async function main(): Promise<void> {
  console.log("Generating sample heapdump");

  const _foos = [new Foo(), new Foo(), new Foo()];
  const _bars = [new Bar()];

  v8.writeHeapSnapshot("out/foo-bar-3.heapsnapshot");

  console.log("Done!");
}
void main();
