export class Snapshot {
  constructor(
    public name: string,
    public path: string,
    public originalFileSize: string,
    public importedDate: Date,
  ) {}
}
