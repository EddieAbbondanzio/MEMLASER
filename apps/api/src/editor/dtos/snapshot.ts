export enum SnapshotState {
  Importing = "IMPORTING",
  Imported = "IMPORTED",
  Invalid = "INVALID",
}

export class SnapshotDTO {
  readonly state = SnapshotState.Imported;

  constructor(
    public name: string,
    public path: string,
    public fileSizeBytes: number,
    public importedAt: Date,
  ) {}
}

export class SnapshotBeingImportedDTO {
  readonly state = SnapshotState.Importing;

  constructor(
    public name: string,
    public path: string,
  ) {}
}
