export enum SnapshotState {
  Importing = "IMPORTING",
  Imported = "IMPORTED",
  Invalid = "INVALID",
}

export interface SnapshotDTO {
  readonly state: SnapshotState.Imported;
  readonly name: string;
  readonly path: string;
  readonly stats: SnapshotStatsDTO;
}

export interface SnapshotBeingImportedDTO {
  readonly state: SnapshotState.Importing;
  readonly name: string;
  readonly path: string;
}

export interface SnapshotStatsDTO {
  readonly fileSize: number;
  readonly createdAt: Date;
  readonly importedAt: Date;
}

export enum ImportSnapshotErrorCode {
  InvalidFile = "INVALID_FILE",
  Duplicate = "DUPLICATE",
}
export type ImportSnapshotValidationDTO =
  | { valid: true }
  | { valid: false; errorMessage: string; errorCode: ImportSnapshotErrorCode };

// Groups of instances categorized by their constructor.
export interface SummaryGroupDTO {
  constructor: string;
  distance: number;
  shallowSize: string;
  retainedSize: string;
  instanceCount: number;
}
