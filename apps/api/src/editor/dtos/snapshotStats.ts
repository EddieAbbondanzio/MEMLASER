export class SnapshotStatsDTO {
  constructor(
    public size: number,
    public createdAt: Date,
    public importedAt: Date,
  ) {}
}
