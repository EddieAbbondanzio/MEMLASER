export class Snapshot {
  constructor(
    public name: string,
    public path: string,
    public fileSizeBytes: number,
    public importedAt: Date,
  ) {}
}
