export enum SnapshotState {
  Importing = "IMPORTING",
  Imported = "IMPORTED",
  Invalid = "INVALID",
}

export interface SnapshotDTO {
  readonly state: SnapshotState.Imported;
  readonly name: string;
  readonly path: string;
  readonly fileSize: number;
  readonly importedAt: Date;
}

export interface SnapshotBeingImportedDTO {
  readonly state: SnapshotState.Importing;
  readonly name: string;
  readonly path: string;
}
