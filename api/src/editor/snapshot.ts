import * as p from "path";

export class Snapshot {
  id: string;
  name: string;
  path: string;
  createdAt: Date;

  constructor(path: string) {
    // TODO: Fix this lol. Use nanoid?
    this.id = "1";
    this.name = p.basename(path);
    this.path = path;
    this.createdAt = new Date();
  }
}
