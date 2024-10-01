/* eslint-disable @typescript-eslint/no-unused-vars */
import * as v8 from "v8";

class Parent {
  children: Child[] = [];
  constructor(public name: string) {}
}

class Child {
  siblings: Child[] = [];
  constructor(public name: string) {}
}

class Foo {
  constructor(
    public num = 1,
    public bool = true,
  ) {}
}

class Bar {
  constructor() {}
}

// Build this out to be more advanced. We should use a repl and have it start up
// various demo apps to grab heap dumps off of.

async function main(): Promise<void> {
  console.log("Generating sample heapdump");
  circularReferencesHeapDump();
  console.log("Done!");
}
void main();

function fooBarHeapDump() {
  const _foos = [new Foo(), new Foo(), new Foo()];
  const _bars = [new Bar()];

  v8.writeHeapSnapshot("out/foo-bar.heapsnapshot");
}

function circularReferencesHeapDump() {
  const parent = new Parent("Peter");
  const childA = new Child("Chris");
  const childB = new Child("Meg");
  parent.children = [childA, childB];
  childA.siblings = [childB];
  childB.siblings = [childA];

  v8.writeHeapSnapshot("out/circular-references.heapsnapshot");
}
